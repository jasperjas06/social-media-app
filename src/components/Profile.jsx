import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Settings,
  LocationOn,
  GridView as GridIcon,
} from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import ProfileEditModal from './EditProfile';

const ProfileScreen = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleEditClick = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  // Get the token and decode it to get userId
  useEffect(() => {
    let token = localStorage.getItem('authToken');
    if (token === 'undefined') {
      token = sessionStorage.getItem('authToken');
    }

    if (!token) {
      setError('No token found');
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);  // Set userId from decoded token
    } catch (err) {
      setError('Failed to decode token');
      setIsLoading(false);
    }
  }, []);

  // Fetch profile and posts data
  useEffect(() => {
    if (userId === null) return;

    const fetchProfile = async () => {
      setIsLoading(true);  // Start loading when fetching data
      try {
        const profileResponse = await axios.get(`http://localhost:5000/api/users/profile?id=${userId}`);
        setProfileData(profileResponse.data.profile);

        const postsResponse = await axios.get(`http://localhost:5000/api/posts/getbyId?id=${userId}`);
        setPosts(postsResponse.data.posts);  // Assuming posts is an array
      } catch (err) {
        setError('Failed to load profile or posts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId,openModal]);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  // Show loading spinner if data is being fetched
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Profile Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'start', mb: 8 }}>
        <Avatar
          src={profileData.profile_picture || '/api/placeholder/150/150'}
          sx={{ width: 128, height: 128, mb: { xs: 4, md: 0 }, mr: { md: 4 } }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'start', gap: 2, mb: 4 }}>
            <Typography variant="h5">{profileData.username}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* <Button
                variant="contained"
                onClick={handleFollowClick}
                sx={{
                  bgcolor: 'blue',
                  '&:hover': { bgcolor: 'blue' },
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outlined">Message</Button> */}
              <IconButton onClick={handleEditClick}>
                <Settings sx={{ width: 24, height: 24 }} />
              </IconButton>
            </Box>
          </Box>

          {/* <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            <Typography>
              <strong>{profileData.stats.posts}</strong> posts
            </Typography>
            <Typography>
              <strong>{profileData.stats.followers}</strong> followers
            </Typography>
            <Typography>
              <strong>{profileData.stats.following}</strong> following
            </Typography>
          </Box> */}

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {profileData.full_name}
            </Typography>
            
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {profileData.bio}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 4 }}
        centered
      >
        <Tab icon={<GridIcon sx={{ width: 20, height: 20 }} />} label="POSTS" />
      </Tabs>

      {/* Photo Grid */}
      <Grid container spacing={1}>
        {posts.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              No posts available.
            </Typography>
          </Grid>
        ) : (
          posts.map((post, index) => (
  <Grid item xs={4} key={post.id || index}>
    <Box sx={{ position: 'relative', cursor: 'pointer', aspectRatio: '1' }}>
      {post.image_url && post.image_url.endsWith('.mp4') ? (
        // If it's a video, render the <video> tag
        <video
          src={post.image_url}
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      ) : (
        // If it's an image, render the <img> tag
        <img
          src={post.image_url || '/api/placeholder/300/300'}
          alt={`Post ${post.id}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'black',
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
          '&:hover': { opacity: 0.1 },
        }}
      />
    </Box>
  </Grid>
))

        )}
      </Grid>
      <ProfileEditModal
        open={openModal}
        handleClose={handleCloseModal}
        userId={userId}
        currentProfile={profileData}
      />
    </Container>
  );
};

export default ProfileScreen;
