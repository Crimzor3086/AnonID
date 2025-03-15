const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy ZKPVerifier first
  const ZKPVerifier = await hre.ethers.getContractFactory("ZKPVerifier");
  const zkpVerifier = await ZKPVerifier.deploy();
  await zkpVerifier.deployed();
  console.log("ZKPVerifier deployed to:", zkpVerifier.address);

  // Deploy DIDRegistry with ZKPVerifier address
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy(zkpVerifier.address);
  await didRegistry.deployed();
  console.log("DIDRegistry deployed to:", didRegistry.address);

  // Save deployment info
  const deploymentInfo = {
    zkpVerifier: zkpVerifier.address,
    didRegistry: didRegistry.address,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment Info:", deploymentInfo);
  
  // Verify contracts on Etherscan-like explorer if available
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await zkpVerifier.deployTransaction.wait(6);
    await didRegistry.deployTransaction.wait(6);

    console.log("\nVerifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: zkpVerifier.address,
        constructorArguments: []
      });
    } catch (e) {
      console.log("ZKPVerifier verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: didRegistry.address,
        constructorArguments: [zkpVerifier.address]
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
