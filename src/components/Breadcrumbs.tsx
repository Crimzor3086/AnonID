import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Home } from '@mui/icons-material';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    create: 'Create DID',
    manage: 'Manage DID',
    verify: 'Verify DID',
    login: 'Login'
  };

  return (
    <Box sx={{ mb: 3, mt: 2 }}>
      <MuiBreadcrumbs aria-label="breadcrumb" role="navigation">
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography color="text.primary" key={to}>
              {breadcrumbNameMap[value] || value}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              color="inherit"
              to={to}
              key={to}
            >
              {breadcrumbNameMap[value] || value}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs; 