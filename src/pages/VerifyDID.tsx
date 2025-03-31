import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import Breadcrumbs from '../components/Breadcrumbs';
import { AnonIDDescription } from '../components/AnonIDDescription';
import { ConnectionStrip } from '../components/ConnectionStrip';
import { verifyDID } from '../utils/didStorage';
import Logo from '../components/Logo';

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
  localVerification?: {
    createdAt: number;
    lastModified: number;
    isActive: boolean;
  } | null;
}

const VerifyDID: React.FC = () => {
  const navigate = useNavigate();
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

      // Validate DID format first
      if (!did.startsWith('did:edu:testnet:') || did.length !== 24) {
        setVerificationResult({
          isValid: false,
          message: 'Invalid DID format. Must be: did:edu:testnet:<8 characters>',
          details: {
            formatValid: false,
            error: 'INVALID_FORMAT'
          }
        });
        return;
      }

      // Get local verification first
      const localVerification = verifyDID(did);

      // Blockchain verification
      const [owner, isActive, attributeKeys, creationTime] = await Promise.all([
        contract.getDIDOwner(did).catch(() => null),
        contract.isDIDActive(did).catch(() => false),
        contract.getAttributeKeys(did).catch(() => []),
        contract.getDIDCreationTime(did).catch(() => 0)
      ]);

      // Check if DID exists
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

      // Get attributes if available
      const attributes = {};
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

      // Combine all verification results
      const finalResult = {
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
      };

      setVerificationResult(finalResult);
    } catch (err: any) {
      console.error('Verification error:', err);
      let errorMessage = 'Error verifying DID';
      
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Failed to read from blockchain. The contract may not be deployed on this network.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConnectionStrip />
      <Container maxWidth="md">
        <Breadcrumbs />
        
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Logo />
            <Typography variant="h4" component="h1" sx={{ color: COLORS.primary, fontWeight: 700 }}>
              Verify DID
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ color: COLORS.primary }}
            >
              Back to Home
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2, border: `1px solid ${COLORS.primary}` }}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 3, border: `1px solid ${COLORS.primary}` }}>
            <form onSubmit={handleVerify}>
              <TextField
                fullWidth
                label="Enter DID to verify"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                placeholder="e.g., did:edu:testnet:12345678"
                helperText="Enter the complete DID to verify its status"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!did || loading}
                fullWidth
                sx={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    opacity: 0.8,
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify DID'}
              </Button>
            </form>
          </Paper>

          {verificationResult && (
            <Paper sx={{ p: 3, mt: 3, border: `1px solid ${COLORS.primary}` }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {verificationResult.isValid ? (
                    <CheckCircle sx={{ fontSize: 40, color: COLORS.primary }} />
                  ) : (
                    <ErrorIcon sx={{ fontSize: 40, color: COLORS.primary }} />
                  )}
                  <Typography variant="h6" sx={{ color: COLORS.primary }}>
                    {verificationResult.isValid ? 'DID is Valid' : 'DID is Invalid'}
                  </Typography>
                </Box>

                <Alert 
                  severity={verificationResult.isValid ? "success" : "error"}
                  sx={{ border: `1px solid ${COLORS.primary}` }}
                >
                  {verificationResult.message}
                </Alert>

                {verificationResult.details &&
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: COLORS.primary }}>
                      Verification Details:
                    </Typography>
                    <Stack spacing={1}>
                      <Chip 
                        label={`Exists on Blockchain: ${verificationResult.details.exists ? 'Yes' : 'No'}`}
                        sx={{ 
                          bgcolor: verificationResult.details.exists ? `${COLORS.primary}15` : 'error.light',
                          color: verificationResult.details.exists ? COLORS.primary : 'error.main',
                          border: `1px solid ${verificationResult.details.exists ? COLORS.primary : 'error.main'}`
                        }}
                        size="small"
                      />
                      <Chip 
                        label={`Blockchain Status: ${verificationResult.details.blockchainStatus ? 'Active' : 'Inactive'}`}
                        sx={{ 
                          bgcolor: verificationResult.details.blockchainStatus ? `${COLORS.primary}15` : 'error.light',
                          color: verificationResult.details.blockchainStatus ? COLORS.primary : 'error.main',
                          border: `1px solid ${verificationResult.details.blockchainStatus ? COLORS.primary : 'error.main'}`
                        }}
                        size="small"
                      />
                      {verificationResult.details.owner && (
                        <Chip 
                          label={`Owner: ${verificationResult.details.owner.slice(0, 6)}...${verificationResult.details.owner.slice(-4)}`}
                          size="small"
                          sx={{ 
                            bgcolor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}`
                          }}
                        />
                      )}
                      {verificationResult.details.createdAt && (
                        <Chip 
                          label={`Created: ${new Date(verificationResult.details.createdAt).toLocaleString()}`}
                          size="small"
                          sx={{ 
                            bgcolor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}`
                          }}
                        />
                      )}
                      {verificationResult.details.lastModified && (
                        <Chip 
                          label={`Last Modified: ${new Date(verificationResult.details.lastModified).toLocaleString()}`}
                          size="small"
                          sx={{ 
                            bgcolor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}`
                          }}
                        />
                      )}
                      <Chip 
                        label={`Attributes: ${verificationResult.details.attributeCount}`}
                        size="small"
                        sx={{ 
                          bgcolor: `${COLORS.primary}15`,
                          color: COLORS.primary,
                          border: `1px solid ${COLORS.primary}`
                        }}
                      />
                    </Stack>
                  </Box>
                }
              </Stack>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
};

export default VerifyDID; 