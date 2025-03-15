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
  Grid,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, ManageAccounts, AutoAwesome } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import Breadcrumbs from '../components/Breadcrumbs';
import { AnonIDDescription } from '../components/AnonIDDescription';
import { ConnectionStrip } from '../components/ConnectionStrip';
import { SAMPLE_DIDS } from '../utils/didFormat';
import { storeDID } from '../utils/didStorage';

const COLORS = {
  primary: '#1a237e',
  secondary: '#6a1b9a',
  textLight: '#ffffff',
};

const CreateDID: React.FC = () => {
  const navigate = useNavigate();
  const { contract, isConnected, balance, account } = useWeb3();
  const [did, setDid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdDID, setCreatedDID] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!did || !contract || !account) {
      setError('Please connect your wallet and enter a DID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate DID format
      if (!did.startsWith('did:edu:testnet:') || did.length !== 24) {
        throw new Error('Invalid DID format. Must be: did:edu:testnet:<8 characters>');
      }

      // Check if DID already exists
      const existingDID = await contract.getDID(did);
      if (existingDID && existingDID !== '0x0000000000000000000000000000000000000000') {
        throw new Error('This DID already exists');
      }
      
      // Create DID on the blockchain
      const tx = await contract.createDID(did, {
        gasLimit: 200000 // Add reasonable gas limit
      });
      
      // Wait for confirmation and get receipt
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error('Transaction failed');
      }
      
      // Store DID locally with additional metadata
      storeDID(did, account, {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        timestamp: new Date().toISOString()
      });
      
      setSuccess(true);
      setCreatedDID(did);
      
      // Navigate to manage page after short delay
      setTimeout(() => {
        navigate('/manage');
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Error creating DID';
      
      // Handle specific error cases
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to create DID';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const suggestDID = () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    // Generate DID using first 8 characters of the address
    const uniqueIdentifier = account.slice(2, 10).toLowerCase();
    const suggestedDID = `did:edu:testnet:${uniqueIdentifier}`;
    setDid(suggestedDID);
  };

  return (
    <>
      <ConnectionStrip />
      <Container maxWidth="sm">
        <Breadcrumbs />
        
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <AnonIDDescription variant="dark" compact />
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Stack>

          <Typography variant="h4" component="h1" gutterBottom>
            Create New DID
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && createdDID && (
            <Alert severity="success" sx={{ mb: 2 }}>
              DID created successfully!
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ManageAccounts />}
                  onClick={() => navigate('/manage')}
                >
                  Manage Your DIDs
                </Button>
              </Box>
            </Alert>
          )}

          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Enter DID"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 1 }}
                />
                <Button
                  startIcon={<AutoAwesome />}
                  onClick={suggestDID}
                  disabled={loading || !isConnected}
                  size="small"
                  sx={{ 
                    mt: 1,
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.secondaryLight} 100%)`,
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    }
                  }}
                >
                  Suggest DID
                </Button>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!did || loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create DID'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/manage')}
                  disabled={loading}
                >
                  View Existing DIDs
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Sample DIDs Section */}
          <Paper 
            sx={{ 
              p: 3, 
              mt: 4,
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              color: COLORS.textLight
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.textLight }}>
              Sample DIDs
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
              Here are some example DIDs to help you understand the format:
            </Typography>
            
            <Grid container spacing={3}>
              {/* Student DID */}
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ color: COLORS.textLight }}>
                    Student DID
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                    Address: {`${SAMPLE_DIDS.student.address.slice(0, 4)}...${SAMPLE_DIDS.student.address.slice(-4)}`}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                    DID: {SAMPLE_DIDS.student.did}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Created: {SAMPLE_DIDS.student.document.created}
                  </Typography>
                </Paper>
              </Grid>

              {/* Institution DID */}
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ color: COLORS.textLight }}>
                    Institution DID
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                    Address: {`${SAMPLE_DIDS.institution.address.slice(0, 4)}...${SAMPLE_DIDS.institution.address.slice(-4)}`}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                    DID: {SAMPLE_DIDS.institution.did}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Created: {SAMPLE_DIDS.institution.document.created}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* DID Format Explanation */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: COLORS.textLight }}>
                DID Format Explanation
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }} paragraph>
                The DID format follows the pattern: did:edu:testnet:&lt;unique-identifier&gt;
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }} component="div">
                <ul>
                  <li><strong>did:edu</strong> - The DID method identifier for Educhain</li>
                  <li><strong>testnet</strong> - The network identifier (testnet/mainnet)</li>
                  <li><strong>unique-identifier</strong> - First 8 characters of the Ethereum address</li>
                </ul>
              </Typography>
            </Box>

            {/* Minimum Token Requirement Footnote */}
            <Box sx={{ 
              mt: 4, 
              pt: 2, 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Minimum token requirement: 0.001 EDU
              </Typography>
              <Tooltip title="Required for DID operations">
                <Chip
                  label="0.001 EDU"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: COLORS.textLight,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                />
              </Tooltip>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default CreateDID; 