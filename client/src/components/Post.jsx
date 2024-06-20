import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT } from '../utils/mutations';
import { GET_POSTS, GET_USER } from '../utils/queries';
import { useAuth } from '../context/authContext';
import '../css/post.css';

const Post = ({ post }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const [addComment] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      const postId = post.id;
      const existingPosts = cache.readQuery({ query: GET_POSTS }) || { posts: [] };
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
    },
    onError(error) {
      console.error("Error adding comment:", error);
    },
    optimisticResponse: {
      addComment: {
        id: Math.random().toString(36).substr(2, 9),
        text: commentText,
        author: {
          id: user.id,
          username: user.username,
          __typename: 'User',
        },
        post: {
          id: post.id,
          __typename: 'Post',
        },
        __typename: 'Comment',
      }
    },
  });

  const [removePost] = useMutation(REMOVE_POST, {
    update(cache, { data: { removePost } }) {
      if (!removePost || !removePost.id) {
        console.error("removePost mutation did not return id.");
        return;
      }

      const existingPosts = cache.readQuery({ query: GET_POSTS }) || { posts: [] };
      const updatedPosts = existingPosts.posts.filter((p) => p.id !== removePost.id);
      cache.writeQuery({
        query: GET_POSTS,
        data: { posts: updatedPosts },
      });

      const existingUser = cache.readQuery({ query: GET_USER, variables: { username: user.username } }) || { user: { posts: [] } };
      const updatedUserPosts = existingUser.user.posts.filter((p) => p.id !== removePost.id);
      cache.writeQuery({
        query: GET_USER,
        variables: { username: user.username },
        data: {
          user: {
            ...existingUser.user,
            posts: updatedUserPosts,
          },
        },
      });
    },
    onError(error) {
      console.error("Error removing post:", error);
    },
    optimisticResponse: {
      removePost: {
        id: post.id,
        __typename: 'Post'
      }
    },
  });

  const [removeComment] = useMutation(REMOVE_COMMENT, {
    update(cache, { data: { removeComment } }) {
      const postId = post.id;
      const existingPosts = cache.readQuery({ query: GET_POSTS }) || { posts: [] };
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
    },
    onError(error) {
      console.error("Error removing comment:", error);
    },
    optimisticResponse: {
      removeComment: {
        id: Math.random().toString(36).substr(2, 9),
        __typename: 'Comment'
      }
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
