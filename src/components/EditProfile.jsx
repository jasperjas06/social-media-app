import React, { useState } from 'react';
import axios from 'axios';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const ProfileEditModal = ({ open, handleClose, userId, currentProfile }) => {
  const [formData, setFormData] = useState({
    username: currentProfile.username || '',
    email: currentProfile.email || '',
    full_name: currentProfile.full_name || '',
    bio: currentProfile.bio || '',
    profile_picture: currentProfile.profile_picture || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    setUploading(true);
    const file = e.target.files[0];

    // Validate file type (optional)
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image.');
      setUploading(false);
      return;
    }

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ppo86s9k'); // Replace with your Cloudinary upload preset
    formData.append('cloud_name', 'dxbes4v75'); // Replace with your Cloudinary cloud name

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dxbes4v75/image/upload', formData);
      setFormData((prevData) => ({
        ...prevData,
        profile_picture: res.data.secure_url, // URL of the uploaded image
      }));
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setError('Failed to upload image');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Log the data being sent to the backend
    console.log('Form data being sent to backend:', formData);
  
    try {
      const res = await axios.put(`http://localhost:5000/api/users/update-profile`, {
        ...formData,
        userId,
      });
      setLoading(false);
      handleClose(); // Close the modal after successful update
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Failed to update profile');
    }
  };
  

  return (
    <Modal open={open} onClose={handleClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: 400, padding: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Edit Profile</Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData?.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData?.full_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            sx={{ mb: 2 }}
            multiline
            rows={3}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={formData.profile_picture || '/api/placeholder/150/150'}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
          </Grid>

          {uploading && (
            <CircularProgress sx={{ display: 'block', margin: '16px auto' }} />
          )}

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleClose} sx={{ color: 'grey' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ProfileEditModal;
