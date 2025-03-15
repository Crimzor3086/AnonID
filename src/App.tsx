import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { Web3Provider } from './contexts/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateDID from './pages/CreateDID';
import ManageDID from './pages/ManageDID';
import VerifyDID from './pages/VerifyDID';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF4B2B', // Vibrant red
      light: '#FF6B4B',
      dark: '#CC3B22',
    },
    secondary: {
      main: '#FFA500', // Orange
      light: '#FFB733',
      dark: '#CC8400',
    },
    warning: {
      main: '#FFD700', // Yellow
      light: '#FFE033',
      dark: '#CCAC00',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E',  // Slightly lighter black for cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#FF4B2B',
    },
    success: {
      main: '#FFD700',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h5: {
      fontWeight: 500,
      color: '#FFFFFF',
    },
    h6: {
      color: '#FFA500',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #FF4B2B 30%, #FF6B4B 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF6B4B 30%, #FF8B6B 90%)',
          },
        },
        outlined: {
          borderColor: '#FFA500',
          color: '#FFA500',
          '&:hover': {
            borderColor: '#FFD700',
            color: '#FFD700',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1E1E1E',
          backgroundImage: 'linear-gradient(rgba(255, 75, 43, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 75, 43, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(90deg, rgba(255, 75, 43, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 100%',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
          color: '#FFD700',
        },
        standardError: {
          backgroundColor: 'rgba(255, 75, 43, 0.1)',
          color: '#FF4B2B',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          color: '#FFA500',
        },
      },
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Web3Provider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<ProtectedRoute><CreateDID /></ProtectedRoute>} />
            <Route path="/manage" element={<ProtectedRoute><ManageDID /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerifyDID /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 