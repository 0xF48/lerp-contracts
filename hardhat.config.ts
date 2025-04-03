import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({
  path: ".env",
});

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY must be provided as an environment variable to deploy to the live | staging");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337,
      gasPrice: 8000000000,
      // Removed explicit accounts array to use Hardhat default accounts
    },
    // polygon: {
    //   url: "https://polygon-rpc.com",
    //   gasPrice: 8000000000,
    //   chainId: 137,
    //   accounts: [PRIVATE_KEY]
    // },
    // sepolia: {
    //   url: "https://public.stackup.sh/api/v1/node/ethereum-sepolia",
    //   gasPrice: 8000000000,
    //   chainId: 11155111,
    //   accounts: [PRIVATE_KEY]
    // }
  }
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY || ""
  // }
};

export default config;