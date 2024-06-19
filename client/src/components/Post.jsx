import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER } from '../utils/queries';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT } from '../utils/mutations';
import { useAuth } from '../context/authContext';
import '../css/post.css';

const Post = ({ post }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth(); // Get the logged-in user's information

  const { data: userData } = useQuery(GET_USER, {
    variables: { username: user.username },
  });

  const [addComment] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      const existingData = cache.readQuery({ query: GET_USER, variables: { username: user.username } });
      const updatedPosts = existingData.user.posts.map((p) => {
        if (p.id === post.id) {
          return {
            ...p,
            comments: [...p.comments, addComment],
          };
        }
        return p;
      });
      cache.writeQuery({
        query: GET_USER,
        variables: { username: user.username },
        data: { user: { ...existingData.user, posts: updatedPosts } },
      });
    },
  });

  const [removePost] = useMutation(REMOVE_POST, {
    update(cache, { data: { removePost } }) {
      const existingData = cache.readQuery({ query: GET_USER, variables: { username: user.username } });
      const updatedPosts = existingData.user.posts.filter(p => p.id !== removePost.id);
      cache.writeQuery({
        query: GET_USER,
        variables: { username: user.username },
        data: { user: { ...existingData.user, posts: updatedPosts } },
      });
    },
  });

  const [removeComment] = useMutation(REMOVE_COMMENT, {
    update(cache, { data: { removeComment } }) {
      const existingData = cache.readQuery({ query: GET_USER, variables: { username: user.username } });
      const updatedPosts = existingData.user.posts.map((p) => {
        if (p.id === post.id) {
          return {
            ...p,
            comments: p.comments.filter(comment => comment.id !== removeComment.id),
          };
        }
        return p;
      });
      cache.writeQuery({
        query: GET_USER,
        variables: { username: user.username },
        data: { user: { ...existingData.user, posts: updatedPosts } },
      });
    },
  });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment({ variables: { postId: post.id, text: commentText } });
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handlePostDelete = async () => {
    try {
      await removePost({ variables: { postId: post.id } });
    } catch (err) {
      console.error('Error removing post:', err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await removeComment({ variables: { commentId } });
    } catch (err) {
      console.error('Error removing comment:', err);
    }
  };

  return (
    <div className="post-container">
      <div className="post-content">
        <h3 className="post-author">
          {post.author.username}
          {user && user.id === post.author.id && (
            <button className="delete-button" onClick={handlePostDelete}>🗑️</button>
          )}
        </h3>
        <p className="post-text">{post.text}</p>
        <div className="comments-section">
          <h4>Comments</h4>
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <span className="comment-username">{comment.author.username}</span>: <span className="comment-text">{comment.text}</span>
              {user && user.id === comment.author.id && (
                <button className="delete-button" onClick={() => handleCommentDelete(comment.id)}>🗑️</button>
              )}
            </div>
          ))}
        </div>
      </div>
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
    </div>
  );
};

export default Post;
