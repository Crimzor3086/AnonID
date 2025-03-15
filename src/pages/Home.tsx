import React from 'react';
import { Container, Typography, Grid, Paper, Button, Box, Alert, Chip, Stack, Tooltip, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { SwapHoriz } from '@mui/icons-material';
import { SAMPLE_DIDS } from '../utils/didFormat';
import { AnonIDDescription } from '../components/AnonIDDescription';
import { ConnectionStrip } from '../components/ConnectionStrip';

// Custom theme colors
const COLORS = {
  primary: '#1a237e', // Navy blue
  secondary: '#6a1b9a', // Purple
  primaryLight: '#534bae',
  secondaryLight: '#9c27b0',
  textLight: '#ffffff',
  textDark: '#1a237e',
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    account, 
    networkName, 
    isConnected, 
    error,
    balance
  } = useWeb3();

  // Add balance check debugging
  const balanceNum = balance ? parseFloat(balance) : 0;
  const hasSufficientBalance = balanceNum >= 0.001;
  console.log('Balance string:', balance);
  console.log('Balance number:', balanceNum);
  console.log('Has sufficient balance:', hasSufficientBalance);

  const features = [
    {
      title: 'Create DID',
      description: 'Create your decentralized identity to start managing your digital presence.',
      action: () => navigate('/create'),
      buttonText: 'Create New DID'
    },
    {
      title: 'Manage DID',
      description: 'Update and manage your existing decentralized identities.',
      action: () => navigate('/manage'),
      buttonText: 'Manage DIDs'
    },
    {
      title: 'Verify DID',
      description: 'Verify other users\' decentralized identities.',
      action: () => navigate('/verify'),
      buttonText: 'Verify DID'
    }
  ];

  return (
    <>
      <ConnectionStrip />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Welcome Section */}
          <AnonIDDescription variant="dark" />
          
          {/* Features Grid */}
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out',
                      borderColor: index % 2 === 0 ? COLORS.primary : COLORS.secondary
                    },
                    border: 2,
                    borderColor: 'transparent'
                  }}
                  elevation={3}
                >
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        color: index % 2 === 0 ? COLORS.primary : COLORS.secondary,
                        fontWeight: 'bold'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                      {feature.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color={index % 2 === 0 ? "primary" : "secondary"}
                    size="large"
                    fullWidth
                    onClick={feature.action}
                    disabled={!hasSufficientBalance}
                    sx={{ 
                      mt: 2,
                      bgcolor: index % 2 === 0 ? COLORS.primary : COLORS.secondary,
                      '&:hover': {
                        bgcolor: index % 2 === 0 ? COLORS.primaryLight : COLORS.secondaryLight
                      }
                    }}
                  >
                    {!hasSufficientBalance ? 'Insufficient EDU' : feature.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Info Section */}
          {error && (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          )}
          {!hasSufficientBalance && (
            <Alert severity="warning" sx={{ mt: 4 }}>
              Your wallet has insufficient EDU. Please ensure you have at least 0.001 EDU to perform operations.
            </Alert>
          )}

          {/* Sample DIDs Section */}
          <Paper 
            sx={{ 
              p: 3, 
              mt: 6,
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
                    Address: {SAMPLE_DIDS.student.address}
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
                    Address: {SAMPLE_DIDS.institution.address}
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

export default Home; 