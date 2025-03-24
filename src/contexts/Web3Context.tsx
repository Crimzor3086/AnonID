import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import DIDRegistryJSON from '../contracts/DIDRegistry.json';

const DIDRegistryABI = DIDRegistryJSON.abi;

// Network configuration from environment variables
const NETWORK_CONFIG = {
  name: import.meta.env.VITE_NETWORK_NAME || 'educhain',
  chainId: Number(import.meta.env.VITE_NETWORK_ID) || 99999,
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://educhain-testnet.rpc.caldera.xyz',
  nativeCurrency: {
    name: 'EDU',
    symbol: 'EDU',
    decimals: 18
  }
};

// Contract configuration
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x558E0Af2a933B4cA111b27Eb326765eA6cBbb5EC';

interface Web3ContextType {
  account: string | null;
  contract: ethers.Contract | null;
  provider: ethers.Provider | null;
  isConnected: boolean;
  error: string | null;
  networkName: string | null;
  isLoading: boolean;
  balance: string | null;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  contract: null,
  provider: null,
  isConnected: false,
  error: null,
  networkName: null,
  isLoading: false,
  balance: null,
  connectWallet: async () => {},
});

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const updateBalance = async (address: string, provider: ethers.Provider) => {
    try {
      console.log('Fetching balance for address:', address);
      console.log('Using RPC URL:', NETWORK_CONFIG.rpcUrl);
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      console.log('Raw balance:', balance.toString());
      console.log('Formatted balance:', formattedBalance);
      setBalance(formattedBalance);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'Unknown code',
        stack: error?.stack || 'No stack trace'
      });
      setBalance(null);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log('Connected account:', account);

      // Create provider from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get the signer
      const signer = await provider.getSigner();
      
      // Initialize contract with signer
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DIDRegistryABI,
        signer
      );

      // Set state
      setProvider(provider);
      setAccount(account);
      setContract(contract);
      setNetworkName(NETWORK_CONFIG.name);

      // Update balance
      await updateBalance(account, provider);

      // Set up event listeners for account changes
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccount(null);
          setContract(null);
          setBalance(null);
        } else {
          // User switched accounts
          setAccount(accounts[0]);
          await updateBalance(accounts[0], provider);
        }
      });

      // Set up event listeners for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Set up periodic balance updates
      const interval = setInterval(() => updateBalance(account, provider), 15000);
      return () => clearInterval(interval);

    } catch (error: any) {
      console.error('Connection error:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'Unknown code',
        stack: error?.stack || 'No stack trace'
      });
      setError(`Connection failed: ${error?.message || 'Unknown error'}. Please check your MetaMask connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize connection on mount
  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        provider,
        isConnected: !!account,
        error,
        networkName,
        isLoading,
        balance,
        connectWallet: async () => {
          await connectWallet();
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

declare global {
  interface Window {
    ethereum: any;
  }
} 