import "@nomiclabs/hardhat-ethers"; // aliased to hardhat-deploy-ethers
// import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-etherscan";
import "dotenv/config";
import "hardhat-contract-sizer";
import "hardhat-deploy";
// import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
// import "tsconfig-paths/register";
import { HardhatUserConfig } from "hardhat/types";
import "solidity-coverage";
import { accounts, node_url } from "./utils/network";

// import  { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
  },

  namedAccounts: {
    deployer: 0,
  },
};

export default config;
