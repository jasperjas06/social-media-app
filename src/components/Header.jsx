import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Insta Clone
        </Typography>
        {user ? (
          <>
            <Typography variant="body1" style={{ marginRight: '20px' }}>
              Welcome, {user.username}
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/signup" style={{ marginRight: '10px', textDecoration: 'none' }}>
              <Button color="inherit">Signup</Button>
            </Link>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button color="inherit">Login</Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
