import React from 'react';
import { Box, Typography } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { COLORS } from '../theme';

const Logo: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: 1,
        borderRadius: 1,
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        border: '1px solid #ff0000',
      }}
    >
      <FingerprintIcon sx={{ fontSize: 32, color: '#ff0000' }} />
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
          color: '#ff0000',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        AnonID
      </Typography>
    </Box>
  );
};

export default Logo; 