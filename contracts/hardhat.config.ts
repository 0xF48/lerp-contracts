import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import * as dotenv from "dotenv";
import { ethers } from "ethers"; // Keep this if used elsewhere, otherwise can remove

dotenv.config({
  path: ".env", // Ensure this points to your .env file in the contracts directory
});

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Validate PRIVATE_KEY format if it exists (basic check)
if (PRIVATE_KEY && !/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.warn("Warning: PRIVATE_KEY in .env file appears invalid. Ensure it's a 64-character hex string prefixed with 0x.");
}

// Optional: Keep the check or remove if relying on conditional accounts array
// if (process.env.HARDHAT_NETWORK && process.env.HARDHAT_NETWORK !== 'hardhat') {
//   if (!PRIVATE_KEY) {
//     throw new Error("PRIVATE_KEY must be provided as an environment variable to deploy to the live | staging");
//   }
// }

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: { // Configuration for the node started with `npx hardhat node`
      chainId: 31337,
      accounts: PRIVATE_KEY
        ? [{
          privateKey: PRIVATE_KEY,
          balance: "7777000000000000000000", // 7777 ETH in Wei as string
        }]
        : [], // Use default accounts if no private key is provided
    },
    localhost: { // Network for scripts/frontend to connect to the running node
      url: "http://127.0.0.1:8545",
      chainId: 31337, // Should match the chainId of the running node
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], // Use private key from .env for deployments
    },
    // polygon: {
    //   url: "https://polygon-rpc.com",
    //   gasPrice: 8000000000,
    //   chainId: 137,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    // },
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || "https://public.stackup.sh/api/v1/node/ethereum-sepolia",
    //   gasPrice: 8000000000,
    //   chainId: 11155111,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    // }
  }
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY || ""
  // }
};

export default config;