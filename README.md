# Decentralized Identity Verification (DID) System

This project implements a Decentralized Identity Verification system using blockchain technology. It allows users to create, manage, and verify their decentralized identities in a secure and privacy-preserving manner.

## Features

- **Create DID**: Create your own decentralized identity with unique attributes
- **Manage DID**: Update and manage your existing DIDs and their attributes
- **Verify DID**: Verify other users' DIDs and their associated attributes
- **Wallet Integration**: Seamless MetaMask wallet connection
- **Network Support**: Built for Sepolia testnet
- **Security**: Protected routes and secure wallet interactions

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Material-UI (MUI) components
- **Blockchain**: Ethereum (Sepolia testnet)
- **Web3**: ethers.js for blockchain interaction
- **Build Tool**: Vite
- **Smart Contract**: Solidity

## Prerequisites

- Node.js (v14 or higher)
- MetaMask browser extension
- Sepolia testnet ETH (available from faucets)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/did-verification.git
   cd did-verification
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_CONTRACT_ADDRESS=your_contract_address
   VITE_NETWORK_NAME=sepolia
   VITE_NETWORK_ID=11155111
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - Local: http://localhost:3000
   - Network: http://[your-ip]:3000

## Project Structure

```
src/
  ├── components/     # Reusable React components
  │   ├── Navbar.tsx        # Navigation bar component
  │   ├── Breadcrumbs.tsx   # Navigation breadcrumbs
  │   └── ProtectedRoute.tsx # Route protection wrapper
  │
  ├── contracts/     # Smart contract artifacts
  │   └── DIDRegistry.json  # Contract ABI and bytecode
  │
  ├── contexts/      # React contexts
  │   └── Web3Context.tsx   # Web3 provider and hooks
  │
  ├── pages/         # Page components
  │   ├── Home.tsx          # Landing page
  │   ├── CreateDID.tsx     # DID creation page
  │   ├── ManageDID.tsx     # DID management page
  │   └── VerifyDID.tsx     # DID verification page
  │
  └── utils/         # Utility functions
```

## Usage

1. **Connect Wallet**:
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Ensure you're on Sepolia testnet

2. **Create DID**:
   - Navigate to Create DID page
   - Enter your DID identifier
   - Confirm transaction in MetaMask

3. **Manage DID**:
   - View your existing DIDs
   - Add or modify attributes
   - Verify DID status

4. **Verify DID**:
   - Enter a DID to verify
   - View DID attributes and status
   - Check ownership information

## Smart Contract

The DID Registry smart contract is deployed on the Sepolia testnet. It provides the following functionality:
- DID creation and management
- Attribute storage and retrieval
- Ownership verification
- DID status tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
