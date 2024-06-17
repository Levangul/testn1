import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_COMMENT } from '../utils/mutations';
import { GET_POSTS } from '../utils/queries';

const Post = ({ post }) => {
  const [commentText, setCommentText] = useState('');
  const [addComment] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      const { posts } = cache.readQuery({ query: GET_POSTS });
      const updatedPosts = posts.map((p) => {
        if (p.id === post.id) {
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

  return (
    <div className="Post">
      <h3>{post.author.username}</h3>
      <p>{post.text}</p>
      <div>
        <h4>Comments</h4>
        {post.comments.map((comment) => (
          <p key={comment.id}>{comment.author.username}: {comment.text}</p>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment"
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
};

export default Post;