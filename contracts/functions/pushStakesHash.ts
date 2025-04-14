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
import { mainnet, hardhat } from 'viem/chains'; // Import common chains
import {
	LERP_TOKEN_ABI,
	CONFIG,
	COMPUTE_COLLECTIONS,
	StakesPushHashResult,
	StakesComputeResult, // Import type for fetching computed result
	ComputeResult, // Import base type for helper
	DB_NAME
} from '..';
import { MongoClient, Db, UpdateResult, Collection } from 'mongodb'; // Added Collection, UpdateResult

// Define a more specific result type based on shared types
// This represents the data structure *before* it's wrapped with ComputeResult fields (_id, configChecksum, timestamp)
type PushStakesHashResultData = StakesPushHashResult['data'];

// --- Local DB Helper ---
// Fetches the most recent document from a specified collection based on timestamp
async function getLastDbResult<T extends ComputeResult>(
	dbClient: MongoClient,
	collectionName: COMPUTE_COLLECTIONS
): Promise<import('mongodb').WithId<T> | null> { // Return type includes MongoDB _id wrapper
	try {
		const db: Db = dbClient.db(DB_NAME); // Use your DB name
		const collection: Collection<T> = db.collection(collectionName);
		const lastResult = await collection.find().sort({ timestamp: -1 }).limit(1).toArray();
		return lastResult.length > 0 ? lastResult[0] : null; // Return the full document including _id
	} catch (dbError) {
		console.error(`Error fetching last result from ${collectionName}:`, dbError);
		return null; // Return null on error
	}
}

// --- Save Result Helper (Modified) ---
// Saves the result using the merkleRoot as the _id and upserting
async function saveResultToDB(
	dbClient: MongoClient,
	merkleRoot: Hex,
	resultData: PushStakesHashResultData // Use the specific data type
) {
	try {
		const db: Db = dbClient.db(DB_NAME);
		const collection = db.collection<StakesPushHashResult>(COMPUTE_COLLECTIONS.StakesPushHashResult);

		// Prepare the document fields to be set or updated
		// Note: We use the merkleRoot as _id, so it's not in the $set part
		const updateData: Partial<StakesPushHashResult> = {
			configChecksum: CONFIG.checksum,
			timestamp: new Date(),
			data: resultData // Use the structured data directly
		};

		// Use updateOne with upsert: true, using merkleRoot as _id
		const updateResult: UpdateResult = await collection.updateOne(
			{ _id: merkleRoot as any }, // Use merkleRoot as the document ID (cast needed if _id isn't Hex)
			{ $set: updateData },
			{ upsert: true }
		);

		if (updateResult.upsertedCount > 0) {
			console.log(`Inserted push hash result for root ${merkleRoot} into DB.`);
		} else if (updateResult.modifiedCount > 0) {
			console.log(`Updated push hash result for root ${merkleRoot} in DB.`);
		} else {
			console.log(`Push hash result for root ${merkleRoot} exists and was not modified.`);
		}
	} catch (dbError) {
		console.error(`Error saving push hash result for root ${merkleRoot} to DB:`, dbError);
	}
}


// Helper to find the correct chain definition
function getChainDefinition(chainId: number): Chain {
	if (chainId === mainnet.id) return mainnet;
	if (chainId === hardhat.id) return hardhat;
	console.warn(`Chain ID ${chainId} not found in predefined chains, using generic definition.`);
	return {
		id: chainId,
		name: `Chain ${chainId}`,
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpcUrls: { default: { http: [process.env.RPC_URL || ''] } },
	};
}


// --- Main Function ---
export async function pushStakesHash({
	client, globalStakerMerkleRoot
}: {
	client: MongoClient,
	globalStakerMerkleRoot?: Hex
}): Promise<PushStakesHashResultData> { // Return the data part directly

	const dbClient = client
	let targetMerkleRoot: Hex | undefined = globalStakerMerkleRoot;
	let resultData: PushStakesHashResultData; // To store the outcome data

	const config = CONFIG;
	const rpcUrl = process.env.RPC_URL;
	const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
	const lerpTokenAddress = config.tokenInfo.address as Address;
	const chainId = config.tokenInfo.chain;



	// --- Validate Environment Variables ---
	if (!rpcUrl || !privateKey) {
		const errorMsg = 'RPC_URL or PRIVATE_KEY not set in environment variables.';
		console.error(errorMsg);
		resultData = { success: false, error: errorMsg, merkleRoot: '0x_MISSING_ENV_VARS' };
		// Use a placeholder root ID for saving this specific error state
		await saveResultToDB(dbClient, '0x_MISSING_ENV_VARS', resultData);
		return resultData;
	}

	// --- Determine the target Merkle Root if not provided ---
	if (!targetMerkleRoot) {
		console.log("No Merkle root provided, fetching latest computed root...");
		const lastComputed = await getLastDbResult<StakesComputeResult>(dbClient, COMPUTE_COLLECTIONS.StakesComputeResult);
		console.log(lastComputed)
		if (!lastComputed?.data?.globalStakerMerkleRoot) {
			const errorMsg = "Could not find the last computed stake Merkle root in the database.";
			console.error(errorMsg);
			resultData = { success: false, error: errorMsg, merkleRoot: '0x_NO_COMPUTED_ROOT_FOUND' };
			await saveResultToDB(dbClient, '0x_NO_COMPUTED_ROOT_FOUND', resultData);
			return resultData;
		}
		targetMerkleRoot = lastComputed.data.globalStakerMerkleRoot;
		console.log(`Using latest computed root: ${targetMerkleRoot}`);
	}

	// --- Check if this root was already successfully pushed ---
	try {
		const db: Db = dbClient.db(DB_NAME);
		const collection = db.collection<StakesPushHashResult>(COMPUTE_COLLECTIONS.StakesPushHashResult);
		const existingPush = await collection.findOne({ _id: targetMerkleRoot as any });

		if (existingPush?.data?.success === true) {
			console.log(`Merkle root ${targetMerkleRoot} was already successfully pushed. Skipping.`);
			resultData = {
				...existingPush.data, // Use existing data
				status: 'skipped_duplicate' // Add skipped status
			};
			// No need to save again
			return resultData;
		}
		// If it exists but failed, we will try again and overwrite the DB entry later

	} catch (dbCheckError: any) {
		const errorMsg = `DB error checking existing push status: ${dbCheckError.message}`;
		console.error(`Error checking existing push status for root ${targetMerkleRoot}:`, dbCheckError);
		resultData = { success: false, error: errorMsg, merkleRoot: targetMerkleRoot };
		await saveResultToDB(dbClient, targetMerkleRoot, resultData); // Save the check error
		return resultData;
	}

	// --- Proceed with pushing the hash ---
	try {
		const account = privateKeyToAccount(privateKey);
		const chain = getChainDefinition(chainId);

		const walletClient: WalletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
		const publicClient: PublicClient = createPublicClient({ chain, transport: http(rpcUrl) });

		console.log(`Attempting to push Merkle root ${targetMerkleRoot} to ${lerpTokenAddress} on chain ${chainId}...`);

		// Send transaction
		const hash = await walletClient.writeContract({
			address: lerpTokenAddress,
			abi: LERP_TOKEN_ABI,
			functionName: 'updateStakeWithdrawalMerkleRoot',
			args: [targetMerkleRoot],
			chain: chain,
			account: account,
		});

		console.log(`Transaction sent: ${hash}. Waiting for receipt...`);

		// Wait for transaction receipt
		const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash });

		console.log(`Transaction confirmed in block ${receipt.blockNumber}. Status: ${receipt.status}`);

		if (receipt.status === 'success') {
			resultData = {
				merkleRoot: targetMerkleRoot,
				success: true,
				transactionHash: hash,
				blockNumber: receipt.blockNumber,
				gasUsed: receipt.gasUsed.toString(),
				effectiveGasPrice: receipt.effectiveGasPrice.toString(),
				status: receipt.status,
			};
		} else {
			const errorMsg = `Transaction reverted: ${hash}`;
			resultData = {
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
		const errorMsg = error.message || 'Unknown error during transaction';
		console.error(`Error pushing Merkle root ${targetMerkleRoot}:`, error);
		resultData = { success: false, error: errorMsg, merkleRoot: targetMerkleRoot };
	}

	// Save the final result (success or failure) to DB using the root as ID
	await saveResultToDB(dbClient, targetMerkleRoot, resultData);

	return resultData;
}