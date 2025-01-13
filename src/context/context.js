import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const UserContext = createContext();

// Custom hook to access the context
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionally, decode the token here if needed to set user information
      setUser({ token }); // Set the user with the token
    }
  }, []);

  const login = (userData) => {
    const { token } = userData; // Assuming `userData` contains the token
    setUser(userData); // Update the user state
    // localStorage.setItem('authToken', token); // Store token as a plain string
  };

  const logout = () => {
    setUser(null); // Clear the user state
    localStorage.removeItem('authToken'); // Remove token from localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
