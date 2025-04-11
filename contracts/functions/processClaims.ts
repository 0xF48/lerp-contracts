import { createPublicClient, http, parseAbiItem, decodeEventLog, Address, Log, Hex, keccak256 as viemKeccak256, encodePacked } from 'viem';
import { MerkleTree } from 'merkletreejs';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
import { PublicRealmConfig } from '..';
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
	realms: {
		[realmId: number]: {
			totalStaked: string; // Stringified bigint
			latestUnlockTime: number;
		}
	};
}

// Main result type, now with a single global root
interface ComputeStakingResult {
	globalStakerMerkleRoot: Hex; // Single root for all stakes
	realms: { [realmId: number]: RealmStakingData };
	allStakers: { [address: Address]: StakerDetails };
	leafData?: AggregatedStakeInfo[]; // Optional: include raw leaf data for debugging/proof generation
}

// --- Helper ---
const bufToHex = (b: Buffer): Hex => `0x${b.toString('hex')}`;

// --- Main Function ---

export async function processClaims(
	rpcUrl: string,
	config: { realms: PublicRealmConfig[] },
	lerpTokenAddress: Address,
	fromBlock?: bigint,
	options?: { includeLeafData?: boolean } // Option to include raw leaf data in output
): Promise<ComputeStakingResult> {

	const publicClient = createPublicClient({ transport: http(rpcUrl) });
	const stakeEventAbiItem = 'event TokensStaked(address indexed user, uint16 indexed realmId, uint256 amount, uint256 unlockTime)';

	console.log(`Fetching TokensStaked logs from block ${fromBlock ?? 'genesis'}...`);
	let logs: Log[] = [];
	try {
		logs = await publicClient.getLogs({
			address: lerpTokenAddress,
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

	// Initialize resultRealms with all configured realms
	for (const realmConfig of config.realms) {
		resultRealms[realmConfig.stakeRealmId] = {
			totalStakedLFT: '0',
			numberOfStakers: 0,
			stakers: [],
		};
	}

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
			const stakerOutputInfo: StakerInfoOutput = {
				address,
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
			stakersOutput.push(stakerOutputInfo);

			// Update allStakers map
			if (!resultStakers[address]) {
				resultStakers[address] = { address, realms: {} };
			}
			resultStakers[address].realms[realmId] = {
				totalStaked: data.totalStaked.toString(),
				latestUnlockTime: Number(data.latestUnlockTime),
			};
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

	console.log("Staking data computation complete.");

	const finalResult: ComputeStakingResult = {
		globalStakerMerkleRoot,
		realms: resultRealms,
		allStakers: resultStakers,
	};

	// Optionally include raw leaf data for debugging/proof generation client-side
	if (options?.includeLeafData) {
		finalResult.leafData = flatStakerList;
	}

	return finalResult;
}

