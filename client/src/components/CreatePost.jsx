import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../utils/mutations";
import { GET_USER } from "../utils/queries";


const CreatePost = () => {
  const [postText, setPostText] = useState("");
  const [addPost] = useMutation(ADD_POST, {
    update(cache, { data: { addPost } }) {
      const { posts } = cache.readQuery({ query: GET_USER });
      cache.writeQuery({
        query: GET_USER,
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