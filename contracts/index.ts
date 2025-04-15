import { Address, Hex } from 'viem' // Added Hex import
import { ComputeStakesDataEntry } from './functions/computeStakesData'
import { computeChecksum } from './functions/computeChecksum'
export type PublicRealmConfig = {
	id: string
	stakeRealmId: number, //starts with 1, used for indicating the realm when staking
	name: string
	bannerUrl: string
	currentVersion: string
	media: {
		static: {
			src: string
		}
	}
	contract: {
		address: string,
		chain: number,
		blockNumber: string,
		assets: any
	}
}

export type ComputeResult = {
	_id: string; // Explicitly define _id as string
	configChecksum: string;
	timestamp: Date;
}


// Define the structure of the document we're storing
// Replicating relevant parts of ComputeClaimsData structure
export type StakesComputeResult = ComputeResult & {
	data: ComputeStakesDataEntry;
}

// Result structure for pushing the stake Merkle hash
export type StakesPushHashResult = ComputeResult & {
	data: {
		merkleRoot: Hex;
		success: boolean;
		transactionHash?: Hex;
		blockNumber?: bigint;
		gasUsed?: string; // Store as string for DB compatibility
		effectiveGasPrice?: string; // Store as string
		status?: 'success' | 'reverted' | 'skipped_duplicate'; // Include status
		error?: string; // Store error message if any
	};
}

// Structure for computed claim data per realm
export interface RealmClaimData {
	realmId: number;
	totalRevenueProcessed: string; // Total revenue from events in this period
	totalClaimableAmount: string; // Sum of all individual claims
	claimMerkleRoot: Hex;
	numberOfClaimants: number;
	claims: { address: Address; amount: string }[]; // Individual claim amounts (stringified bigint)
	leafData?: { address: Address; amount: bigint }[]; // Raw leaf data for proof generation
}

// Result structure for the overall claims computation job
export type ClaimsComputeResult = ComputeResult & {
	data: {
		// Map realmId to its computed claim data
		realms: { [realmId: number]: RealmClaimData };
		// Optional: Add overall stats if needed
	}
}

// Result structure for pushing a single realm's claim hash
export type ClaimsPushHashResult = ComputeResult & {
	data: {
		realmId: number;
		merkleRoot: Hex;
		success: boolean;
		transactionHash?: Hex;
		blockNumber?: bigint;
		gasUsed?: string; // Store as string
		effectiveGasPrice?: string; // Store as string
		status?: 'success' | 'reverted' | 'skipped_duplicate' | 'skipped_no_claims'; // Include status
		error?: string;
	}
}

export type AirdropResult = ComputeResult & {
	data: {
		// Define structure for airdrop results if needed
	}
}


export const enum COMPUTE_COLLECTIONS {
	StakesPushHashResult = "lerp_stakes_push_hash_results", // Use more descriptive names
	ClaimsComputeResult = "lerp_claims_compute_results",
	StakesComputeResult = "lerp_stakes_compute_results",
	ClaimsPushHashResult = "lerp_claims_push_hash_results", // Added missing entry
	AirdropResult = "lerp_airdrop_results"
}


export const DB_NAME = process.env.MONGO_DBNAME;



export type PublicConfig = {
	checksum: string,
	realms: PublicRealmConfig[]
	tokenInfo: {
		block: string,
		address: Address,
		chain: number,
		totalSupply: number,
		stakeLockDaysAmount: number
	}
}


// THIS MUST BE SYNCED WITH LERP API AT ALL TIMES.
export const CONFIG: PublicConfig = {

	checksum: '',
	realms: [
		{ // Start of first realm object in array
			stakeRealmId: 1,
			id: "podrun",
			name: "Pod Run",
			currentVersion: "0.1-DEV",
			bannerUrl: "/assets/realms/podrun/podrun.png",
			media: {
				static: {
					src: "/assets/realms/podrun/reel-1.jpg"
				}
			},
			contract: {
				"address": "0x67EA526eF4b2713d248b55bafe7352b66Fd637bf",
				"chain": 31337,
				"blockNumber": "0",
				"assets": []
			}
		}, // End of first realm object <-- Added comma
		{
			stakeRealmId: 1,
			id: "podrun",
			name: "Pod Run",
			currentVersion: "0.1-DEV",
			bannerUrl: "/assets/realms/podrun/podrun.png",
			media: {
				static: {
					src: "/assets/realms/podrun/reel-1.jpg"
				}
			},
			contract: {
				"address": "0x67EA526eF4b2713d248b55bafe7352b66Fd637bf",
				"chain": 31337,
				"blockNumber": "0",
				"assets": []
			}
		}
	],
	tokenInfo: {
		address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
		chain: 31337,
		block: "0",
		totalSupply: 42_000,
		stakeLockDaysAmount: 28 * 3,
	}
}


export const CONFIG_CHECKSUM = computeChecksum(CONFIG)

CONFIG.checksum = CONFIG_CHECKSUM


// ABI fragment for LerpRealm (add more as needed)
export const LERP_REALM_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "payer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "revenueAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalValue",
				"type": "uint256"
			}
		],
		"name": "RevenueGenerated",
		"type": "event"
	}
	// Add other LerpRealm functions/events here if needed by scripts
] as const;


// ABI of the LerpToken contract
export const LERP_TOKEN_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "realmId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "unlockTime",
				"type": "uint256"
			}
		],
		"name": "TokensStaked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16[]",
				"name": "realmIds",
				"type": "uint16[]"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "users",
				"type": "address[]"
			}
		],
		"name": "WithdrawalFlagsReset",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "LOCK_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TOTAL_SUPPLY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "distributedTokens",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"name": "hasWithdrawnStake",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "users",
				"type": "address[]"
			},
			{
				"internalType": "uint16[]",
				"name": "realmIds",
				"type": "uint16[]"
			}
		],
		"name": "resetWithdrawalFlags",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "saleAvailableTokens",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "saleEndTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "saleTokenPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "realmId",
				"type": "uint16"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "stakeTokensToRealm",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stakeWithdrawalMerkleRoot",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "setSaleAvailableTokens",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "setSaleTokenPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "durationInSeconds",
				"type": "uint256"
			}
		],
		"name": "startSale",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "newRoot",
				"type": "bytes32"
			}
		],
		"name": "updateStakeWithdrawalMerkleRoot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawAllNativeCurrency",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawNativeCurrency",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "realmId",
				"type": "uint16"
			},
			{
				"internalType": "uint256",
				"name": "totalStakedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "latestUnlockTime",
				"type": "uint256"
			},
			{
				"internalType": "bytes32[]",
				"name": "merkleProof",
				"type": "bytes32[]"
			}
		],
		"name": "withdrawStakedTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const; // Add 'as const' for better type inference with wagmi