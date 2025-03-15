import React from 'react';
import { Container, Typography, Paper, Box, Alert, Link, Stack, Divider } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { AnonIDDescription } from '../components/AnonIDDescription';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWeb3();

  if (isConnected) {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <AnonIDDescription variant="light" />
        </Box>

        <Paper elevation={3} sx={{ p: 4, width: '100%', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
          <Stack spacing={3}>
            <Divider>Features</Divider>

            <Box>
              <Stack spacing={2}>
                <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2">Privacy-First Design</Typography>
                    <Typography variant="body2">
                      Control your identity data with cryptographic security
                    </Typography>
                  </Box>
                </Alert>

                <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2">Decentralized Control</Typography>
                    <Typography variant="body2">
                      Own and manage your identity without relying on central authorities
                    </Typography>
                  </Box>
                </Alert>

                <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2">Verifiable Credentials</Typography>
                    <Typography variant="body2">
                      Issue and verify identity claims securely on the blockchain
                    </Typography>
                  </Box>
                </Alert>
              </Stack>
            </Box>

            <Divider>Security</Divider>

            <Alert severity="success" sx={{ alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2">Blockchain Security</Typography>
                <Typography variant="body2">
                  Your identity is secured by the Educhain network's cryptographic protocols
                </Typography>
              </Box>
            </Alert>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 