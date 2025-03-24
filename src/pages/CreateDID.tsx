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
import { isValidDID } from '../utils/didFormat';
import { ethers } from 'ethers';
import Logo from '../components/Logo';

const COLORS = {
  primary: '#ff0000',
  secondary: '#000000',
  textLight: '#ffffff',
  background: '#f5f5f5',
  paper: '#ffffff',
};

const CreateDID: React.FC = () => {
  const navigate = useNavigate();
  const { contract, isConnected, balance, account } = useWeb3();
  const [did, setDid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdDID, setCreatedDID] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Check if user has sufficient balance
  const balanceNum = balance ? parseFloat(balance) : 0;
  const hasSufficientBalance = balanceNum >= 0.001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!did || !contract || !account) {
      setError('Please connect your wallet and enter a DID');
      return;
    }

    if (!hasSufficientBalance) {
      setError('Insufficient balance. You need at least 0.001 EDU to create a DID.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsConfirming(false);

      // Validate DID format using shared utility
      if (!isValidDID(did)) {
        throw new Error('Invalid DID format. Must be: did:edu:testnet:<8 characters>');
      }

      console.log('Checking if DID exists:', did);
      
      // Check if DID already exists with better error handling
      let isActive = false;
      try {
        isActive = await contract.isDIDActive(did);
        console.log('DID active check result:', isActive);
      } catch (err: any) {
        console.log('Error checking DID existence:', err);
        // If we get a BAD_DATA error, we can assume the DID doesn't exist
        if (err.code === 'BAD_DATA' || err.message.includes('could not decode result data')) {
          isActive = false;
        } else {
          throw err;
        }
      }

      if (isActive) {
        throw new Error('This DID already exists');
      }
      
      console.log('Creating DID on blockchain:', did);
      
      // Log contract details for debugging
      console.log('Contract address:', await contract.getAddress());
      console.log('Account:', account);
      
      // Check if contract exists at the address
      const code = await contract.runner?.provider?.getCode(await contract.getAddress());
      if (!code || code === '0x') {
        throw new Error('Contract not found at the specified address');
      }
      
      // Create DID on the blockchain with modified parameters
      const tx = await contract.createDID(did, {
        gasLimit: 300000,
        from: account
      });
      
      console.log('Transaction sent:', tx.hash);
      setIsConfirming(true);
      
      // Wait for confirmation and get receipt
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      if (!receipt.status) {
        console.error('Transaction failed with receipt:', receipt);
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
      console.error('Error in handleSubmit:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        data: err.data,
        transaction: err.transaction,
        receipt: err.receipt
      });
      
      let errorMessage = 'Error creating DID';
      
      // Handle specific error cases
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to create DID';
      } else if (err.code === 'UNKNOWN_ERROR' || err.code === -32603) {
        errorMessage = `Transaction failed: ${err.message || 'Unknown error'}`;
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (err.message.includes('nonce too low')) {
        errorMessage = 'Transaction nonce error. Please try again.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to create DID';
      } else if (err.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted. Please check if the DID is already registered.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsConfirming(false);
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Logo />
            <Typography variant="h4" component="h1" sx={{ color: COLORS.primary, fontWeight: 700 }}>
              Create New DID
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

          {success && createdDID && (
            <Alert severity="success" sx={{ mb: 2, border: `1px solid ${COLORS.primary}` }}>
              DID created successfully!
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ManageAccounts />}
                  onClick={() => navigate('/manage')}
                  sx={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  Manage Your DIDs
                </Button>
              </Box>
            </Alert>
          )}

          <Paper sx={{ p: 3, bgcolor: COLORS.paper, border: `1px solid ${COLORS.primary}` }}>
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
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                      opacity: 0.8,
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
                  disabled={!did || loading || !hasSufficientBalance}
                  sx={{ 
                    flex: 1,
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                      opacity: 0.8,
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} />
                      {isConfirming ? 'Confirming...' : 'Creating DID...'}
                    </Box>
                  ) : 'Create DID'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/manage')}
                  disabled={loading}
                  sx={{ borderColor: COLORS.primary, color: COLORS.primary }}
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
              color: COLORS.textLight,
              border: `1px solid ${COLORS.primary}`
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
                  label={`${balanceNum.toFixed(3)} EDU`}
                  size="small"
                  sx={{ 
                    bgcolor: hasSufficientBalance ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
                    color: COLORS.textLight,
                    '&:hover': {
                      bgcolor: hasSufficientBalance ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.3)'
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