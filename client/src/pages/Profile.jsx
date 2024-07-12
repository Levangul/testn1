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
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  useEffect(() => {
    if (data && data.user) {
      setCity(data.user.city || '');
      setBirthday(data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(data.user.aboutMe || '');
      setProfileImageUrl(data.user.profilePicture || ''); // Assuming profilePicture is a field in the user data
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
      const updateFields = {
        city: city !== '' ? city : null,
        birthday: birthday !== '' ? new Date(birthday).getTime().toString() : null,
        aboutMe: aboutMe !== '' ? aboutMe : null,
        profilePicture: profileImageUrl, // Update with the new profile image URL
      };

      console.log('Updating profile with:', updateFields);

      const response = await updateUserInfo({
        variables: updateFields,
        refetchQueries: [{ query: GET_USER, variables: { username: user.username } }],
      });

      console.log('Update response:', response);
      setEditable(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.graphQLErrors) {
        console.error('GraphQL errors:', err.graphQLErrors);
      }
      if (err.networkError) {
        console.error('Network error:', err.networkError);
      }
    }
  };

  const handleCancel = () => {
    setEditable(false);
    if (data && data.user) {
      setCity(data.user.city || '');
      setBirthday(data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(data.user.aboutMe || '');
      setProfileImageUrl(data.user.profilePicture || '');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const formData = new FormData();
    formData.append('file', profileImage);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Failed to upload image', await response.text());
        return;
      }

      const data = await response.json();
      setProfileImageUrl(data.url); // Update with the uploaded image URL
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (!data || !data.user) {
    return <p>Profile not found</p>;
  }

  return (
    <div className="profile-container p-4">
      <div className="profile-card bg-white shadow-md rounded p-4">
        <div className="profile-section mb-4 text-center">
          <img
            src={profileImageUrl || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-image rounded-full mb-4"
            style={{ width: '150px', height: '150px' }}
          />
          {editable && (
            <>
              <input type="file" onChange={handleImageChange} className="mb-4" />
              <button onClick={handleImageUpload} className="bg-blue-500 text-white px-4 py-2 rounded">Upload Image</button>
            </>
          )}
        </div>
        <div className="profile-section mb-4">
          <h1 className="text-2xl font-bold mb-4">{data.user.username}'s Profile</h1>
          <div className="profile-info">
            <div className="info-item">
              <span className="label">City:</span>
              {editable ? (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="value-edit"
                />
              ) : (
                <span className="value">{data.user.city || 'N/A'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">Birthday:</span>
              {editable ? (
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="value-edit"
                />
              ) : (
                <span className="value">{data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : 'N/A'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">About Me:</span>
              {editable ? (
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="value-edit"
                />
              ) : (
                <span className="value">{data.user.aboutMe || 'N/A'}</span>
              )}
            </div>
            {user && user.username === data.user.username && (
              <div className="edit-buttons mt-4">
                {editable ? (
                  <>
                    <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
                    <button onClick={handleCancel} className="ml-4 bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setEditable(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Edit Profile</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-section mb-4">
          <h2 className="text-xl font-bold mt-8 mb-4">Your Posts</h2>
          {user && user.username === data.user.username && <CreatePost />}
          {data.user.posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;