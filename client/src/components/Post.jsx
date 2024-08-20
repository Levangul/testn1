import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GET_POSTS } from '../utils/queries';
import '../css/post.css';

const Post = ({ post, refetchQueries }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: refetchQueries || [{ query: GET_POSTS }],
    onError(error) {
      console.error('Error adding comment:', error);
    },
  });

  const [removePost] = useMutation(REMOVE_POST, {
    refetchQueries: refetchQueries || [{ query: GET_POSTS }],
    onError(error) {
      console.error('Error removing post:', error.message);
    },
  });

  const [removeComment] = useMutation(REMOVE_COMMENT, {
    refetchQueries: refetchQueries || [{ query: GET_POSTS }],
    onError(error) {
      console.error('Error removing comment:', error);
    },
  });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('You must be logged in to add a comment.');
      return;
    }
    try {
      await addComment({ variables: { postId: post.id, text: commentText } });
      setCommentText(''); 
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handlePostDelete = async () => {
    if (!user) {
      console.error('You must be logged in to delete a post.');
      return;
    }
    try {
      await removePost({ variables: { postId: post.id } });
    } catch (err) {
      console.error('Error removing post:', err.message);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!user) {
      console.error('You must be logged in to delete a comment.');
      return;
    }
    try {
      await removeComment({ variables: { commentId } });
    } catch (err) {
      console.error('Error removing comment:', err);
    }
  };

  if (!post || !post.id || !post.author || !post.comments) {
    return <p>Loading post...</p>;
  }

  return (
    <div className="post-container">
      <div className="post-header">
        <div className="post-author-details">
          <img 
            src={post.author.profilePicture || 'https://via.placeholder.com/40'} 
            alt={`${post.author.name} ${post.author.lastname}`} 
            className="profile-picture" 
          />
          <Link to={`/user/${post.author.name}/${post.author.lastname}`} className="post-author-name">
            {post.author.name} {post.author.lastname}
          </Link>
        </div>
        <div className="post-date">{/* Display the date here if needed */}</div>
        {user && user.id === post.author.id && (
          <button className="delete-button" onClick={handlePostDelete}>🗑️</button>
        )}
      </div>
      <p className="post-text">{post.text}</p>
      <div className="comments-section">
        <h4>Comments</h4>
        {post.comments
          .slice()
          .reverse()
          .map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-author-details">
                <img 
                  src={comment.author.profilePicture || 'https://via.placeholder.com/40'} 
                  alt={`${comment.author.name} ${comment.author.lastname}`} 
                  className="profile-picture" 
                />
                <div className="comment-content">
                  <Link to={`/user/${comment.author.name}/${comment.author.lastname}`} className="comment-username">
                    {comment.author.name} {comment.author.lastname}
                  </Link>
                  <span className="comment-text">{comment.text}</span>
                </div>
              </div>
              {user && user.id === comment.author.id && (
                <button className="delete-button" onClick={() => handleCommentDelete(comment.id)}>🗑️</button>
              )}
            </div>
          ))}
      </div>
      {user && (
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            className="comment-input"
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            required
          />
          <button className="comment-button" type="submit">Comment</button>
        </form>
      )}
    </div>
  );
};

export default Post;
