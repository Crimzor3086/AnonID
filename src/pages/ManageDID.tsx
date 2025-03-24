import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Add, Verified, Refresh } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import Breadcrumbs from '../components/Breadcrumbs';
import { AnonIDDescription } from '../components/AnonIDDescription';
import { ConnectionStrip } from '../components/ConnectionStrip';
import { getDIDsForAddress, updateDIDAttributes, deactivateDID as deactivateStoredDID } from '../utils/didStorage';
import Logo from '../components/Logo';

const COLORS = {
  primary: '#ff0000',
  secondary: '#000000',
  textLight: '#ffffff',
};

const ManageDID: React.FC = () => {
  const navigate = useNavigate();
  const { contract, account, isConnected, balance } = useWeb3();
  const [dids, setDids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [selectedDID, setSelectedDID] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUserDIDs = async () => {
    if (!contract || !account) {
      setDids([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get DIDs from blockchain
      const chainDIDs = await contract.getOwnerDIDs(account).catch((err: any) => {
        console.log('Error fetching DIDs:', err);
        if (err.message.includes('could not decode result data') || err.code === 'BAD_DATA') {
          return [];
        }
        throw err;
      });

      // Get DIDs from local storage
      const storedDIDs = getDIDsForAddress(account);
      const storedDIDsList = storedDIDs.filter(record => record.isActive).map(record => record.did);

      // Combine and deduplicate DIDs
      const allDIDs = Array.from(new Set([...storedDIDsList, ...(Array.isArray(chainDIDs) ? chainDIDs : [])]));
      
      console.log('Fetched DIDs:', { chainDIDs, storedDIDs, allDIDs });
      setDids(allDIDs);
    } catch (err: any) {
      console.error('Error loading DIDs:', err);
      setError(err.message || 'Error loading DIDs');
      setDids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account && contract) {
      loadUserDIDs();
    }
  }, [isConnected, account, contract]);

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDID || !attributeKey || !attributeValue || !account) return;

    try {
      setLoading(true);
      setError(null);
      
      // Add attribute on blockchain
      const tx = await contract?.setAttribute(selectedDID, attributeKey, attributeValue);
      await tx.wait();
      
      // Update local storage
      updateDIDAttributes(selectedDID, account, { [attributeKey]: attributeValue });
      
      setSuccess('Attribute added successfully!');
      setAttributeKey('');
      setAttributeValue('');
      await loadUserDIDs();
    } catch (err: any) {
      setError(err.message || 'Error adding attribute');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDID = async (did: string) => {
    if (!account) return;

    try {
      setLoading(true);
      setError(null);
      
      // Deactivate on blockchain
      const tx = await contract?.deactivateDID(did);
      await tx.wait();
      
      // Deactivate in local storage
      deactivateStoredDID(did, account);
      
      await loadUserDIDs();
    } catch (err: any) {
      setError(err.message || 'Error deactivating DID');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <ConnectionStrip />
        <Container maxWidth="sm">
          <Alert severity="warning" sx={{ mt: 4 }}>
            Please connect your wallet to manage your DIDs
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <ConnectionStrip />
      <Container maxWidth="md">
        <Breadcrumbs />
        
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Logo />
            <Typography variant="h4" component="h1" sx={{ color: COLORS.primary, fontWeight: 700 }}>
              Manage Your DIDs
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
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => navigate('/create')}
              sx={{ 
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                  opacity: 0.8,
                }
              }}
            >
              Create New DID
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2, border: `1px solid ${COLORS.primary}` }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, border: `1px solid ${COLORS.primary}` }}>
              {success}
            </Alert>
          )}

          {loading && !error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          )}

          <Paper sx={{ p: 3, mb: 3, border: `1px solid ${COLORS.primary}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: COLORS.primary }}>
                Your DIDs
              </Typography>
              <Tooltip title="Refresh DIDs list">
                <IconButton 
                  onClick={loadUserDIDs} 
                  disabled={loading}
                  sx={{
                    color: COLORS.primary,
                    '&:hover': {
                      bgcolor: `${COLORS.primary}15`,
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color: COLORS.primary }} />
                <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                  {dids.length === 0 ? 'Loading your DIDs...' : 'Refreshing DIDs list...'}
                </Typography>
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2, border: `1px solid ${COLORS.primary}` }}
                action={
                  <Button color="inherit" size="small" onClick={loadUserDIDs}>
                    Try Again
                  </Button>
                }
              >
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {error}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This could be due to network issues or contract interaction problems.
                </Typography>
              </Alert>
            )}
            
            {!loading && !error && dids.length === 0 ? (
              <Alert severity="info" sx={{ border: `1px solid ${COLORS.primary}` }}>
                You don't have any DIDs yet.
                <Button
                  size="small"
                  onClick={() => navigate('/create')}
                  sx={{ ml: 2, color: COLORS.primary }}
                >
                  Create Your First DID
                </Button>
              </Alert>
            ) : !loading && !error && (
              <List>
                {dids.map((did, index) => (
                  <React.Fragment key={did}>
                    <ListItem
                      selected={selectedDID === did}
                      onClick={() => setSelectedDID(did)}
                      sx={{ 
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: `${COLORS.primary}15`,
                        },
                        '&.Mui-selected': {
                          bgcolor: `${COLORS.primary}25`,
                          '&:hover': {
                            bgcolor: `${COLORS.primary}35`,
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={did}
                        secondary={
                          <Chip
                            size="small"
                            label={selectedDID === did ? 'Selected' : 'Click to select'}
                            sx={{ 
                              bgcolor: selectedDID === did ? `${COLORS.primary}15` : undefined,
                              borderColor: selectedDID === did ? COLORS.primary : undefined,
                              borderWidth: selectedDID === did ? 1 : undefined,
                              borderStyle: selectedDID === did ? 'solid' : undefined,
                              color: selectedDID === did ? COLORS.primary : undefined
                            }}
                          />
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<Verified />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/verify?did=${did}`);
                        }}
                        sx={{
                          color: COLORS.primary,
                          '&:hover': {
                            bgcolor: `${COLORS.primary}15`,
                          }
                        }}
                      >
                        Verify
                      </Button>
                    </ListItem>
                    {index < dids.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {selectedDID && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Attribute to {selectedDID}
              </Typography>
              <form onSubmit={handleAddAttribute}>
                <Stack spacing={2}>
                  <TextField
                    label="Attribute Key"
                    value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    label="Attribute Value"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!attributeKey || !attributeValue || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Add Attribute'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ManageDID; 