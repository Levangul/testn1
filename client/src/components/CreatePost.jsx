import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../utils/mutations";
import { GET_POSTS } from "../utils/queries";

const CreatePost = () => {
  const [postText, setPostText] = useState("");
  const [addPost] = useMutation(ADD_POST, {
    update(cache, { data: { addPost } }) {
      const { posts } = cache.readQuery({ query: GET_POSTS });
      cache.writeQuery({
        query: GET_POSTS,
        data: { posts: [addPost, ...posts] },
      });
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
    <form onSubmit={handleSubmit}>
      <textarea
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        placeholder="What's on your mind?"
        required
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;