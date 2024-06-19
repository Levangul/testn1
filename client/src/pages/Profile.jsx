import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries';
import { UPDATE_USER_INFO } from '../utils/mutations'

import { useAuth } from '../context/authContext';
// import '../css/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { username: user.username },
  });

  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo({
        variables: { city, birthday, aboutMe },
        refetchQueries: [{ query: GET_USER, variables: { username: user.username } }],
      });
      // Optionally, clear form fields or show a success message
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="profile-container">
      <h1>{data.user.username}'s Profile</h1>
      <p>Email: {data.user.email}</p>
      <p>City: {data.user.city || 'N/A'}</p>
      <p>Birthday: {data.user.birthday || 'N/A'}</p>
      <p>About Me: {data.user.aboutMe || 'N/A'}</p>

      <form className="profile-form" onSubmit={handleUpdateProfile}>
        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={data.user.city || 'Enter city'}
          />
        </div>
        <div>
          <label>Birthday:</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder={data.user.birthday || 'Enter birthday'}
          />
        </div>
        <div>
          <label>About Me:</label>
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder={data.user.aboutMe || 'Enter about me'}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;