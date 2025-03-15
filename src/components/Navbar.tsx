import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

const Navbar: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DID Verification
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          {isConnected && (
            <>
              <Button color="inherit" component={RouterLink} to="/create">
                Create DID
              </Button>
              <Button color="inherit" component={RouterLink} to="/manage">
                Manage DID
              </Button>
              <Button color="inherit" component={RouterLink} to="/verify">
                Verify DID
              </Button>
            </>
          )}
          {isConnected ? (
            <Button
              color="inherit"
              onClick={disconnectWallet}
              variant="outlined"
              sx={{ ml: 2 }}
            >
              {`${account?.slice(0, 6)}...${account?.slice(-4)}`}
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={connectWallet}
              variant="outlined"
              startIcon={<AccountBalanceWallet />}
              sx={{ ml: 2 }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 