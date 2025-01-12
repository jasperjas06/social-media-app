import React, { useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Divider,
} from '@mui/material';
import { 
  CloudUpload,
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
const CreatePost = () => {
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [file, setFile] = useState(null); // Temporary file for uploading when submitting

  const handleFileSelection = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }

      // Set file and preview
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreview(fileUrl);
      setMediaType(selectedFile.type.startsWith('video') ? 'video' : 'image');
      setError('');
    }
  }, []);

  const handlePostSubmit = async () => {
    if (!file) {
      setError('Please upload a media file');
      return;
    }
    if (!caption) {
      setError('Please add a caption');
      return;
    }

    let token = localStorage.getItem('authToken');
    if (token === "undefined") {
      token = sessionStorage.getItem('authToken');
    }

    if (!token) {
      setError('Invalid or expired token. Please log in again.');
      return;
    }

    try {
      setIsUploading(true);
      // First, upload the file to Cloudinary
      const cloudName = 'dxbes4v75';
      const uploadPreset = 'ppo86s9k';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType === 'video' ? 'video' : 'image'}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      const mediaUrl = data.secure_url; // Get the URL of the uploaded media

      // Now submit the post with the media URL
      let user_Id = localStorage.getItem("authToken")
      if (user_Id === "undefined"){
         user_Id = sessionStorage.getItem("authToken")
      } 
       const decoded = jwtDecode(user_Id)
      const postData = {
        user_id: decoded?.id, // Replace with actual user ID from auth context
        image_url: mediaUrl,
        caption: caption,
      };

      const postResponse = await axios.post('http://localhost:5000/api/posts/create', postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess('Post created successfully!');
      // Reset form after successful post
      setFile(null);
      setPreview(null);
      setCaption('');
      
      // Optional: Redirect or update UI after successful post
    } catch (error) {
      setError('Failed to create post. Please try again.');
      console.error('Failed to create post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setFile(null);
    setPreview(null);
    setMediaType('');
    // Clean up the URL object to prevent memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      await handleFileSelection(fakeEvent);
    }
  };

  return (
    <Paper 
      elevation={2}
      sx={{
        width: '100%',
        maxWidth: 800,
        margin: 'auto',
        mt: 4,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Create New Post
        </Typography>
        <Button
          variant="contained"
          onClick={handlePostSubmit}
          disabled={isUploading || !file}
          sx={{
            textTransform: 'none',
            px: 3,
            borderRadius: 1.5,
          }}
        >
          {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Share'}
        </Button>
      </Box>

      {/* Content Area */}
      <Box sx={{ 
        display: 'flex', 
        minHeight: 500,
        maxHeight: 600,
      }}>
        {/* Media Upload/Preview Section */}
        <Box sx={{ 
          flex: 1.5,
          bgcolor: '#fafafa',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          {preview ? (
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#000',
            }}>
              {mediaType === 'video' ? (
                <Box
                  component="video"
                  src={preview}
                  sx={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  controls
                />
              ) : (
                <Box
                  component="img"
                  src={preview}
                  sx={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  alt="Preview"
                />
              )}
              <IconButton
                onClick={handleRemoveMedia}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                }}
              >
                <Delete sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <Box
              component="label"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{ 
                width: '80%',
                height: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  borderColor: 'primary.main',
                }
              }}
            >
              <input
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={handleFileSelection}
              />
              <ImageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                Upload Media
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Drag and drop or click to upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max file size: 10MB
              </Typography>
            </Box>
          )}
        </Box>

        {/* Caption Section */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
        }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Caption
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write a caption for your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fafafa',
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Your post will be shared with your followers and can be seen on your profile.
          </Typography>
        </Box>
      </Box>

      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreatePost;
