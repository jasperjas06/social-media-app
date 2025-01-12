import React, { useState } from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const cloudinaryConfig = {
  cloudName: 'dxbes4v75',
  uploadPreset: 'ppo86s9k',
};

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profilePicture: null,
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      toast.error('Failed to upload image to Cloudinary');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const toastId = toast.loading('Signing up...');
      let profileImageUrl = null;

      if (formData.profilePicture) {
        profileImageUrl = await uploadToCloudinary(formData.profilePicture);
        if (!profileImageUrl) {
          toast.dismiss(toastId);
          return;
        }
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        bio: 'New user',
        profile_picture: profileImageUrl || '',
      });

      toast.success('Signup successful!', { id: toastId });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <Container sx={{ position: 'relative', marginTop: '50px' }}>
      <Box
        sx={{
          backgroundImage: 'url(https://mdbootstrap.com/img/new/textures/full/171.jpg)',
          height: '300px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Paper
        elevation={5}
        sx={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(30px)',
        }}
      >
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Sign up now
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First name"
                variant="outlined"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last name"
                variant="outlined"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" component="label" fullWidth>
                Upload Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {profileImagePreview && (
                <Box
                  component="img"
                  src={profileImagePreview}
                  alt="Profile Preview"
                  sx={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    marginTop: 2,
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth variant="contained" size="large" type="submit">
                Sign Up
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <Typography variant="body2" gutterBottom>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ textDecoration: 'none', color: '#1266f1', cursor: 'pointer' }}
            >
              Sign In
            </span>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;
