/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_ALCHEMY_API_KEY: string;
  readonly VITE_NETWORK_NAME: string;
  readonly VITE_NETWORK_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 