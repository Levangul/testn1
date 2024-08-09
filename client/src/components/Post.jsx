import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GET_POSTS } from '../utils/queries';
import '../css/post.css';

const Post = ({ post }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const [addComment] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      const postId = post.id;
      const existingPosts = cache.readQuery({ query: GET_POSTS });

      if (existingPosts && existingPosts.posts) {
        const updatedPosts = existingPosts.posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, addComment],
            };
          }
          return p;
        });
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: updatedPosts },
        });
      }
    },
    onError(error) {
      console.error('Error adding comment:', error);
    },
    optimisticResponse: {
      addComment: {
        id: Math.random().toString(36).substr(2, 9),
        text: commentText,
        date: new Date().toISOString(),
        author: {
          id: user ? user.id : null,
          name: user ? user.name : 'Anonymous',
          lastname: user ? user.lastname : '',
          profilePicture: user ? user.profilePicture : 'https://via.placeholder.com/40', // Add default profile picture URL
          __typename: 'User',
        },
        post: {
          id: post.id,
          __typename: 'Post',
        },
        __typename: 'Comment',
      },
    },
  });

  const [removePost] = useMutation(REMOVE_POST, {
    update(cache, { data: { removePost } }) {
      if (!removePost || !removePost.id) {
        console.error('removePost mutation did not return id.');
        return;
      }

      const existingPosts = cache.readQuery({ query: GET_POSTS });

      if (existingPosts && existingPosts.posts) {
        const updatedPosts = existingPosts.posts.filter((p) => p.id !== removePost.id);
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: updatedPosts },
        });
      }
    },
    onError(error) {
      console.error('Error removing post:', error);
    },
    optimisticResponse: {
      removePost: {
        id: post.id,
        __typename: 'Post',
      },
    },
  });

  const [removeComment] = useMutation(REMOVE_COMMENT, {
    update(cache, { data: { removeComment } }) {
      if (!post || !post.id) return;

      const postId = post.id;
      const existingPosts = cache.readQuery({ query: GET_POSTS });

      if (existingPosts && existingPosts.posts) {
        const updatedPosts = existingPosts.posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.filter((comment) => comment.id !== removeComment.id),
            };
          }
          return p;
        });
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: updatedPosts },
        });
      }
    },
    onError(error) {
      console.error('Error removing comment:', error);
    },
    optimisticResponse: {
      removeComment: {
        id: Math.random().toString(36).substr(2, 9),
        __typename: 'Comment',
      },
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
      console.error('Error removing post:', err);
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
      <div className="post-content">
        <div className="post-author">
          <div className="post-author-details">
            <img 
              src={post.author.profilePicture || 'https://via.placeholder.com/40'} 
              alt={`${post.author.name} ${post.author.lastname}`} 
              className="profile-picture" 
            />
            <Link to={`/user/${post.author.name}/${post.author.lastname}`}>
              {post.author.name} {post.author.lastname}
            </Link>
          </div>
          {user && user.id === post.author.id && (
            <button className="delete-button" onClick={handlePostDelete}>🗑️</button>
          )}
        </div>
        <p className="post-text">{post.text}</p>
        <div className="comments-section">
          <h4>Comments</h4>
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-author-details">
                <img 
                  src={comment.author.profilePicture || 'https://via.placeholder.com/40'} 
                  alt={`${comment.author.name} ${comment.author.lastname}`} 
                  className="profile-picture" 
                />
                <span className="comment-username">
                  <Link to={`/user/${comment.author.name}/${comment.author.lastname}`}>
                    {comment.author.name} {comment.author.lastname}
                  </Link>
                </span>
              </div>
              <span className="comment-text">{comment.text}</span>
              {user && user.id === comment.author.id && (
                <button className="delete-button" onClick={() => handleCommentDelete(comment.id)}>🗑️</button>
              )}
            </div>
          ))}
        </div>
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
