import {
	createWalletClient,
	createPublicClient,
	http,
	Hex,
	TransactionReceipt,
	Chain,
	WalletClient,
	PublicClient,
	Address
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, hardhat } from 'viem/chains';
import {
	LERP_REALM_ABI, // Need ABI for updateClaimsMerkleRoot
	CONFIG,
	COMPUTE_COLLECTIONS,
	ClaimsPushHashResult,
	ClaimsComputeResult, // To fetch latest computed claims
	ComputeResult,
	PublicRealmConfig
} from '..';
import { MongoClient, Db, UpdateResult, Collection } from 'mongodb';
import { getLastDbResult } from './helpers/getLastDbResult'; // Use shared helper

// Define data structure for the result of pushing one realm's hash
type PushClaimsHashResultData = ClaimsPushHashResult['data'];

// Helper to find the correct chain definition (could be shared)
function getChainDefinition(chainId: number): Chain {
	if (chainId === mainnet.id) return mainnet;
	if (chainId === hardhat.id) return hardhat;
	console.warn(`Chain ID ${chainId} not found in predefined chains, using generic definition.`);
	return {
		id: chainId,
		name: `Chain ${chainId}`,
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpcUrls: { default: { http: [process.env.RPC_URL || ''] } }, // TODO: Handle multiple RPCs based on chainId
	};
}

// Helper to save individual push results
async function savePushResultToDB(
	dbClient: MongoClient,
	realmId: number,
	merkleRoot: Hex,
	resultData: PushClaimsHashResultData
) {
	try {
		const db: Db = dbClient.db(process.env.MONGO_DBNAME || "lerp");
		const collection = db.collection<ClaimsPushHashResult>(COMPUTE_COLLECTIONS.ClaimsPushHashResult);

		// Use a composite key or unique ID for each realm-root push attempt
		const docId = `${realmId}-${merkleRoot}`;

		const updateData: Partial<ClaimsPushHashResult> = {
			configChecksum: CONFIG.checksum,
			timestamp: new Date(),
			data: resultData
		};

		const updateResult: UpdateResult = await collection.updateOne(
			{ _id: docId as any },
			{ $set: updateData },
			{ upsert: true }
		);

		if (updateResult.upsertedCount > 0) {
			console.log(`Inserted push hash result for realm ${realmId}, root ${merkleRoot} into DB.`);
		} else if (updateResult.modifiedCount > 0) {
			console.log(`Updated push hash result for realm ${realmId}, root ${merkleRoot} in DB.`);
		} else {
			console.log(`Push hash result for realm ${realmId}, root ${merkleRoot} exists and was not modified.`);
		}
	} catch (dbError) {
		console.error(`Error saving push hash result for realm ${realmId}, root ${merkleRoot} to DB:`, dbError);
	}
}

// --- Main Function ---
export async function pushClaimsHashes(dbClient: MongoClient): Promise<PushClaimsHashResultData[]> {
	const results: PushClaimsHashResultData[] = [];
	const config = CONFIG;
	const rpcUrl = process.env.RPC_URL; // TODO: Needs multi-chain support
	const privateKey = process.env.PRIVATE_KEY as Hex | undefined;

	if (!rpcUrl || !privateKey) {
		console.error('RPC_URL or PRIVATE_KEY not set.');
		// Cannot proceed without credentials
		return [{ success: false, error: 'RPC_URL or PRIVATE_KEY not set', realmId: 0, merkleRoot: '0x' }];
	}

	// 1. Fetch the latest computed claims data
	console.log("Fetching latest computed claims data...");
	const lastComputedClaims = await getLastDbResult<ClaimsComputeResult>(dbClient, COMPUTE_COLLECTIONS.ClaimsComputeResult);

	if (!lastComputedClaims?.data?.realms) {
		console.error("Could not find the last computed claims data in the database.");
		return [{ success: false, error: 'Last computed claims data not found', realmId: 0, merkleRoot: '0x' }];
	}

	const computedRealms = lastComputedClaims.data.realms;
	console.log(`Found computed claims for ${Object.keys(computedRealms).length} realms.`);

	// Prepare clients (TODO: Handle multiple chains)
	const account = privateKeyToAccount(privateKey);
	// Assuming all realms use the same chain for now based on single RPC_URL
	const tempChainId = config.realms[0]?.contract.chain ?? hardhat.id; // Use first realm's chain or default
	const chain = getChainDefinition(tempChainId);
	const walletClient: WalletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
	const publicClient: PublicClient = createPublicClient({ chain, transport: http(rpcUrl) });


	// 2. Iterate through each realm in the computed data
	for (const realmIdStr in computedRealms) {
		const realmId = parseInt(realmIdStr, 10);
		const claimData = computedRealms[realmId];
		const targetMerkleRoot = claimData.claimMerkleRoot;
		let realmResultData: PushClaimsHashResultData;

		const realmConfig = config.realms.find(r => r.stakeRealmId === realmId);
		if (!realmConfig) {
			console.warn(`Config not found for realm ID ${realmId}. Skipping push.`);
			continue;
		}
		const realmContractAddress = realmConfig.contract.address as Address;

		// Skip if root is empty or zero (no claims)
		if (!targetMerkleRoot || targetMerkleRoot === '0x' || targetMerkleRoot === '0x0000000000000000000000000000000000000000000000000000000000000000') {
			console.log(`Skipping push for realm ${realmId}: No claims or empty Merkle root.`);
			realmResultData = { realmId, merkleRoot: targetMerkleRoot || '0x', success: true, status: 'skipped_no_claims' };
			results.push(realmResultData);
			await savePushResultToDB(dbClient, realmId, targetMerkleRoot || '0x', realmResultData);
			continue;
		}

		// 3. Check if this root was already successfully pushed for this realm
		try {
			const db: Db = dbClient.db("lerp");
			const collection = db.collection<ClaimsPushHashResult>(COMPUTE_COLLECTIONS.ClaimsPushHashResult);
			const docId = `${realmId}-${targetMerkleRoot}`;
			const existingPush = await collection.findOne({ _id: docId as any });

			if (existingPush?.data?.success === true) {
				console.log(`Merkle root ${targetMerkleRoot} for realm ${realmId} was already successfully pushed. Skipping.`);
				realmResultData = { ...existingPush.data, status: 'skipped_duplicate' };
				results.push(realmResultData);
				// No need to save again
				continue;
			}
		} catch (dbCheckError: any) {
			const errorMsg = `DB error checking existing push for realm ${realmId}: ${dbCheckError.message}`;
			console.error(errorMsg);
			realmResultData = { realmId, merkleRoot: targetMerkleRoot, success: false, error: errorMsg };
			results.push(realmResultData);
			await savePushResultToDB(dbClient, realmId, targetMerkleRoot, realmResultData);
			continue; // Skip to next realm on DB error
		}

		// 4. Push the hash
		try {
			console.log(`Attempting to push claims root ${targetMerkleRoot} to realm ${realmId} (${realmContractAddress})...`);

			// TODO: Handle different chains per realm contract address
			// This currently assumes all realm contracts are on the same chain as walletClient

			const hash = await walletClient.writeContract({
				address: realmContractAddress,
				abi: LERP_REALM_ABI, // Use LerpRealm ABI
				functionName: 'updateClaimsMerkleRoot', // Function name in LerpRealm
				args: [targetMerkleRoot],
				chain: chain,
				account: account,
			});

			console.log(`Tx sent for realm ${realmId}: ${hash}. Waiting for receipt...`);
			const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash });
			console.log(`Tx confirmed for realm ${realmId} in block ${receipt.blockNumber}. Status: ${receipt.status}`);

			if (receipt.status === 'success') {
				realmResultData = {
					realmId,
					merkleRoot: targetMerkleRoot,
					success: true,
					transactionHash: hash,
					blockNumber: receipt.blockNumber,
					gasUsed: receipt.gasUsed.toString(),
					effectiveGasPrice: receipt.effectiveGasPrice.toString(),
					status: receipt.status,
				};
			} else {
				const errorMsg = `Tx reverted for realm ${realmId}: ${hash}`;
				realmResultData = {
					realmId,
					merkleRoot: targetMerkleRoot,
					success: false,
					error: errorMsg,
					transactionHash: hash,
					blockNumber: receipt.blockNumber,
					gasUsed: receipt.gasUsed.toString(),
					effectiveGasPrice: receipt.effectiveGasPrice.toString(),
					status: receipt.status,
				};
			}
		} catch (error: any) {
			const errorMsg = `Error pushing claims root for realm ${realmId}: ${error.message || 'Unknown error'}`;
			console.error(errorMsg);
			realmResultData = { realmId, merkleRoot: targetMerkleRoot, success: false, error: errorMsg };
		}

		results.push(realmResultData);
		await savePushResultToDB(dbClient, realmId, targetMerkleRoot, realmResultData);

	} // End realm loop

	console.log("Finished pushing claim hashes.");
	return results;
}