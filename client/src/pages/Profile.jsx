import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries';
import { UPDATE_USER_INFO } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import '../css/profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();

  const { loading, error, data, refetch } = useQuery(GET_USER, {
    variables: { username: username || (user ? user.username : '') },
    skip: !username && !user,
  });

  const [editable, setEditable] = useState(false);
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  useEffect(() => {
    if (data && data.user) {
      setCity(data.user.city || '');
      setBirthday(data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(data.user.aboutMe || '');
    }
  }, [data]);

  if (!user && !username) {
    return <p className="text-red-500">You need to log in to view profiles.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo({
        variables: { city, birthday: new Date(birthday).getTime().toString(), aboutMe },
        refetchQueries: [{ query: GET_USER, variables: { username: user.username } }],
      });
      setEditable(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    setEditable(false);
    if (data && data.user) {
      setCity(data.user.city || '');
      setBirthday(data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(data.user.aboutMe || '');
    }
  };

  if (!data || !data.user) {
    return <p>Profile not found</p>;
  }

  return (
    <div className="profile-container p-4">
      <div className="profile-card bg-white shadow-md rounded p-4">
        <h1 className="text-2xl font-bold mb-4">{data.user.username}'s Profile</h1>
        <p>Email: {data.user.email}</p>

        {editable ? (
          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Birthday:</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">About Me:</label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
            <button type="button" onClick={handleCancel} className="ml-4 bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </form>
        ) : (
          <>
            <p>City: {data.user.city || 'N/A'}</p>
            <p>Birthday: {data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : 'N/A'}</p>
            <p>About Me: {data.user.aboutMe || 'N/A'}</p>
            {user && user.username === data.user.username && (
              <button onClick={() => setEditable(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Edit Profile</button>
            )}
          </>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Your Posts</h2>
        {user && user.username === data.user.username && <CreatePost />}
        {data.user.posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
