import React from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Security, VerifiedUser, Lock, School } from '@mui/icons-material';
import { COLORS } from '../theme';

interface AnonIDDescriptionProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const AnonIDDescription: React.FC<AnonIDDescriptionProps> = ({ 
  variant = 'dark',
  compact = false 
}) => {
  const useCases = [
    {
      icon: <School />,
      title: "Educational Credentials",
      description: "Securely store and verify academic achievements, certificates, and degrees"
    },
    {
      icon: <Security />,
      title: "Identity Verification",
      description: "Verify user identities without compromising personal data"
    },
    {
      icon: <VerifiedUser />,
      title: "Digital Reputation",
      description: "Build and maintain a trusted digital identity across platforms"
    },
    {
      icon: <Lock />,
      title: "Privacy-First",
      description: "Control your data with self-sovereign identity management"
    }
  ];

  const description = (
    <Box>
      <Typography 
        variant={compact ? "h6" : "h5"} 
        component="h1" 
        gutterBottom
        sx={{ 
          color: variant === 'dark' ? COLORS.primary : COLORS.textLight,
          fontWeight: 'bold'
        }}
      >
        AnonID
      </Typography>
      <Typography 
        variant={compact ? "body2" : "body1"} 
        sx={{ 
          color: variant === 'dark' ? COLORS.secondary : COLORS.textLight,
          opacity: variant === 'dark' ? 1 : 0.9,
          mb: compact ? 0 : 3
        }}
      >
        A decentralized identity management system built on the Educhain network. 
        Create, manage, and verify digital identities with privacy and security at its core.
      </Typography>
      
      {!compact && (
        <Grid container spacing={2}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ color: variant === 'dark' ? COLORS.primary : COLORS.textLight }}>
                    {useCase.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={useCase.title}
                    secondary={useCase.description}
                    primaryTypographyProps={{
                      sx: { 
                        color: variant === 'dark' ? COLORS.primary : COLORS.textLight,
                        fontWeight: 'medium'
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: { 
                        color: variant === 'dark' ? COLORS.secondary : COLORS.textLight,
                        opacity: 0.9
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  if (compact) {
    return description;
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 4,
        background: variant === 'dark' 
          ? 'transparent' 
          : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        color: variant === 'dark' ? 'inherit' : COLORS.textLight
      }}
    >
      {description}
    </Paper>
  );
}; 