import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  FavoriteBorder,
  ChatBubbleOutline,
  Send,
  BookmarkBorder,
  MoreHoriz,
} from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('likes'); // Default to sorting by likes

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        let token = localStorage.getItem('authToken');
        if (token === 'undefined') {
          token = sessionStorage.getItem('authToken');
        }
        if (!token) {
          setError('Please log in to view posts.');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get('http://localhost:5000/api/posts/get', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalizedPosts = response.data.posts.map((post) => ({
          ...post,
          likes: post.likes || [],
          comments: post.comments || [],
          liked: post.likes.some((like) => like.user_id === userId),
          saved: false, // Modify this if you have saved data logic
        }));

        setPosts(normalizedPosts);
      } catch (err) {
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'likes') {
      return b.likes.length - a.likes.length; // Sort by likes in descending order
    }
    if (sortBy === 'comments') {
      return b.comments.length - a.comments.length; // Sort by comments in descending order
    }
    return 0;
  });

  const handleLike = async (postId) => {
    try {
      let token = localStorage.getItem('authToken');
      if (token === 'undefined') {
        token = sessionStorage.getItem('authToken');
      }
      if (!token) return;
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const response = await axios.post(
        'http://localhost:5000/api/posts/like',
        { post_id: postId, user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: !post.liked,
                  likes: post.liked
                    ? post.likes.filter((like) => like.user_id !== userId)
                    : [...post.likes, { user_id: userId }],
                }
              : post
          )
        );
      }
    } catch {
      setError('Failed to like the post.');
    }
  };

  const handleSave = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const handleAddComment = async (postId) => {
    const comment = newComments[postId]?.trim();
    if (!comment) return;

    try {
      let token = localStorage.getItem('authToken');
      if (token === 'undefined') {
        token = sessionStorage.getItem('authToken');
      }
      if (!token) return;
      const decoded = jwtDecode(token);

      const response = await axios.post(
        'http://localhost:5000/api/posts/comment',
        { post_id: postId, comment, user_id: decoded.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    { username: 'You', text: comment },
                  ],
                }
              : post
          )
        );
        setNewComments((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch {
      setError('Failed to add comment.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        my: 2,
        border: '1px solid #dbdbdb',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'white',
      }}
    >
      {loading && <CircularProgress sx={{ mx: 'auto', my: 2 }} />}
      {error && (
        <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {/* Sorting options */}
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth>
          {/* <InputLabel>Sort by</InputLabel> */}
          <label>Sort by</label>
          <Select value={sortBy} onChange={handleSortChange}>
            <MenuItem value="likes">Most Liked</MenuItem>
            <MenuItem value="comments">Most Commented</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Display sorted posts */}
      {sortedPosts.map((post) => (
        <Box key={post.id} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Avatar src={post.author_avatar} alt={post.author || 'Unknown'} />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {post.author || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Box>
            <IconButton>
              <MoreHoriz />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: '#f0f0f0',
            }}
          >
            {post.image_url && post.image_url.endsWith('.mp4') ? (
              <video
                src={post.image_url}
                controls
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <img
                src={post.image_url}
                alt="Post content"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </Box>

          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => handleLike(post.id)}>
              <FavoriteBorder sx={{ color: post.liked ? 'red' : 'inherit' }} />
            </IconButton>
            <IconButton>
              <ChatBubbleOutline />
            </IconButton>
            <IconButton>
              <Send />
            </IconButton>
            <Box sx={{ ml: 'auto' }}>
              <IconButton onClick={() => handleSave(post.id)}>
                <BookmarkBorder sx={{ color: post.saved ? 'blue' : 'inherit' }} />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ px: 2, fontWeight: 'bold', mb: 1 }}>
            Liked by{' '}
            {post.liked && post.likes.length > 1 ? 'you and ' : ''}
            {post.likes.length > 0 ? `${post.likes.length} people` : 'No one yet'}
          </Typography>

          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body1" sx={{ display: 'inline', fontWeight: 'bold', mr: 1 }}>
              {post.author}
            </Typography>
            <Typography variant="body2" sx={{ display: 'inline' }}>
              {post.caption}
            </Typography>
          </Box>

          <Box sx={{ px: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, cursor: 'pointer' }}>
              View all {post.comments.length} comments
            </Typography>
            {post.comments.map((comment, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                <strong>{comment.username}</strong> {comment.text}
              </Typography>
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              borderTop: '1px solid #dbdbdb',
            }}
          >
            <TextField
              variant="standard"
              placeholder="Add a comment..."
              fullWidth
              value={newComments[post.id] || ''}
              onChange={(e) =>
                setNewComments((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              sx={{ flex: 1, mr: 1 }}
            />
            <Button onClick={() => handleAddComment(post.id)} sx={{ fontWeight: 'bold', color: '#0095f6' }}>
              Post
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Feed;
