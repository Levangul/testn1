import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_USER } from '../utils/queries';
import { UPDATE_USER_INFO } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import ChatComponent from '../components/ChatComponent';
import '../css/profile.css';

const Profile = () => {
  const { name, lastname } = useParams();
  const { user } = useAuth();
  const { setReceiverId } = useChat();
  
  useEffect(() => {
    console.log("Params:", name, lastname);
    console.log("Auth User:", user);
  }, [name, lastname, user]);

  const shouldSkipQuery = (!name && !lastname) && !user;

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { 
      name: name || user?.name, 
      lastname: lastname || user?.lastname 
    },
    skip: shouldSkipQuery,
  });

  const [editable, setEditable] = useState(false);
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  useEffect(() => {
    if (data && data.user) {
      setCity(data.user.city || '');
      setBirthday(data.user.birthday ? new Date(parseInt(data.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(data.user.aboutMe || '');
      setProfileImageUrl(data.user.profilePicture || '');
    }
  }, [data]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateFields = {
        city: city || null,
        birthday: birthday ? new Date(birthday).getTime().toString() : null,
        aboutMe: aboutMe || null,
        profilePicture: profileImageUrl,
      };

      await updateUserInfo({
        variables: updateFields,
        refetchQueries: [{ query: GET_USER, variables: { name: user.name, lastname: user.lastname } }],
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
    formData.append('email', user.email);

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
      setProfileImageUrl(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSendMessage = () => {
    if (data && data.user && data.user.id !== user.id) { // Use 'id' instead of '_id'
      setReceiverId(data.user.id); // Use 'id' instead of '_id'
      setShowChat(true);
    } else {
      console.error('Cannot send message to self or invalid user data');
    }
  };

  if (!user && !name && !lastname) {
    return <p className="text-red-500">You need to log in to view profiles.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
          <h1 className="text-2xl font-bold mb-4">{data.user.name} {data.user.lastname}</h1>
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
            {user && user.name === data.user.name && user.lastname === data.user.lastname && (
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
        {user && (user.name !== data.user.name || user.lastname !== data.user.lastname) && (
          <div className="send-message-section mt-4">
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
              Send Message
            </button>
          </div>
        )}

        <div className="profile-section mb-4">
          <h2 className="text-xl font-bold mt-8 mb-4">Your Posts</h2>
          {user && user.name === data.user.name && user.lastname === data.user.lastname && <CreatePost />}
          {data.user.posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>

      {showChat && <ChatComponent />}
    </div>
  );
};

export default Profile;

