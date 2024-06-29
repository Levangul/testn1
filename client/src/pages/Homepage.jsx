import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../utils/queries';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { loading, error, data } = useQuery(GET_POSTS);
  const { user } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <section>
      <h1>Social Media Application</h1>
      {user && <CreatePost />}
      {data.posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </section>
  );
};

export default Homepage;
