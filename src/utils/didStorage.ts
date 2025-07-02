import { DID_PREFIX, NETWORK } from './didFormat';

interface DIDRecord {
  did: string;
  address: string;
  createdAt: string;
  attributes: { [key: string]: string };
  isActive: boolean;
  lastModified: string;
  history: Array<{
    action: 'create' | 'update' | 'deactivate' | 'reactivate';
    timestamp: string;
    details?: string;
  }>;
}

interface DIDStorage {
  [address: string]: DIDRecord[];
}

interface StorageError extends Error {
  code: 'STORAGE_FULL' | 'INVALID_DATA' | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'OPERATION_FAILED';
  details?: any;
}

// Storage key for local storage
const STORAGE_KEY = 'anonid_dids';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ENCRYPTION_KEY = 'anonid-demo-key'; // TODO: Derive from wallet or user input in production

// Logger
const log = {
  info: (message: string, data?: any) => {
    console.log(`[DID Storage] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[DID Storage Error] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[DID Storage Warning] ${message}`, data || '');
  }
};

// Create custom error
const createError = (code: StorageError['code'], message: string, details?: any): StorageError => {
  const error = new Error(message) as StorageError;
  error.code = code;
  error.details = details;
  return error;
};

async function encrypt(text: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );
  return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(ciphertext)));
}

async function decrypt(data: string): Promise<string> {
  const raw = atob(data);
  const iv = new Uint8Array([...raw].slice(0, 12).map(c => c.charCodeAt(0)));
  const ciphertext = new Uint8Array([...raw].slice(12).map(c => c.charCodeAt(0)));
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

// Initialize storage with error handling
const initializeStorage = async (): Promise<DIDStorage> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      log.info('Initializing empty storage');
      return {};
    }
    const decrypted = await decrypt(stored);
    const parsed = JSON.parse(decrypted);
    log.info('Storage initialized', { size: stored.length, addresses: Object.keys(parsed).length });
    return parsed;
  } catch (err) {
    log.error('Failed to initialize storage', err);
    throw createError('INVALID_DATA', 'Failed to initialize storage', err);
  }
};

// Save storage with size check
const saveStorage = async (storage: DIDStorage): Promise<void> => {
  try {
    const serialized = JSON.stringify(storage);
    if (serialized.length > MAX_STORAGE_SIZE) {
      throw createError('STORAGE_FULL', 'Storage size limit exceeded');
    }
    const encrypted = await encrypt(serialized);
    localStorage.setItem(STORAGE_KEY, encrypted);
    log.info('Storage saved', { size: encrypted.length, addresses: Object.keys(storage).length });
  } catch (err) {
    log.error('Failed to save storage', err);
    throw err instanceof Error ? err : createError('OPERATION_FAILED', 'Failed to save storage', err);
  }
};

// Add a new DID with history
export const storeDID = (
  did: string,
  address: string,
  attributes: { [key: string]: string } = {}
): void => {
  try {
    const storage = initializeStorage();
    const now = new Date().toISOString();
    
    // Initialize the array for this address if it doesn't exist
    if (!storage[address]) {
      storage[address] = [];
    }

    // Check if DID already exists
    const existingDIDIndex = storage[address].findIndex(record => record.did === did);
    
    if (existingDIDIndex !== -1) {
      // Update existing DID
      const existingDID = storage[address][existingDIDIndex];
      existingDID.attributes = { ...existingDID.attributes, ...attributes };
      existingDID.isActive = true;
      existingDID.lastModified = now;
      if (!existingDID.history) {
        existingDID.history = [];
      }
      existingDID.history.push({
        action: 'update',
        timestamp: now,
        details: 'Updated attributes and reactivated'
      });
    } else {
      // Create new DID record
      const newRecord: DIDRecord = {
        did,
        address,
        createdAt: now,
        lastModified: now,
        attributes,
        isActive: true,
        history: [{
          action: 'create',
          timestamp: now,
          details: 'Initial creation'
        }]
      };
      storage[address].push(newRecord);
    }

    saveStorage(storage);
    log.info('DID operation completed', { 
      did, 
      address, 
      operation: existingDIDIndex !== -1 ? 'update' : 'create' 
    });
  } catch (err) {
    log.error('Failed to store DID', { did, address, error: err });
    throw err;
  }
};

// Export storage data
export const exportDIDStorage = (address?: string): string => {
  try {
    const storage = initializeStorage();
    const dataToExport = address ? { [address]: storage[address] } : storage;
    const exported = JSON.stringify(dataToExport, null, 2);
    log.info('Storage exported', { size: exported.length, addresses: Object.keys(dataToExport).length });
    return exported;
  } catch (err) {
    log.error('Failed to export storage', err);
    throw createError('OPERATION_FAILED', 'Failed to export storage', err);
  }
};

// Import storage data
export const importDIDStorage = (data: string, merge = false): void => {
  try {
    const imported = JSON.parse(data);
    const existing = merge ? initializeStorage() : {};
    
    // Validate imported data structure
    for (const address in imported) {
      if (!Array.isArray(imported[address])) {
        throw createError('INVALID_DATA', 'Invalid data structure');
      }
    }

    const merged = merge
      ? { ...existing, ...imported }
      : imported;

    saveStorage(merged);
    log.info('Storage imported', { 
      merged, 
      addresses: Object.keys(merged).length,
      mode: merge ? 'merge' : 'replace'
    });
  } catch (err) {
    log.error('Failed to import storage', err);
    throw err instanceof Error ? err : createError('OPERATION_FAILED', 'Failed to import storage', err);
  }
};

// Get DIDs for an address with error handling
export const getDIDsForAddress = (address: string): DIDRecord[] => {
  try {
    const storage = initializeStorage();
    const records = storage[address] || [];
    log.info('Retrieved DIDs for address', { address, count: records.length });
    return records;
  } catch (err) {
    log.error('Failed to get DIDs for address', { address, error: err });
    throw err;
  }
};

// Get a specific DID record with detailed error handling
export const getDIDRecord = (did: string): DIDRecord | null => {
  try {
    const storage = initializeStorage();
    for (const address in storage) {
      const record = storage[address].find(r => r.did === did);
      if (record) {
        log.info('DID record found', { did, address });
        return record;
      }
    }
    log.warn('DID record not found', { did });
    return null;
  } catch (err) {
    log.error('Failed to get DID record', { did, error: err });
    throw err;
  }
};

// Update DID attributes with history
export const updateDIDAttributes = (
  did: string,
  address: string,
  attributes: { [key: string]: string }
): void => {
  try {
    const storage = initializeStorage();
    if (!storage[address]) {
      throw createError('NOT_FOUND', 'Address not found');
    }

    const record = storage[address].find(r => r.did === did);
    if (!record) {
      throw createError('NOT_FOUND', 'DID not found');
    }

    const now = new Date().toISOString();
    record.attributes = { ...record.attributes, ...attributes };
    record.lastModified = now;
    record.history.push({
      action: 'update',
      timestamp: now,
      details: `Updated attributes: ${Object.keys(attributes).join(', ')}`
    });

    saveStorage(storage);
    log.info('DID attributes updated', { did, address, attributes });
  } catch (err) {
    log.error('Failed to update DID attributes', { did, address, attributes, error: err });
    throw err;
  }
};

// Deactivate a DID with history
export const deactivateDID = (did: string, address: string): void => {
  try {
    const storage = initializeStorage();
    if (!storage[address]) {
      throw createError('NOT_FOUND', 'Address not found');
    }

    const record = storage[address].find(r => r.did === did);
    if (!record) {
      throw createError('NOT_FOUND', 'DID not found');
    }

    const now = new Date().toISOString();
    record.isActive = false;
    record.lastModified = now;
    record.history.push({
      action: 'deactivate',
      timestamp: now,
      details: 'DID deactivated'
    });

    saveStorage(storage);
    log.info('DID deactivated', { did, address });
  } catch (err) {
    log.error('Failed to deactivate DID', { did, address, error: err });
    throw err;
  }
};

// Verify a DID with enhanced checks
export const verifyDID = (did: string): {
  isValid: boolean;
  record: DIDRecord | null;
  message: string;
  details?: any;
} => {
  try {
    // Validate DID format
    const pattern = new RegExp(`^${DID_PREFIX}:${NETWORK}:[a-fA-F0-9]{8}$`);
    if (!pattern.test(did)) {
      return {
        isValid: false,
        record: null,
        message: 'Invalid DID format',
        details: {
          error: 'INVALID_FORMAT',
          expectedFormat: `${DID_PREFIX}:${NETWORK}:<8 hex characters>`,
          received: did
        }
      };
    }

    // Get DID record
    const storage = initializeStorage();
    let record: DIDRecord | null = null;

    // Search through all addresses
    for (const address in storage) {
      const found = storage[address].find(r => r.did === did);
      if (found) {
        record = found;
        break;
      }
    }

    if (!record) {
      return {
        isValid: false,
        record: null,
        message: 'DID not found in local storage',
        details: {
          error: 'NOT_FOUND',
          storageSize: Object.keys(storage).length
        }
      };
    }

    // Check if DID is active
    if (!record.isActive) {
      return {
        isValid: false,
        record,
        message: 'DID is deactivated in local storage',
        details: {
          error: 'INACTIVE',
          deactivationTime: record.history.find(h => h.action === 'deactivate')?.timestamp,
          lastModified: record.lastModified
        }
      };
    }

    // Calculate time-based validity
    const now = new Date();
    const createdAt = new Date(record.createdAt);
    const lastModified = new Date(record.lastModified);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceModification = Math.floor((now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isValid: true,
      record,
      message: 'DID is valid in local storage',
      details: {
        address: record.address,
        createdAt: record.createdAt,
        lastModified: record.lastModified,
        daysSinceCreation,
        daysSinceModification,
        attributeCount: Object.keys(record.attributes).length,
        historyCount: record.history.length,
        lastAction: record.history[record.history.length - 1],
        transactionHash: record.attributes.transactionHash,
        blockNumber: record.attributes.blockNumber
      }
    };
  } catch (err) {
    log.error('Error verifying DID', err);
    return {
      isValid: false,
      record: null,
      message: 'Error verifying DID',
      details: {
        error: 'VERIFICATION_ERROR',
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      }
    };
  }
}; 