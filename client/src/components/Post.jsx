import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_COMMENT, REMOVE_POST, REMOVE_COMMENT, ADD_REPLY } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GET_POSTS} from '../utils/queries';
import '../css/post.css';

const Post = ({ post, refetchQueries }) => {
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Track which comment is being replied to
  const [visibleComments, setVisibleComments] = useState(5); // Number of visible comments
  const [visibleReplies, setVisibleReplies] = useState({}); // Number of visible replies per comment

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

  const [addReply] = useMutation(ADD_REPLY, {
    refetchQueries: refetchQueries || [{ query: GET_POSTS }],
    onError(error) {
      console.error('Error adding reply:', error.message);
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
  
      if (error.networkError) {
        console.log(`[Network error]: ${error.networkError}`);
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

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    try {
        await addReply({
            variables: { commentId: commentId.toString(), text: replyText },
        });
        setReplyText('');
        setReplyingTo(null);
    } catch (err) {
        console.error('Error adding reply:', err);
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

  const showMoreComments = () => {
    setVisibleComments(prev => prev + 5);
  };

  const showLessComments = () => {
    setVisibleComments(prev => Math.max(prev - 5, 5));
  };

  const showMoreReplies = (commentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 5) + 5
    }));
  };

  const showLessReplies = (commentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: Math.max((prev[commentId] || 5) - 5, 5)
    }));
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
        {post.comments.slice(0, visibleComments).reverse().map((comment) => (
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
            <button 
              className="reply-button" 
              onClick={() => setReplyingTo(comment.id)}
            >
              Reply
            </button>
            
            {replyingTo === comment.id && (
              <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                <input
                  className="reply-input"
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add a reply"
                  required
                />
                <button className="reply-button" type="submit">Reply</button>
              </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="replies-section">
                {comment.replies.slice(0, visibleReplies[comment.id] || 5).map(reply => (
                  <div key={reply.id} className="reply">
                    <div className="reply-author-details">
                      <img 
                        src={reply.author.profilePicture || 'https://via.placeholder.com/40'} 
                        alt={`${reply.author.name} ${reply.author.lastname}`} 
                        className="profile-picture" 
                      />
                      <div className="reply-content">
                        <Link to={`/user/${reply.author.name}/${reply.author.lastname}`} className="reply-username">
                          {reply.author.name} {reply.author.lastname}
                        </Link>
                        <span className="reply-text">{reply.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {comment.replies.length > (visibleReplies[comment.id] || 5) && (
                  <button className="show-more-button" onClick={() => showMoreReplies(comment.id)}>
                    Show more replies
                  </button>
                )}
                {(visibleReplies[comment.id] || 5) > 5 && (
                  <button className="show-less-button" onClick={() => showLessReplies(comment.id)}>
                    Show fewer replies
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {post.comments.length > visibleComments && (
          <button className="show-more-button" onClick={showMoreComments}>
            Show more comments
          </button>
        )}
        {visibleComments > 5 && (
          <button className="show-less-button" onClick={showLessComments}>
            Show fewer comments
          </button>
        )}
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
