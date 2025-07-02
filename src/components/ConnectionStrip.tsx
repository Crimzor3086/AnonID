import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { COLORS } from '../theme';

export const ConnectionStrip: React.FC = () => {
  const { isConnected, balance, account } = useWeb3();

  return (
    <Box
      sx={{
        width: '100%',
        height: '10px',
        py: 0.5,
        px: 2,
        bgcolor: isConnected ? '#000000' : 'error.main',
        color: isConnected ? '#4caf50' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ maxWidth: 'lg', mx: 'auto', width: '100%' }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'medium', lineHeight: 1 }}>
          {isConnected ? 'Connected to Educhain Network' : 'Not Connected'}
          {isConnected && balance && (
            <Box component="span" sx={{ ml: 2 }}>
              • Balance: {balance} EDU
            </Box>
          )}
        </Typography>
        {isConnected && account && (
          <Chip
            label={`${account.slice(0, 6)}...${account.slice(-4)}`}
            size="small"
            sx={{
              bgcolor: 'rgba(76, 175, 80, 0.2)',
              color: '#4caf50',
              '& .MuiChip-label': { fontWeight: 'medium', fontSize: '0.75rem', lineHeight: 1 },
              height: '16px',
              py: 0,
            }}
          />
        )}
      </Stack>
    </Box>
  );
}; 