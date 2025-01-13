import React, { useState } from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setErrors({}); // Reset errors
  
    const validationErrors = {};
    if (!email.trim()) validationErrors.email = 'Email is required';
    if (!password.trim()) validationErrors.password = 'Password is required';
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    const toastId = toast.loading('Logging in...');
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });
  
      const { token } = response.data;
  
      if (!token) throw new Error('No token received from server');
  
      // Store token in localStorage
      localStorage.setItem("authToken", token);
      sessionStorage.setItem("authToken", token);
  
      // Verify token storage
      const storedToken = localStorage.getItem("authToken");
      if (!storedToken) throw new Error('Token not stored in localStorage');
  
      const user = {
        email,
        ...(response.data.user || {}),
      };
  
      onLogin(user);
  
      toast.success('Login successful!', { id: toastId });
  
      // Ensure token is stored before navigating
      console.log("Navigating to admin with token:", storedToken);
      navigate('/admin');
    } catch (error) {
      localStorage.removeItem('authToken'); // Clear any partial data
  
      let errorMessage = 'An error occurred during login';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage, { id: toastId });
  
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };
  

  return (
    <Container maxWidth="sm" sx={{ marginTop: '50px' }}>
      <Paper sx={{ padding: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
                autoComplete="email"
                InputProps={{
                  autoComplete: 'email'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
                autoComplete="current-password"
                InputProps={{
                  autoComplete: 'current-password'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '16px'
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </form>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <Typography variant="body2" gutterBottom>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ 
                textDecoration: 'none', 
                color: '#1266f1', 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Sign Up
            </span>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
