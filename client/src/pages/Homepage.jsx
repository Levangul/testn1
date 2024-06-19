import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../utils/queries';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';

const Homepage = () => {
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <section>
      <h1>Social Media Application</h1>
      <CreatePost />
      {data.posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </section>
  );
};

export default Homepage;
