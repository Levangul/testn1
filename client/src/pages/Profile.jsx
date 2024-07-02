import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries';
import { UPDATE_USER_INFO } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import '../css/profile.css';

const Profile = () => {
  const { user } = useAuth();

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { username: user ? user.username : '' },
    skip: !user,
  });

  const [editable, setEditable] = useState(false);
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  if (!user) {
    return <p>Loading user data...</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo({
        variables: { city, birthday, aboutMe },
        refetchQueries: [{ query: GET_USER, variables: { username: user.username } }],
      });
      setEditable(false); // Exit edit mode on save
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="profile-container">
      <div className='profile-card'>
      <h1>{data.user.username}'s Profile</h1>
      <p>Email: {data.user.email}</p>

      {editable ? (
        <form className="profile-form" onSubmit={handleUpdateProfile}>
          <div>
            <label>City:</label>
            <input
              type="text"
              value={city || data.user.city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label>Birthday:</label>
            <input
              type="date"
              value={birthday || data.user.birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>
          <div>
            <label>About Me:</label>
            <textarea
              value={aboutMe || data.user.aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditable(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p>City: {data.user.city || 'N/A'}</p>
          <p>Birthday: {data.user.birthday || 'N/A'}</p>
          <p>About Me: {data.user.aboutMe || 'N/A'}</p>
          <button onClick={() => {
            setEditable(true);
            setCity(data.user.city);
            setBirthday(data.user.birthday);
            setAboutMe(data.user.aboutMe);
          }}>Edit Profile</button>
        </>
      )}

      <h2>Your Posts</h2>
      {data.user.posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      </div>
    </div>
  );
};

export default Profile;
