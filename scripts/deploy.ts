import { ethers, run, network } from "hardhat";
import { Contract, ContractTransactionResponse } from "ethers";

async function main() {
  console.log("Starting deployment...");

  // Deploy ZKPVerifier first
  const ZKPVerifier = await ethers.getContractFactory("ZKPVerifier");
  const zkpVerifier = await ZKPVerifier.deploy() as Contract & { deployTransaction: ContractTransactionResponse };
  await zkpVerifier.waitForDeployment();
  console.log("ZKPVerifier deployed to:", await zkpVerifier.getAddress());

  // Deploy DIDRegistry with ZKPVerifier address
  const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy(await zkpVerifier.getAddress()) as Contract & { deployTransaction: ContractTransactionResponse };
  await didRegistry.waitForDeployment();
  console.log("DIDRegistry deployed to:", await didRegistry.getAddress());

  // Save deployment info
  const deploymentInfo = {
    zkpVerifier: await zkpVerifier.getAddress(),
    didRegistry: await didRegistry.getAddress(),
    chainId: (await ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment Info:", deploymentInfo);
  
  // Verify contracts on block explorer if available
  if (process.env.VERIFY_CONTRACTS === "true" && network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await zkpVerifier.deployTransaction.wait(6);
    await didRegistry.deployTransaction.wait(6);

    console.log("\nVerifying contracts...");
    try {
      await run("verify:verify", {
        address: await zkpVerifier.getAddress(),
        constructorArguments: []
      });
    } catch (e) {
      console.log("ZKPVerifier verification failed:", e.message);
    }

    try {
      await run("verify:verify", {
        address: await didRegistry.getAddress(),
        constructorArguments: [await zkpVerifier.getAddress()]
      });
    } catch (e) {
      console.log("DIDRegistry verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 