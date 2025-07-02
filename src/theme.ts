import { createTheme } from '@mui/material/styles';

export const COLORS = {
  primary: '#ff0000',
  secondary: '#000000',
  textLight: '#ffffff',
  background: '#808080',
  paper: '#0000ff',
  success: '#4caf50',
  error: '#f44336',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
    },
    background: {
      default: COLORS.background,
      paper: COLORS.paper,
    },
    success: {
      main: COLORS.success,
    },
    error: {
      main: COLORS.error,
    },
    text: {
      primary: COLORS.textLight,
    },
  },
}); 