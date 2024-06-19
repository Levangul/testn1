import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../utils/mutations";
import { GET_POSTS, GET_USER } from "../utils/queries";
import { useAuth } from "../context/authContext";

const CreatePost = () => {
  const [postText, setPostText] = useState("");
  const { user } = useAuth();

  const [addPost] = useMutation(ADD_POST, {
    update(cache, { data: { addPost } }) {
      // Update GET_POSTS cache
      const existingPosts = cache.readQuery({ query: GET_POSTS });
      if (existingPosts) {
        cache.writeQuery({
          query: GET_POSTS,
          data: {
            posts: [addPost, ...existingPosts.posts],
          },
        });
      }

      // Update GET_USER cache
      const existingUser = cache.readQuery({ query: GET_USER, variables: { username: user.username } });
      if (existingUser) {
        cache.writeQuery({
          query: GET_USER,
          variables: { username: user.username },
          data: {
            user: {
              ...existingUser.user,
              posts: [addPost, ...existingUser.user.posts],
            },
          },
        });
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPost({ variables: { text: postText } });
      setPostText("");
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <textarea
        className="create-post-textarea"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        placeholder="What's on your mind?"
        required
      />
      <button className="create-post-button" type="submit">Post</button>
    </form>
  );
};

export default CreatePost;
