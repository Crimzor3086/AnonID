/**
 * DID Format: did:edu:<network>:<unique-identifier>
 * Example: did:edu:testnet:0x1234...5678
 */

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string[];
  publicKey: {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
  }[];
  service: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
  created: string;
  updated: string;
}

export const DID_PREFIX = 'did:edu';
export const NETWORK = 'testnet';

export function createDID(address: string): string {
  // Remove '0x' prefix if present and take first 8 characters
  const uniqueId = address.replace('0x', '').slice(0, 8);
  return `${DID_PREFIX}:${NETWORK}:${uniqueId}`;
}

export function createDIDDocument(address: string, publicKey: string): DIDDocument {
  const did = createDID(address);
  const now = new Date().toISOString();
  
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: did,
    controller: [did],
    publicKey: [{
      id: `${did}#keys-1`,
      type: 'Secp256k1VerificationKey2018',
      controller: did,
      publicKeyHex: publicKey
    }],
    service: [{
      id: `${did}#service-1`,
      type: 'LinkedDomains',
      serviceEndpoint: 'https://anonid.example.com'
    }],
    created: now,
    updated: now
  };
}

// Sample DIDs for testing
export const SAMPLE_DIDS = {
  student: {
    address: '0x1234567890123456789012345678901234567890',
    did: 'did:edu:testnet:12345678',
    document: {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: 'did:edu:testnet:12345678',
      controller: ['did:edu:testnet:12345678'],
      publicKey: [{
        id: 'did:edu:testnet:12345678#keys-1',
        type: 'Secp256k1VerificationKey2018',
        controller: 'did:edu:testnet:12345678',
        publicKeyHex: '0x04...' // Public key would be here
      }],
      service: [{
        id: 'did:edu:testnet:12345678#service-1',
        type: 'LinkedDomains',
        serviceEndpoint: 'https://anonid.example.com'
      }],
      created: '2024-03-20T10:00:00Z',
      updated: '2024-03-20T10:00:00Z'
    }
  },
  institution: {
    address: '0x9876543210987654321098765432109876543210',
    did: 'did:edu:testnet:98765432',
    document: {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: 'did:edu:testnet:98765432',
      controller: ['did:edu:testnet:98765432'],
      publicKey: [{
        id: 'did:edu:testnet:98765432#keys-1',
        type: 'Secp256k1VerificationKey2018',
        controller: 'did:edu:testnet:98765432',
        publicKeyHex: '0x04...' // Public key would be here
      }],
      service: [{
        id: 'did:edu:testnet:98765432#service-1',
        type: 'LinkedDomains',
        serviceEndpoint: 'https://anonid.example.com'
      }],
      created: '2024-03-20T10:00:00Z',
      updated: '2024-03-20T10:00:00Z'
    }
  }
};

// Validation functions
export function isValidDID(did: string): boolean {
  const pattern = new RegExp(`^${DID_PREFIX}:${NETWORK}:[a-fA-F0-9]{8}$`);
  return pattern.test(did);
}

export function extractAddressFromDID(did: string): string | null {
  if (!isValidDID(did)) return null;
  const parts = did.split(':');
  return `0x${parts[3]}`;
} 