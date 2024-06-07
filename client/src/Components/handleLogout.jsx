import React from 'react';
import axios from 'axios';

const handleLogout = async () => {
  try {
    // Send a logout request to the server
    await axios.post('/logout');
    // Clear user-related data from local storage or cookies
    localStorage.removeItem('token');
    // Redirect the user to the login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error logging out:', error);
    // Handle errors if needed
  }
};

const LogoutButton = () => {
  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;