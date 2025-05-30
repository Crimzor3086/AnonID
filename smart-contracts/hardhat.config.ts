import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    educhain: {
      url: process.env.RPC_URL || "https://educhain-testnet.rpc.caldera.xyz",
      chainId: 99999,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "educhain",
        chainId: 99999,
        urls: {
          apiURL: "https://explorer.educhain.xyz/api",
          browserURL: "https://explorer.educhain.xyz",
        },
      },
    ],
  },
};

export default config; 