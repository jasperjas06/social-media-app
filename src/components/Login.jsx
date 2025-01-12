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
    
    // Reset previous errors
    setErrors({});

    // Basic validation
    const validationErrors = {};
    if (!email.trim()) validationErrors.email = 'Email is required';
    if (!password.trim()) validationErrors.password = 'Password is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Show loading notification
    const toastId = toast.loading('Logging in...');

    try {
      // Make API call with proper error handling
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      // Debug log
      console.log('Full API Response:', response);

      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Extract token from response
      const { token } = response.data;
      console.log('Received Token:', token);  // Debugging log to ensure token is correct

      // Validate token
      if (!token) {
        throw new Error('No token received from server');
      }

      // Clear any existing token
      localStorage.removeItem('authToken');

      // Store new token
      try {
        console.log('Storing Token in localStorage:', token);  // Debugging log
        localStorage.setItem("authToken",token)
        // localStorage.setItem('authToken', token);
        sessionStorage.setItem('authToken', token);
        
        // Verify token storage
        const storedToken = localStorage.getItem('authToken');
        console.log('Stored Token:', storedToken);  // Verify if it's stored correctly

        if (!storedToken) {
          throw new Error('Failed to store token in localStorage');
        }

        // Create user object from response
        const user = {
          email,
          ...(response.data.user || {}), // Spread additional user data if available
        };

        // Update authentication state
        onLogin(user);

        // Show success message
        toast.success('Login successful!', { id: toastId });

        // Navigate to admin dashboard
        navigate('/admin');
      } catch (storageError) {
        console.error('Storage Error:', storageError);
        throw new Error('Failed to store authentication token');
      }

    } catch (error) {
      // Handle different types of errors
      console.error('Login Error:', error);

      // Clear any partial token storage
      localStorage.removeItem('authToken');

      // Determine appropriate error message
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from server';
      } else if (error.message) {
        // Custom error message
        errorMessage = error.message;
      }

      // Show error toast
      toast.error(errorMessage, { id: toastId });

      // Set field-specific errors if returned by server
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
