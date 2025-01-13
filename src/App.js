import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Use BrowserRouter instead of Router
import { UserProvider } from './context/context';
import { AppRoutes } from './AppRouter';
import { Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const App = () => {
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Current time in seconds
          if (decoded.exp < currentTime) {
            localStorage.removeItem('authToken'); // Remove token
            console.warn('Token expired. Logging out...');
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          localStorage.removeItem('authToken'); // Remove invalid token
        }
      }
    };

    // Check token expiration on app load
    checkTokenExpiration();

    // Periodically check token expiration every 5 minutes
    const intervalId = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster position="top-right" reverseOrder={false} />
    </UserProvider>
  );
};

export default App;
