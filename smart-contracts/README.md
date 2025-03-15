# DID Registry Smart Contracts

This directory contains the smart contracts for the Decentralized Identity (DID) system.

## Main Contract: DIDRegistry

The DIDRegistry contract manages decentralized identities on the Ethereum blockchain.

### Features

- Create and manage DIDs
- Add and update DID attributes
- Verify DID ownership and status
- Deactivate DIDs
- Query DID information

### Contract Functions

#### DID Management
- `createDID(string did)`: Create a new DID
- `deactivateDID(string did)`: Deactivate an existing DID
- `setAttribute(string did, string key, string value)`: Add/update DID attribute

#### DID Queries
- `isActive(string did)`: Check if a DID is active
- `getOwner(string did)`: Get the owner of a DID
- `getAttribute(string did, string key)`: Get a DID's attribute value
- `getAttributeKeys(string did)`: Get all attribute keys for a DID
- `getOwnerDIDs(address owner)`: Get all DIDs owned by an address

### Events

- `DIDCreated(string did, address owner)`
- `DIDDeactivated(string did)`
- `AttributeSet(string did, string key, string value)`

## Development

### Prerequisites

- Hardhat or Truffle
- Node.js
- Ethereum wallet (MetaMask)

### Deployment

1. Configure network in hardhat.config.js/truffle-config.js
2. Set environment variables in .env
3. Run deployment script
4. Save contract address and ABI

### Testing

```bash
# Run tests
npm run test

# Run coverage
npm run coverage
```

## Security

- Access control for DID operations
- Only owner can modify DID
- Deactivation is permanent
- Events for all state changes

## License

MIT
