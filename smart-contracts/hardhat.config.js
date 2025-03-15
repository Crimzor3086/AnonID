require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Default to a test private key if none is provided
const defaultKey = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY = process.env.PRIVATE_KEY || defaultKey;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    educhain: {
      url: process.env.EDUCHAIN_RPC_URL || "https://testnet-rpc.educhain.io",
      accounts: [PRIVATE_KEY],
      chainId: 99999
    },
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
