# AnonID - Decentralized Identity Verification System

A modern web application for creating, managing, and verifying Decentralized Identifiers (DIDs) on the Educhain testnet.

![AnonID Logo](src/components/Logo.tsx)

## Features

- 🔐 Create and manage Decentralized Identifiers (DIDs)
- 🔍 Verify DIDs on the blockchain
- 💼 Manage DID attributes and metadata
- 🔗 Built on Educhain testnet
- 🎨 Modern UI with AnonID branding
- 🔒 Secure wallet integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- EDU tokens on Educhain testnet (minimum 0.001 EDU)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Crimzor3086/AnonID.git
cd AnonID-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_RPC_URL=your_rpc_url
```

## Smart Contract Deployment

1. Navigate to the smart contracts directory:
```bash
cd smart-contracts
```

2. Install dependencies:
```bash
npm install
```

3. Deploy the contract:
```bash
npx hardhat run scripts/deploy.ts --network educhain
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Connect your Web3 wallet (MetaMask recommended)

3. Ensure you have sufficient EDU tokens (minimum 0.001 EDU)

4. Access the application at `http://localhost:5173`

## Features in Detail

### Create DID
- Generate unique DIDs
- Automatic DID suggestion based on wallet address
- Blockchain verification
- Local storage backup

### Manage DID
- View all your DIDs
- Add/update DID attributes
- Deactivate DIDs
- View DID history

### Verify DID
- Verify DIDs on the blockchain
- Check DID status and attributes
- View detailed verification results
- Local and blockchain verification

## Technology Stack

- React + TypeScript
- Vite
- Material-UI
- Ethers.js
- Hardhat
- Solidity

## Smart Contract

The DID Registry contract provides the following main functions:
- `createDID(string memory did)`
- `isDIDActive(string memory did)`
- `getDIDOwner(string memory did)`
- `setAttribute(string memory did, string memory key, string memory value)`
- `getAttribute(string memory did, string memory key)`
- `deactivateDID(string memory did)`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- GitHub: [Crimzor3086](https://github.com/Crimzor3086)
- Email: b3masendi7@gmail.com

## Acknowledgments

- Educhain testnet team
- OpenZeppelin for smart contract templates
- Material-UI for the component library
