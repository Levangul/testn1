import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT } from '../utils/mutations';
import { GET_POSTS, GET_USER } from '../utils/queries';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const [addComment] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      if (!post || !post.id) return;

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
          id: user ? user.id : null,
          username: user ? user.username : "Anonymous",
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

      const existingUser = cache.readQuery({ query: GET_USER, variables: { username: user ? user.username : "" } }) || { user: { posts: [] } };
      const updatedUserPosts = existingUser.user.posts.filter((p) => p.id !== removePost.id);
      cache.writeQuery({
        query: GET_USER,
        variables: { username: user ? user.username : "" },
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
      if (!post || !post.id) return;

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
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="post-content">
        <h3 className="post-author text-lg font-semibold mb-2 text-gray-900">
          <Link to={`/user/${post.author.username}`} className="text-blue-500 hover:underline">{post.author.username}</Link>
          {user && user.id === post.author.id && (
            <button className="delete-button text-red-500 hover:text-red-700 ml-2" onClick={handlePostDelete}>🗑️</button>
          )}
        </h3>
        <p className="post-text mb-4 text-gray-900">{post.text}</p>
        <div className="comments-section">
          <h4 className="text-md font-semibold mb-2 text-gray-900">Comments</h4>
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment mb-2">
              <span className="comment-username font-semibold text-gray-900">
                <Link to={`/user/${comment.author.username}`} className="text-blue-500 hover:underline">{comment.author.username}</Link>
              </span>: <span className="comment-text text-gray-900">{comment.text}</span>
              {user && user.id === comment.author.id && (
                <button className="delete-button text-red-500 hover:text-red-700 ml-2" onClick={() => handleCommentDelete(comment.id)}>🗑️</button>
              )}
            </div>
          ))}
        </div>
      </div>
      {user && (
        <form className="comment-form mt-4" onSubmit={handleCommentSubmit}>
          <input
            className="comment-input w-full p-2 border border-gray-300 rounded-md text-gray-900"
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            required
          />
          <button className="comment-button mt-2 bg-blue-500 text-white px-4 py-2 rounded" type="submit">Comment</button>
        </form>
      )}
    </div>
  );
};

export default Post;


