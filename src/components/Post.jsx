import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';

const Post = ({ post, onLikeToggle, onAddComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleLikeClick = () => {
    onLikeToggle(post.id);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <Box mb={2} p={2} border={1} borderRadius={2}>
      <Typography variant="h6">{post.username}</Typography>
      <Typography variant="body1">{post.content}</Typography>
      <Button onClick={handleLikeClick}>
        {post.likes} Likes
      </Button>
      <form onSubmit={handleAddComment}>
        <TextField
          fullWidth
          label="Add a comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <Button type="submit">Comment</Button>
      </form>
      {post.comments.map((comment, idx) => (
        <Typography key={idx} variant="body2">
          <strong>{comment.username}:</strong> {comment.text}
        </Typography>
      ))}
    </Box>
  );
};

export default Post;
