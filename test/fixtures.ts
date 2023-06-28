import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
// const hre = require('hardhat');
// import hre from "hardhat";
// console.log(ethers);
// import hardhat from "hardhat";
//  import {ethers} from "hardhat";
// import hre from "hardhat";
// import "@nomiclabs/hardhat-ethers";
// import { Contract } from "ethers";
import { withSnapshot, setupUsers } from "./utils";
// console.log("msg1");
// export const check = withSnapshot([], async function () {
//   console.log("msg4");
//   const { deployer } = await getNamedAccounts();
//   console.log("msg5");
//   const { deploy } = deployments;
//   console.log("msg6");

//   await deploy("MockAssetERC1155", {
//     from: deployer,
//     args: [],
//   });
//   const assetERC1155 = await ethers.getContract("MockAssetERC1155");
//   console.log("msg2");
//   return { assetERC1155 };
// });
// console.log("msg3");
export const setupOperatorFilter = withSnapshot(
  // ["operatorFilterSubscription", "TRUSTED_FORWARDER"],
  ["TRUSTED_FORWARDER"],

  async function () {
    // console.log("Avinash");
    const defaultSubscription = "0x3cc6CddA760b79bAfa08dF41ECFA224f810dCeB6";
    const { deployer, upgradeAdmin, assetAdmin, assetBouncerAdmin } =
      await getNamedAccounts();

    const otherAccounts = await getUnnamedAccounts();
    const { deploy } = deployments;
    await deploy("MockMarketPlace1", {
      from: deployer,
      args: [],
      log: true,
      skipIfAlreadyDeployed: true,
    });

    await deploy("MockMarketPlace2", {
      from: deployer,
      args: [],
      log: true,
      skipIfAlreadyDeployed: true,
    });
    const mockMarketPlace1 = await ethers.getContract("MockMarketPlace1");
    const mockMarketPlace2 = await ethers.getContract("MockMarketPlace2");

    await deploy("MockOperatorFilterRegistry", {
      from: deployer,
      args: [defaultSubscription, [mockMarketPlace1.address]],
      log: true,
      skipIfAlreadyDeployed: true,
    });
    const operatorFilterRegistry = await ethers.getContract(
      "MockOperatorFilterRegistry"
    );
    await deploy("OperatorFilterSubscription", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
    });
    const operatorFilterSubscription = await deployments.get(
      "OperatorFilterSubscription"
    );
    const operatorFilterRegistryAsOwner = await operatorFilterRegistry.connect(
      await ethers.getSigner(deployer)
    );
    await operatorFilterRegistryAsOwner.registerAndCopyEntries(
      operatorFilterSubscription.address,
      defaultSubscription
    );
    await deploy("MockAssetERC721", {
      from: deployer,
      args: [],
    }); 
    const assetERC721 = await ethers.getContract("MockAssetERC721");

    const users = await setupUsers(otherAccounts, { assetERC721 });
    await assetERC721.setOperatorRegistry(operatorFilterRegistry.address);
    await assetERC721.registerAndSubscribe(operatorFilterSubscription.address);
    // await assetERC721.registerAndSubscribe(defaultSubscription);
    return {
      operatorFilterRegistryAsOwner,
      operatorFilterSubscription,
      mockMarketPlace1,
      mockMarketPlace2,
      operatorFilterRegistry,
      assetERC721,
      users,
      defaultSubscription,
      deployer,
    };
  }
);
