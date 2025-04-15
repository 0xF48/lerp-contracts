import {
	createPublicClient,
	http,
	parseAbiItem,
	decodeEventLog,
	Address,
	Log,
	Hex,
	encodePacked,
	PublicClient,
	formatUnits // Added for logging potentially
} from 'viem';
import { MerkleTree } from 'merkletreejs';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
import { AggregatedStakeInfo, ComputeStakesDataEntry, CONFIG, LERP_TOKEN_ABI, PublicRealmConfig, RealmStakingData, StakerDetails, StakerInfoOutput } from '..';

// --- Types ---
// (Keep existing type definitions: AggregatedStakeInfo, StakerInfoOutput, RealmStakingData, StakerDetails, ComputeStakesDataEntry)

// Internal type for processing logs
interface AggregatedStakeData {
	totalStaked: bigint;
	latestUnlockTime: bigint;
}
type AggregatedDataMap = Map<number, Map<Address, AggregatedStakeData>>;

// Internal type for processing aggregated data into final structures
interface ProcessedStakeData {
	flatStakerList: AggregatedStakeInfo[];
	resultRealms: { [realmId: number]: RealmStakingData };
	resultStakers: { [address: Address]: StakerDetails };
	tokenStats: {
		totalStaked: bigint; // Keep as bigint internally
		numberOfStakers: number;
	};
}

// --- Helpers ---
const bufToHex = (b: Buffer): Hex => `0x${b.toString('hex')}`;
const keccakBuffer = (input: Buffer | string): Buffer => {
	const data = typeof input === 'string' ? Buffer.from(input) : input;
	return Buffer.from(keccak256(data));
};


// --- Refactored Functions ---

/**
 * Fetches TokensStaked event logs from the LerpToken contract.
 */
async function fetchStakeLogs(publicClient: PublicClient): Promise<Log[]> {
	const config = CONFIG;
	const fromBlock = BigInt(config.tokenInfo.block);
	const lerpTokenAddress = config.tokenInfo.address;
	const stakeEventAbiItem = 'event TokensStaked(address indexed user, uint16 indexed realmId, uint256 amount, uint256 unlockTime)';

	console.log(`Fetching TokensStaked logs from block ${fromBlock ?? 'genesis'}...`);
	try {
		const logs = await publicClient.getLogs({
			address: lerpTokenAddress,
			event: parseAbiItem(stakeEventAbiItem),
			fromBlock: fromBlock ?? 0n,
			toBlock: 'latest',
		});
		console.log(`Fetched ${logs.length} TokensStaked logs.`);
		return logs;
	} catch (error) {
		console.error("Error fetching stake logs:", error);
		throw new Error(`Failed to fetch logs from RPC: ${process.env.RPC_URL}`); // Rethrow or handle differently
	}
}

/**
 * Aggregates raw log data into a nested map: realmId -> userAddress -> {totalStaked, latestUnlockTime}.
 */
function aggregateStakeLogs(logs: Log[]): AggregatedDataMap {
	const aggregatedData: AggregatedDataMap = new Map();
	const stakeEventAbiItem = 'event TokensStaked(address indexed user, uint16 indexed realmId, uint256 amount, uint256 unlockTime)';

	for (const log of logs) {
		try {
			const decodedLog = decodeEventLog({
				abi: [parseAbiItem(stakeEventAbiItem)],
				data: log.data,
				topics: log.topics,
			});
			// TODO: Add check for args existence before destructuring
			const { user, realmId, amount, unlockTime } = decodedLog.args as any;

			if (!aggregatedData.has(realmId)) {
				aggregatedData.set(realmId, new Map());
			}
			const realmMap = aggregatedData.get(realmId)!;
			const userData = realmMap.get(user) ?? { totalStaked: 0n, latestUnlockTime: 0n };

			userData.totalStaked += amount;
			if (unlockTime > userData.latestUnlockTime) {
				userData.latestUnlockTime = unlockTime;
			}
			realmMap.set(user, userData);
		} catch (decodingError) {
			console.warn("Error decoding stake log:", log, decodingError);
		}
	}
	return aggregatedData;
}

/**
 * Processes the aggregated stake data into structured outputs for realms, stakers, and the flat list for Merkle tree.
 */
function processAggregatedData(aggregatedData: AggregatedDataMap): ProcessedStakeData {
	const flatStakerList: AggregatedStakeInfo[] = [];
	const resultRealms: { [realmId: number]: RealmStakingData } = {};
	const resultStakers: { [address: Address]: StakerDetails } = {};
	const resultStakersTotalStakeCount: { [address: Address]: bigint } = {}; // Temp map for total stake per address

	let totalStakedLFTCount = 0n;
	let uniqueStakerAddresses = new Set<Address>();

	// Initialize resultRealms with all configured realms
	for (const realmConfig of CONFIG.realms) {
		resultRealms[realmConfig.stakeRealmId] = {
			totalStakedLFT: '0',
			numberOfStakers: 0,
			stakers: [],
		};
	}

	// Flatten aggregated data and populate result structures
	for (const [realmId, realmMap] of aggregatedData.entries()) {
		let totalStakedInRealm = 0n;
		const stakersOutput: StakerInfoOutput[] = [];

		for (const [address, data] of realmMap.entries()) {
			uniqueStakerAddresses.add(address); // Track unique stakers globally

			const stakeInfo: AggregatedStakeInfo = {
				address,
				realmId,
				totalStaked: data.totalStaked,
				latestUnlockTime: data.latestUnlockTime,
			};
			flatStakerList.push(stakeInfo);

			// Prepare output data
			totalStakedInRealm += data.totalStaked;
			totalStakedLFTCount += data.totalStaked; // Accumulate global total stake

			const stakerOutputInfo: StakerInfoOutput = {
				address,
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
			stakersOutput.push(stakerOutputInfo);

			// Update allStakers map
			if (!resultStakers[address]) {
				resultStakers[address] = { address, realms: {}, totalStaked: '0' };
				resultStakersTotalStakeCount[address] = 0n;
			}
			resultStakers[address].realms[realmId] = {
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
			resultStakersTotalStakeCount[address] += data.totalStaked;
		}

		// Update realm data in results
		if (resultRealms[realmId]) {
			resultRealms[realmId].totalStakedLFT = totalStakedInRealm.toString();
			resultRealms[realmId].numberOfStakers = realmMap.size;
			resultRealms[realmId].stakers = stakersOutput.sort((a, b) => a.address.localeCompare(b.address));
		} else {
			console.warn(`Realm ID ${realmId} found in logs but not in CONFIG.ts`);
		}
	}

	// Finalize total staked per staker across all realms
	for (const addressString in resultStakers) {
		const address = addressString as Address; // Cast string key to Address type
		resultStakers[address].totalStaked = resultStakersTotalStakeCount[address].toString();
	}


	return {
		flatStakerList,
		resultRealms,
		resultStakers,
		tokenStats: {
			totalStaked: totalStakedLFTCount,
			numberOfStakers: uniqueStakerAddresses.size,
		}
	};
}

/**
 * Builds the global Merkle tree for stake withdrawals.
 */
function buildStakeMerkleTree(flatStakerList: AggregatedStakeInfo[]): Hex {
	let globalStakerMerkleRoot: Hex = '0x';

	if (flatStakerList.length > 0) {
		// Sort the flat list deterministically (address first, then realmId)
		const sortedList = [...flatStakerList].sort((a, b) => {
			const addrCompare = a.address.localeCompare(b.address);
			if (addrCompare !== 0) return addrCompare;
			return a.realmId - b.realmId;
		});

		const leaves = sortedList.map(staker => {
			const packedData = encodePacked(
				['address', 'uint16', 'uint256', 'uint256'],
				[staker.address, staker.realmId, staker.totalStaked, staker.latestUnlockTime]
			);
			return keccakBuffer(packedData);
		});

		const tree = new MerkleTree(leaves, keccakBuffer, { sortPairs: true });
		globalStakerMerkleRoot = bufToHex(tree.getRoot());
	}
	return globalStakerMerkleRoot;
}

/**
 * Fetches token statistics (like total distributed) from the contract.
 */
async function fetchTokenStats(publicClient: PublicClient): Promise<{ totalDistributed: bigint }> {
	const lerpTokenAddress = CONFIG.tokenInfo.address;
	let distributedTokens = 0n;
	try {
		console.log(`Reading distributedTokens from ${lerpTokenAddress}...`);
		distributedTokens = await publicClient.readContract({
			address: lerpTokenAddress,
			abi: LERP_TOKEN_ABI,
			functionName: 'distributedTokens',
		}) as bigint;
		console.log(`Distributed Tokens: ${formatUnits(distributedTokens, 18)}`); // Log formatted value
	} catch (error) {
		console.error("Error reading distributedTokens from contract:", error);
		// Return 0 or throw? Returning 0 for now.
	}
	return { totalDistributed: distributedTokens };
}


// --- Main Exported Function ---
export async function computeStakesData(): Promise<ComputeStakesDataEntry> {

	const rpcUrl = process.env.RPC_URL;
	if (!rpcUrl) {
		throw new Error('RPC_URL not set in environment variables.');
	}
	const publicClient = createPublicClient({ transport: http(rpcUrl) });

	// 1. Fetch Logs
	const logs = await fetchStakeLogs(publicClient);

	// 2. Aggregate Logs
	const aggregatedData = aggregateStakeLogs(logs);

	// 3. Process Aggregated Data
	const processedData = processAggregatedData(aggregatedData);

	// 4. Build Merkle Tree
	const globalStakerMerkleRoot = buildStakeMerkleTree(processedData.flatStakerList);
	console.log(`Global Staker Merkle Root: ${globalStakerMerkleRoot}`);

	// 5. Fetch Additional Token Stats
	const contractTokenStats = await fetchTokenStats(publicClient);

	console.log("Stake computation complete.");

	// 6. Assemble Final Result
	const finalResult: ComputeStakesDataEntry = {
		globalStakerMerkleRoot,
		tokenStats: {
			totalStaked: processedData.tokenStats.totalStaked.toString(), // Convert bigint to string for final output
			numberOfStakers: processedData.tokenStats.numberOfStakers,
			totalDistributed: contractTokenStats.totalDistributed.toString(), // Convert bigint to string
		},
		realms: processedData.resultRealms,
		allStakers: processedData.resultStakers,
		leafData: processedData.flatStakerList // Include raw leaf data
	};

	return finalResult;
}
