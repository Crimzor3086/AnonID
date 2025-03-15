# DID Verification Frontend

React-based frontend for the Decentralized Identity Verification system.

## Features

- Modern React with TypeScript
- Material-UI components
- Web3 integration with ethers.js
- Responsive design
- Protected routes
- MetaMask integration

## Project Structure

```
src/
  ├── components/     # Reusable components
  │   ├── Navbar.tsx
  │   ├── Breadcrumbs.tsx
  │   └── ProtectedRoute.tsx
  │
  ├── contexts/      # React contexts
  │   └── Web3Context.tsx
  │
  ├── pages/         # Page components
  │   ├── Home.tsx
  │   ├── CreateDID.tsx
  │   ├── ManageDID.tsx
  │   └── VerifyDID.tsx
  │
  └── utils/         # Utility functions
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```env
   VITE_CONTRACT_ADDRESS=your_contract_address
   VITE_NETWORK_NAME=sepolia
   VITE_NETWORK_ID=11155111
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript checks

## Components

### Web3Context

Manages blockchain interaction:
- Wallet connection
- Contract interaction
- Network validation
- Account management

### Protected Routes

Ensures authenticated access:
- Wallet connection check
- Route protection
- Redirect handling

### Navigation

- Responsive navbar
- Breadcrumb navigation
- Dynamic route handling

## Pages

### Home

- Feature overview
- Quick access buttons
- Wallet connection status

### Create DID

- DID creation form
- Transaction handling
- Success/error feedback

### Manage DID

- List owned DIDs
- Add/update attributes
- Deactivation options

### Verify DID

- DID verification
- Attribute display
- Owner information

## Styling

- Material-UI v5
- Responsive design
- Custom theme
- Dark/light mode support

## Development

### Code Style

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component best practices

### Testing

- Unit tests with Jest
- Component testing with React Testing Library
- Integration tests for Web3 functionality

## Browser Support

- Chrome/Firefox with MetaMask
- Mobile support with MetaMask mobile
- Modern browser features required

## License

MIT
