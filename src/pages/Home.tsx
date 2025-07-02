import React from 'react';
import { 
  Container, Typography, Grid, Paper, Button, Box, Alert, Chip, Tooltip, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { SAMPLE_DIDS } from '../utils/didFormat';
import { ConnectionStrip } from '../components/ConnectionStrip';
import Logo from '../components/Logo';
import { COLORS } from '../theme';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { error, balance } = useWeb3();

  // Balance checks
  const balanceNum = balance ? parseFloat(balance) : 0;
  const hasSufficientBalance = balanceNum >= 0.001;
  
  console.log('Balance:', balanceNum, 'Has sufficient balance:', hasSufficientBalance);

  const features = [
    { title: 'Create DID', description: 'Generate your decentralized identity to control your digital presence.', action: () => navigate('/create'), buttonText: 'Create New DID' },
    { title: 'Manage DID', description: 'Modify and update your decentralized identities.', action: () => navigate('/manage'), buttonText: 'Manage DIDs' },
    { title: 'Verify DID', description: 'Authenticate and verify decentralized identities on the blockchain.', action: () => navigate('/verify'), buttonText: 'Verify DID' }
  ];

  return (
    <>
      <ConnectionStrip />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Logo />
            <Typography variant="h4" component="h1" sx={{ color: COLORS.primary, fontWeight: 700 }}>
              Welcome to AnonID
            </Typography>
          </Box>

          {/* Feature Cards */}
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  sx={{ 
                    p: 3, height: '100%', display: 'flex', flexDirection: 'column',
                    border: `1px solid ${COLORS.primary}`,
                    '&:hover': { boxShadow: `0 4px 20px rgba(255, 0, 0, 0.1)` }
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={feature.action}
                    disabled={!hasSufficientBalance}
                    sx={{ 
                      mt: 2,
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                      '&:hover': { opacity: 0.8 }
                    }}
                  >
                    {!hasSufficientBalance ? 'Insufficient EDU' : feature.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Alerts Section */}
          {error && (
            <Alert severity="error" sx={{ mt: 4, border: `1px solid ${COLORS.primary}` }}>
              {error}
            </Alert>
          )}
          {!hasSufficientBalance && (
            <Alert severity="warning" sx={{ mt: 4, border: `1px solid ${COLORS.primary}` }}>
              Your wallet has insufficient EDU. Ensure you have at least 0.001 EDU to proceed.
            </Alert>
          )}

          {/* Sample DIDs Section */}
          <Paper 
            sx={{ 
              p: 3, mt: 6,
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              color: COLORS.textLight
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.textLight }}>
              Sample DIDs
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
              Explore sample Decentralized Identifiers (DIDs) to understand the format:
            </Typography>
            
            <Grid container spacing={3}>
              {Object.entries(SAMPLE_DIDS).map(([key, sample]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ color: COLORS.textLight }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} DID
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      Address: {sample.address}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      DID: {sample.did}
                    </Typography>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Created: {sample.document.created}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* DID Format Explanation */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: COLORS.textLight }}>
                DID Format Explanation
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                The DID format follows the pattern: <strong>did:edu:testnet:&lt;unique-identifier&gt;</strong>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }} component="div">
                <ul>
                  <li><strong>did:edu</strong> - The DID method identifier for Educhain</li>
                  <li><strong>testnet</strong> - The network identifier (testnet/mainnet)</li>
                  <li><strong>unique-identifier</strong> - First 8 characters of the Ethereum address</li>
                </ul>
              </Typography>
            </Box>

            {/* Minimum Token Requirement */}
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
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
