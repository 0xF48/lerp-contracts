import {
	createPublicClient,
	http,
	parseAbiItem,
	decodeEventLog,
	Address,
	Log,
	Hex,
	encodePacked,
	formatUnits,
	parseUnits,
	PublicClient
} from 'viem';
import { MerkleTree } from 'merkletreejs';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
import { MongoClient, Db } from 'mongodb';
import {
	CONFIG,
	LERP_REALM_ABI, // Assuming a basic ABI for LerpRealm exists
	COMPUTE_COLLECTIONS,
	StakesComputeResult,
	ClaimsComputeResult,
	RealmClaimData,
	PublicRealmConfig
} from '..';
import { getLastDbResult } from './helpers/getLastDbResult'; // Use the extracted helper

// Helper to create buffer from hex
const hexToBuffer = (hex: string) => Buffer.from(hex.replace(/^0x/, ''), 'hex');

// Helper for keccak256 using noble
const keccakBuffer = (input: Buffer | string): Buffer => {
	const data = typeof input === 'string' ? Buffer.from(input) : input;
	return Buffer.from(keccak256(data));
};

// --- Main Function ---
export async function computeClaimsData(
	dbClient: MongoClient
): Promise<Omit<ClaimsComputeResult, '_id' | 'configChecksum' | 'timestamp'>> { // Return data part

	const config = CONFIG;
	const rpcUrl = process.env.RPC_URL; // Assuming one primary RPC for now
	if (!rpcUrl) {
		throw new Error('RPC_URL not set in environment variables.');
	}

	const publicClient = createPublicClient({ transport: http(rpcUrl) });

	// 1. Fetch the latest STAKE data (needed for share calculation)
	const lastStakeCompute = await getLastDbResult<StakesComputeResult>(dbClient, COMPUTE_COLLECTIONS.StakesComputeResult);
	if (!lastStakeCompute?.data?.allStakers || !lastStakeCompute?.data?.realms) {
		console.error("Latest stake computation data not found or incomplete.");
		// Return empty data or throw error? Returning empty for now.
		return { data: { realms: {} } };
	}
	const allStakersData = lastStakeCompute.data.allStakers;
	const stakeRealmsData = lastStakeCompute.data.realms;

	const computedClaims: { [realmId: number]: RealmClaimData } = {};

	// Define the event ABI item we are looking for
	const revenueEventAbiItem = 'event RevenueGenerated(address indexed payer, uint256 revenueAmount, uint256 totalValue)';

	// 2. Iterate through each configured realm
	for (const realmConfig of config.realms) {
		console.log(`Processing claims for realm: ${realmConfig.name} (ID: ${realmConfig.stakeRealmId})`);
		const realmId = realmConfig.stakeRealmId;
		const realmContractAddress = realmConfig.contract.address as Address;
		// TODO: Handle different chains per realm - requires multiple publicClients
		// For now, assumes all realms are on the same chain as RPC_URL

		// 3. Fetch RevenueGenerated events for this realm
		// TODO: Implement fetching only events since the last processed block
		let revenueLogs: Log[] = [];
		try {
			console.log(`Fetching RevenueGenerated logs for ${realmConfig.name} from block ${realmConfig.contract.blockNumber}...`);
			revenueLogs = await publicClient.getLogs({
				address: realmContractAddress,
				event: parseAbiItem(revenueEventAbiItem),
				fromBlock: BigInt(realmConfig.contract.blockNumber), // Start from realm deployment block for now
				toBlock: 'latest',
			});
			console.log(`Fetched ${revenueLogs.length} RevenueGenerated logs for ${realmConfig.name}.`);
		} catch (error) {
			console.error(`Error fetching logs for realm ${realmConfig.name}:`, error);
			// Continue to next realm or handle error? Skipping realm for now.
			continue;
		}

		// 4. Aggregate total revenue for the period
		let totalRevenueInPeriod = 0n;
		for (const log of revenueLogs) {
			try {
				const decodedLog = decodeEventLog({
					abi: [parseAbiItem(revenueEventAbiItem)],
					data: log.data,
					topics: log.topics,
				});
				totalRevenueInPeriod += decodedLog.args.revenueAmount as bigint;
			} catch (decodingError) {
				console.warn("Error decoding RevenueGenerated log:", log, decodingError);
			}
		}
		console.log(`Total revenue for ${realmConfig.name} in period: ${formatUnits(totalRevenueInPeriod, 18)}`);

		if (totalRevenueInPeriod === 0n) {
			console.log(`No revenue generated for ${realmConfig.name}, skipping claim calculation.`);
			// Still create an entry with zero claims and empty root? Or skip entirely?
			// Creating entry with zero claims for consistency.
			computedClaims[realmId] = {
				realmId: realmId,
				totalRevenueProcessed: '0',
				totalClaimableAmount: '0',
				claimMerkleRoot: '0x', // Empty root
				numberOfClaimants: 0,
				claims: [],
				leafData: []
			};
			continue;
		}

		// 5. Calculate claimable amounts for stakers in this realm
		const realmStakers = stakeRealmsData[realmId]?.stakers ?? [];
		const totalRealmStake = BigInt(stakeRealmsData[realmId]?.totalStakedLFT ?? '0');

		if (totalRealmStake === 0n || realmStakers.length === 0) {
			console.log(`No stakers or zero total stake for ${realmConfig.name}, cannot distribute revenue.`);
			computedClaims[realmId] = {
				realmId: realmId,
				totalRevenueProcessed: formatUnits(totalRevenueInPeriod, 18), // Revenue was processed
				totalClaimableAmount: '0', // But nothing is claimable
				claimMerkleRoot: '0x',
				numberOfClaimants: 0,
				claims: [],
				leafData: []
			};
			continue;
		}

		const claims: { address: Address; amount: bigint }[] = [];
		let totalClaimableAmount = 0n;

		for (const staker of realmStakers) {
			const stakerAddress = staker.address;
			const stakerStake = BigInt(staker.totalStaked); // Assumes staker.totalStaked is from stake computation

			if (stakerStake > 0n) {
				// Calculate share: (stakerStake * totalRevenueInPeriod) / totalRealmStake
				// Use BigInt for precision
				const claimAmount = (stakerStake * totalRevenueInPeriod) / totalRealmStake;

				if (claimAmount > 0n) {
					claims.push({ address: stakerAddress, amount: claimAmount });
					totalClaimableAmount += claimAmount;
				}
			}
		}

		// 6. Construct Merkle tree for the realm
		let merkleRoot: Hex = '0x';
		const leaves: { address: Address; amount: bigint }[] = []; // For leafData output

		if (claims.length > 0) {
			// Sort claims deterministically (by address) before creating leaves
			claims.sort((a, b) => a.address.localeCompare(b.address));

			const leafBuffers = claims.map(claim => {
				leaves.push(claim); // Add to leafData output
				const packedData = encodePacked(
					['address', 'uint256'],
					[claim.address, claim.amount]
				);
				return keccakBuffer(packedData);
			});

			const tree = new MerkleTree(leafBuffers, keccakBuffer, { sortPairs: true });
			merkleRoot = tree.getHexRoot() as Hex;
		}

		// 7. Store results for this realm
		computedClaims[realmId] = {
			realmId: realmId,
			totalRevenueProcessed: formatUnits(totalRevenueInPeriod, 18),
			totalClaimableAmount: formatUnits(totalClaimableAmount, 18),
			claimMerkleRoot: merkleRoot,
			numberOfClaimants: claims.length,
			claims: claims.map(c => ({ address: c.address, amount: c.amount.toString() })), // Convert amount to string for output
			leafData: leaves // Include raw leaf data
		};

		console.log(`Claims computed for ${realmConfig.name}: Root=${merkleRoot}, Total Claimable=${formatUnits(totalClaimableAmount, 18)}, Claimants=${claims.length}`);
	} // End realm loop

	// 8. Return final result object
	return {
		data: {
			realms: computedClaims,
		}
	};
}