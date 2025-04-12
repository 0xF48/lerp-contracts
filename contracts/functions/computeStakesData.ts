import { createPublicClient, http, parseAbiItem, decodeEventLog, Address, Log, Hex, keccak256 as viemKeccak256, encodePacked } from 'viem';
import { MerkleTree } from 'merkletreejs';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
import { CONFIG, LERP_TOKEN_ABI, PublicConfig, PublicRealmConfig } from '..';
import { token } from '@/typechain-types/@openzeppelin/contracts';
// Add .js extension for Node.js/ts-node compatibility (it will resolve to .ts)

// Internal type for processing
interface AggregatedStakeInfo {
	address: Address;
	realmId: number; // Include realmId for the flat list
	totalStaked: bigint;
	latestUnlockTime: bigint; // Keep as bigint internally
}

// Type for JSON output staker details within a realm
interface StakerInfoOutput {
	address: Address;
	totalStaked: string; // Stringified bigint
	latestUnlockTime: number; // Converted to number for JSON
}

// Data structure for each realm in the output (no Merkle root here)
interface RealmStakingData {
	totalStakedLFT: string; // Stringified bigint
	numberOfStakers: number;
	stakers: StakerInfoOutput[];
}

// Data structure for each staker in the output
interface StakerDetails {
	address: Address;
	totalStaked: string;
	realms: {
		[realmId: number]: {
			totalStaked: string; // Stringified bigint
			latestUnlockTime: number;
		}
	};
}

// Main result type, now with a single global root
export interface ComputeStakesDataEntry {
	globalStakerMerkleRoot: Hex; // Single root for all stakes
	tokenStats: {
		totalStaked: string; // Stringified bigint
		totalDistributed: string; // Stringified bigint
		numberOfStakers: number
	};
	realms: { [realmId: number]: RealmStakingData };
	allStakers: { [address: Address]: StakerDetails };
	leafData?: AggregatedStakeInfo[]; // Optional: include raw leaf data for debugging/proof generation
}

// --- Helper ---
const bufToHex = (b: Buffer): Hex => `0x${b.toString('hex')}`;

// --- Main Function ---
export async function computeStakesData(): Promise<ComputeStakesDataEntry> {

	const config = CONFIG

	const rpcUrl = process.env.RPC_URL
	const fromBlock = BigInt(config.tokenInfo.block)
	const lerpTokenAddress = config.tokenInfo.address

	const publicClient = createPublicClient({ transport: http(rpcUrl) });
	const stakeEventAbiItem = 'event TokensStaked(address indexed user, uint16 indexed realmId, uint256 amount, uint256 unlockTime)';

	console.log(`Fetching TokensStaked logs from block ${fromBlock ?? 'genesis'}...`);
	let logs: Log[] = [];
	try {
		logs = await publicClient.getLogs({
			address: config.tokenInfo.address,
			event: parseAbiItem(stakeEventAbiItem),
			fromBlock: fromBlock ?? BigInt(0),
			toBlock: 'latest',
		});
		console.log(`Fetched ${logs.length} TokensStaked logs.`);
	} catch (error) {
		console.error("Error fetching logs:", error);
		throw new Error(`Failed to fetch logs from RPC: ${rpcUrl}`);
	}

	// Aggregate staking data per realm and per user
	const aggregatedData: Map<number, Map<Address, { totalStaked: bigint, latestUnlockTime: bigint }>> = new Map();
	for (const log of logs) {
		try {
			const decodedLog = decodeEventLog({
				abi: [parseAbiItem(stakeEventAbiItem)],
				data: log.data,
				topics: log.topics,
			});
			const { user, realmId, amount, unlockTime } = decodedLog.args as any; // Use any temporarily for simplicity

			if (!aggregatedData.has(realmId)) {
				aggregatedData.set(realmId, new Map());
			}
			const realmMap = aggregatedData.get(realmId)!;
			const userData = realmMap.get(user) ?? { totalStaked: BigInt(0), latestUnlockTime: BigInt(0) };
			userData.totalStaked += amount;
			if (unlockTime > userData.latestUnlockTime) {
				userData.latestUnlockTime = unlockTime;
			}
			realmMap.set(user, userData);
		} catch (decodingError) {
			console.warn("Error decoding log:", log, decodingError);
		}
	}

	// --- Prepare Data for Single Merkle Tree ---
	const flatStakerList: AggregatedStakeInfo[] = [];
	const resultRealms: { [realmId: number]: RealmStakingData } = {};
	const resultStakers: { [address: Address]: StakerDetails } = {};
	const resultStakersTotalStakeCount: {
		[address: Address]: bigint
	} = {}

	// Initialize resultRealms with all configured realms
	for (const realmConfig of config.realms) {
		resultRealms[realmConfig.stakeRealmId] = {
			totalStakedLFT: '0',
			numberOfStakers: 0,
			stakers: [],
		};
	}

	const tokenStats = {
		totalStaked: '0',
		totalDistributed: '0',
		numberOfStakers: 0,
	}

	let token_totalStakedLFTCount = 0n
	let token_numberOfStakers = 0

	// Flatten aggregated data and populate result structures
	for (const [realmId, realmMap] of aggregatedData.entries()) {
		let totalStakedInRealm = BigInt(0);
		const stakersOutput: StakerInfoOutput[] = [];

		for (const [address, data] of realmMap.entries()) {
			const stakeInfo: AggregatedStakeInfo = { // Use internal type for flat list
				address,
				realmId, // Include realmId
				totalStaked: data.totalStaked,
				latestUnlockTime: data.latestUnlockTime,
			};
			flatStakerList.push(stakeInfo);

			// Prepare output data
			totalStakedInRealm += data.totalStaked;
			token_totalStakedLFTCount += data.totalStaked
			token_numberOfStakers++;
			const stakerOutputInfo: StakerInfoOutput = {
				address,
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
			stakersOutput.push(stakerOutputInfo);

			// Update allStakers map
			if (!resultStakers[address]) {
				resultStakers[address] = { address, realms: {}, totalStaked: '0' };
				resultStakersTotalStakeCount[address] = BigInt(0)
			}
			resultStakers[address].realms[realmId] = {
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
			resultStakersTotalStakeCount[address] += data.totalStaked

			resultStakers[address].totalStaked = (resultStakersTotalStakeCount[address]).toString()
		}

		// Update realm data in results
		if (resultRealms[realmId]) { // Check if realm exists (it should from initialization)
			resultRealms[realmId].totalStakedLFT = totalStakedInRealm.toString();
			resultRealms[realmId].numberOfStakers = realmMap.size;
			resultRealms[realmId].stakers = stakersOutput.sort((a, b) => a.address.localeCompare(b.address)); // Sort output list too
		} else {
			console.warn(`Realm ID ${realmId} found in logs but not in GLOBAL_CONFIG.ts`);
			// Optionally handle this case, e.g., by adding it dynamically
		}
	}

	// --- Build Single Merkle Tree ---
	let globalStakerMerkleRoot: Hex = '0x'; // Default empty root

	if (flatStakerList.length > 0) {
		// Sort the flat list deterministically (address first, then realmId)
		flatStakerList.sort((a, b) => {
			const addrCompare = a.address.localeCompare(b.address);
			if (addrCompare !== 0) return addrCompare;
			return a.realmId - b.realmId;
		});

		const leaves = flatStakerList.map(staker => {
			const packedData = encodePacked(
				['address', 'uint16', 'uint256', 'uint256'], // Include realmId (uint16)
				[staker.address, staker.realmId, staker.totalStaked, staker.latestUnlockTime]
			);
			return Buffer.from(keccak256(packedData));
		});

		const tree = new MerkleTree(leaves, (data: Buffer) => Buffer.from(keccak256(data)), { sortPairs: true });
		globalStakerMerkleRoot = bufToHex(tree.getRoot());
	}

	console.log("Staking data aggregation complete.");

	// --- Read Distributed Tokens from Contract ---
	let distributedTokens = BigInt(0);
	try {
		console.log(`Reading distributedTokens from ${lerpTokenAddress}...`);
		distributedTokens = await publicClient.readContract({
			address: lerpTokenAddress,
			abi: LERP_TOKEN_ABI, // Use the imported ABI
			functionName: 'distributedTokens',
		}) as bigint; // Assert type
		console.log(`Distributed Tokens: ${distributedTokens.toString()}`);
	} catch (error) {
		console.error("Error reading distributedTokens from contract:", error);
		// Decide how to handle - throw, or return 0? For now, log and continue with 0.
	}


	tokenStats.totalDistributed = distributedTokens.toString()
	tokenStats.totalStaked = token_totalStakedLFTCount.toString()
	tokenStats.numberOfStakers = token_numberOfStakers

	console.log("computation complete.");



	const finalResult: ComputeStakesDataEntry = {
		tokenStats: tokenStats,
		globalStakerMerkleRoot,
		realms: resultRealms,
		allStakers: resultStakers,
	};

	// // Optionally include raw leaf data for debugging/proof generation client-side
	// if (options?.includeLeafData) {
	// 	finalResult.leafData = flatStakerList;
	// }

	finalResult.leafData = flatStakerList;

	return finalResult;
}

