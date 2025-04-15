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
	PublicClient
} from 'viem';
import { MerkleTree } from 'merkletreejs';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
// Removed MongoClient, Db imports
import {
	CONFIG,
	LERP_REALM_ABI,
	COMPUTE_COLLECTIONS,
	StakesComputeResult,
	ClaimsComputeResult,
	RealmClaimData,
	PublicRealmConfig,
	StakerDetails // Now imported correctly from '..'
} from '..';
import { ComputeStakesDataEntry } from '..';
// Removed getLastDbResult import

// --- Types ---
interface Claim {
	address: Address;
	amount: bigint;
}

// --- Helpers ---
const hexToBuffer = (hex: string) => Buffer.from(hex.replace(/^0x/, ''), 'hex');
const keccakBuffer = (input: Buffer | string): Buffer => {
	const data = typeof input === 'string' ? Buffer.from(input) : input;
	return Buffer.from(keccak256(data));
};

// --- Refactored Functions ---

// Removed fetchLatestStakeData function

/**
 * Fetches RevenueGenerated event logs for a specific realm.
 * TODO: Implement fetching only events since the last processed block.
 */
async function fetchRealmRevenueEvents(
	publicClient: PublicClient,
	realmConfig: PublicRealmConfig
): Promise<Log[]> {
	const revenueEventAbiItem = 'event RevenueGenerated(address indexed payer, uint256 revenueAmount, uint256 totalValue)';
	let revenueLogs: Log[] = [];
	try {
		console.log(`Fetching RevenueGenerated logs for ${realmConfig.name} from block ${realmConfig.contract.blockNumber}...`);
		revenueLogs = await publicClient.getLogs({
			address: realmConfig.contract.address as Address,
			event: parseAbiItem(revenueEventAbiItem),
			fromBlock: BigInt(realmConfig.contract.blockNumber), // Start from realm deployment block for now
			toBlock: 'latest',
		});
		console.log(`Fetched ${revenueLogs.length} RevenueGenerated logs for ${realmConfig.name}.`);
	} catch (error) {
		console.error(`Error fetching logs for realm ${realmConfig.name}:`, error);
		// Return empty array on error, let caller decide how to handle
	}
	return revenueLogs;
}

/**
 * Aggregates the total distributable revenue from event logs.
 */
function aggregateRealmRevenue(revenueLogs: Log[]): bigint {
	let totalRevenueInPeriod = 0n;
	const revenueEventAbiItem = 'event RevenueGenerated(address indexed payer, uint256 revenueAmount, uint256 totalValue)';
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
	return totalRevenueInPeriod;
}

/**
 * Calculates individual claim amounts for stakers based on their share of total stake.
 */
function calculateRealmClaims(
	realmId: number,
	totalRevenueInPeriod: bigint,
	stakeDataForRealm: StakesComputeResult['data']['realms'][number] | undefined,
): { claims: Claim[], totalClaimableAmount: bigint } {

	const claims: Claim[] = [];
	let totalClaimableAmount = 0n;
	const realmStakers = stakeDataForRealm?.stakers ?? [];
	const totalRealmStake = BigInt(stakeDataForRealm?.totalStakedLFT ?? '0');

	if (totalRevenueInPeriod === 0n || totalRealmStake === 0n || realmStakers.length === 0) {
		console.log(`No revenue, stakers, or zero total stake for realm ${realmId}. No claims calculated.`);
		return { claims, totalClaimableAmount };
	}

	for (const staker of realmStakers) {
		const stakerAddress = staker.address;
		const stakerStake = BigInt(staker.totalStaked);

		if (stakerStake > 0n) {
			// Calculate share: (stakerStake * totalRevenueInPeriod) / totalRealmStake
			const claimAmount = (stakerStake * totalRevenueInPeriod) / totalRealmStake;
			if (claimAmount > 0n) {
				claims.push({ address: stakerAddress, amount: claimAmount });
				totalClaimableAmount += claimAmount;
			}
		}
	}
	return { claims, totalClaimableAmount };
}

/**
 * Builds the Merkle tree and calculates the root for the realm's claims.
 */
function buildClaimsMerkleTree(claims: Claim[]): { root: Hex, leaves: Claim[] } {
	let merkleRoot: Hex = '0x';
	const sortedClaims = [...claims].sort((a, b) => a.address.localeCompare(b.address)); // Sort deterministically

	if (sortedClaims.length > 0) {
		const leafBuffers = sortedClaims.map(claim => {
			const packedData = encodePacked(
				['address', 'uint256'],
				[claim.address, claim.amount]
			);
			return keccakBuffer(packedData);
		});

		const tree = new MerkleTree(leafBuffers, keccakBuffer, { sortPairs: true });
		merkleRoot = tree.getHexRoot() as Hex;
	}
	// Return sorted claims as leaves for leafData output
	return { root: merkleRoot, leaves: sortedClaims };
}

/**
 * Orchestrates the claim computation process for a single realm.
 */
async function computeClaimsForRealm(
	realmConfig: PublicRealmConfig,
	stakeData: StakesComputeResult['data'] | null,
	publicClient: PublicClient
): Promise<RealmClaimData | null> {
	const realmId = realmConfig.stakeRealmId;

	// Fetch events
	const revenueLogs = await fetchRealmRevenueEvents(publicClient, realmConfig);

	// Aggregate revenue
	const totalRevenueInPeriod = aggregateRealmRevenue(revenueLogs);
	console.log(`Total revenue for ${realmConfig.name} in period: ${formatUnits(totalRevenueInPeriod, 18)}`);

	// Get stake data for this specific realm
	const stakeDataForRealm = stakeData?.realms?.[realmId];

	// Calculate claims
	const { claims, totalClaimableAmount } = calculateRealmClaims(realmId, totalRevenueInPeriod, stakeDataForRealm);

	// Build Merkle tree
	const { root: claimMerkleRoot, leaves } = buildClaimsMerkleTree(claims);

	const realmClaimData: RealmClaimData = {
		realmId: realmId,
		totalRevenueProcessed: formatUnits(totalRevenueInPeriod, 18),
		totalClaimableAmount: formatUnits(totalClaimableAmount, 18),
		claimMerkleRoot: claimMerkleRoot,
		numberOfClaimants: claims.length,
		claims: claims.map(c => ({ address: c.address, amount: c.amount.toString() })),
		leafData: leaves
	};

	console.log(`Claims computed for ${realmConfig.name}: Root=${claimMerkleRoot}, Total Claimable=${realmClaimData.totalClaimableAmount}, Claimants=${claims.length}`);
	return realmClaimData;
}


// --- Main Exported Function ---
export async function computeClaimsData(
	latestStakeData: ComputeStakesDataEntry // Accept stake data as parameter
): Promise<Omit<ClaimsComputeResult, '_id' | 'configChecksum' | 'timestamp'>> {

	const config = CONFIG;
	const rpcUrl = process.env.RPC_URL; // TODO: Handle multi-chain
	if (!rpcUrl) {
		throw new Error('RPC_URL not set in environment variables.');
	}
	// TODO: Initialize multiple publicClients based on unique chain IDs in config.realms
	const publicClient = createPublicClient({ transport: http(rpcUrl) });


	const computedClaims: { [realmId: number]: RealmClaimData } = {};

	// 2. Iterate through realms and compute claims for each
	for (const realmConfig of config.realms) {
		// TODO: Select the correct publicClient based on realmConfig.contract.chain
		const realmClaimData = await computeClaimsForRealm(realmConfig, latestStakeData, publicClient);
		if (realmClaimData) {
			computedClaims[realmConfig.stakeRealmId] = realmClaimData;
		} else {
			// Handle case where computing claims for a realm failed (e.g., RPC error)
			// Optionally add an error entry or skip
			console.warn(`Skipping realm ${realmConfig.name} due to computation error.`);
		}
	}

	// 3. Return final result object
	return {

		realms: computedClaims,

	};
}