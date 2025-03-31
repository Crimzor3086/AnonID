import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import Breadcrumbs from '../components/Breadcrumbs';
import { useWeb3 } from '../contexts/Web3Context';
import { verifyDID } from '../utils/didStorage';

const COLORS = {
  primary: '#ff0000',
  secondary: '#000000',
  textLight: '#ffffff',
};

interface VerificationDetails {
  formatValid?: boolean;
  error?: string;
  blockchainStatus?: boolean;
  locallyStored?: boolean;
  exists?: boolean;
  owner?: string;
  creationTime?: string | null;
  attributeCount?: number;
  attributes?: Record<string, string>;
  localVerification?: {
    createdAt?: string;
    lastModified?: string;
    isActive: boolean;
    history?: Array<{
      action: 'create' | 'update' | 'deactivate' | 'reactivate';
      timestamp: string;
      details?: string;
    }>;
  } | null;
  verificationTime?: string;
}

const VerifyDID: React.FC = () => {
  const { contract } = useWeb3();
  const [did, setDid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    details?: VerificationDetails;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!did) {
      setError('Please enter a DID to verify');
      return;
    }
    
    if (!contract) {
      setError('Please connect your wallet to verify DIDs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setVerificationResult(null);

      const localVerification = verifyDID(did);
      const [owner, isActive, attributeKeys, creationTime] = await Promise.all([
        contract.getDIDOwner(did).catch(() => null),
        contract.isDIDActive(did).catch(() => false),
        contract.getAttributeKeys(did).catch(() => []),
        contract.getDIDCreationTime(did).catch(() => 0),
      ]);

      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        setVerificationResult({
          isValid: false,
          message: 'DID does not exist on the blockchain',
          details: {
            blockchainStatus: false,
            locallyStored: localVerification.record !== null,
            error: 'NOT_FOUND',
            localVerification: localVerification.record ? {
              createdAt: localVerification.record.createdAt,
              lastModified: localVerification.record.lastModified,
              isActive: localVerification.record.isActive
            } : null
          }
        });
        return;
      }

      const attributes: Record<string, string> = {};
      if (attributeKeys && attributeKeys.length > 0) {
        await Promise.all(
          attributeKeys.map(async (key: string) => {
            try {
              const value = await contract.getAttribute(did, key);
              if (value) {
                attributes[key] = value;
              }
            } catch (err) {
              console.warn(`Failed to fetch attribute ${key}:`, err);
            }
          })
        );
      }

      setVerificationResult({
        isValid: isActive,
        message: isActive 
          ? 'DID is valid and active' 
          : 'DID exists but is not active on the blockchain',
        details: {
          formatValid: true,
          exists: true,
          blockchainStatus: isActive,
          owner,
          creationTime: creationTime ? new Date(creationTime * 1000).toISOString() : null,
          attributeCount: attributeKeys.length,
          attributes,
          locallyStored: localVerification.record !== null,
          localVerification: localVerification.record ? {
            createdAt: localVerification.record.createdAt,
            lastModified: localVerification.record.lastModified,
            isActive: localVerification.record.isActive,
            history: localVerification.record.history
          } : null,
          verificationTime: new Date().toISOString()
        }
      });
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Error verifying DID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Breadcrumbs />
      <Typography variant="h4" component="h1" sx={{ color: COLORS.primary, fontWeight: 700 }}>
        Verify DID
      </Typography>
      <form onSubmit={handleVerify}>
        <TextField
          fullWidth
          label="Enter DID to verify"
          value={did}
          onChange={(e) => setDid(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" variant="contained" disabled={!did || loading}>
          {loading ? <CircularProgress size={24} /> : 'Verify DID'}
        </Button>
      </form>
      {error && <Alert severity="error">{error}</Alert>}
    </Container>
  );
};

export default VerifyDID;
