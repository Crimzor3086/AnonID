import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 