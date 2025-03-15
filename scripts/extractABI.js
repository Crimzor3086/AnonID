const fs = require('fs');
const path = require('path');

// Read the compiled contract
const contractArtifact = require('../src/contracts/artifacts/src/contracts/DIDRegistry.sol/DIDRegistry.json');

// Extract just the ABI
const abi = contractArtifact.abi;

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, '../src/contracts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the ABI to a new file
fs.writeFileSync(
  path.join(outputDir, 'DIDRegistry.json'),
  JSON.stringify(abi, null, 2)
); 