import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { GET_USER, GET_POSTS } from '../utils/queries';
import { UPDATE_USER_INFO, SEND_FRIEND_REQUEST, REMOVE_FRIEND, ACCEPT_FRIEND_REQUEST, REJECT_FRIEND_REQUEST } from '../utils/mutations';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import Spinner from '../components/Spinner';
import '../css/profile.css';

const Profile = () => {
  const { name, lastname } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openChatWithUser } = useChat();

  const { loading: userLoading, error: userError, data: userData, refetch: refetchUser } = useQuery(GET_USER, {
    variables: { name: name || user?.name, lastname: lastname || user?.lastname },
    skip: (!name && !lastname) && !user,
  });

  const { loading: postsLoading, error: postsError, data: postsData, refetch: refetchPosts } = useQuery(GET_POSTS);

  const [editable, setEditable] = useState(false);
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [requestPending, setRequestPending] = useState(false);

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO, { onCompleted: () => refetchUser() });
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, { onCompleted: () => { refetchUser(); setRequestPending(true); } });
  const [removeFriend] = useMutation(REMOVE_FRIEND, { onCompleted: () => { refetchUser(); setIsFriend(false); } });
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST, { onCompleted: refetchUser });
  const [rejectFriendRequest] = useMutation(REJECT_FRIEND_REQUEST, { onCompleted: refetchUser });

  useEffect(() => {
    if (userData && userData.user) {
      setCity(userData.user.city || '');
      setBirthday(userData.user.birthday ? new Date(parseInt(userData.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(userData.user.aboutMe || '');
      setProfileImageUrl(userData.user.profilePicture || '');
      setIsFriend(user && userData.user.friends.some(friend => friend.id === user.id));
      setRequestPending(user && userData.user.friendRequests.some(request => request.id === user.id));
    }
  }, [userData, user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateFields = {
        city: city || null,
        birthday: birthday ? new Date(birthday): null,
        aboutMe: aboutMe || null,
        profilePicture: profileImageUrl,
      };
      await updateUserInfo({ variables: updateFields });
      setEditable(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    setEditable(false);
    if (userData && userData.user) {
      setCity(userData.user.city || '');
      setBirthday(userData.user.birthday ? new Date(parseInt(userData.user.birthday)).toISOString().split('T')[0] : '');
      setAboutMe(userData.user.aboutMe || '');
      setProfileImageUrl(userData.user.profilePicture || '');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      setProfileImageUrl(reader.result);
      await handleImageUpload(); // Automatically upload the image after selection
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const formData = new FormData();
    formData.append('file', profileImage);
    formData.append('email', user.email);

    try {
      const response = await fetch('http://localhost:3001/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        console.error('Failed to upload image', await response.text());
        return;
      }
      const data = await response.json();
      setProfileImageUrl(data.url); // Update the profile image URL with the returned URL from the server
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSendMessage = () => {
    if (userData && userData.user && userData.user.id !== user.id) {
      openChatWithUser(userData.user.id, true); // Pass true to indicate it's from profile
    } else {
      console.error('Cannot send message to self or invalid user data');
    }
  };

  const handleAddFriend = async () => {
    if (userData && userData.user && userData.user.id !== user.id) {
        try {
            console.log("Sending Friend Request with ID:", userData.user.id.toString());
            await sendFriendRequest({ variables: { friendId: userData.user.id.toString() } });
            console.log('Friend request sent successfully');
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    } else {
        console.error('Cannot send friend request to self or invalid user data');
    }
  };

  const handleRemoveFriend = async () => {
    if (userData && userData.user && userData.user.id !== user.id) {
      try {
        await removeFriend({ variables: { friendId: userData.user.id } });
        console.log('Friend removed successfully');
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    } else {
      console.error('Cannot remove self as friend or invalid user data');
    }
  };

  const handleAcceptRequest = async (friendId) => {
    console.log("Accepting Friend Request for ID:", friendId);
    try {
        await acceptFriendRequest({ variables: { friendId: friendId.toString() } });
    } catch (error) {
        console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (friendId) => {
    console.log("Rejecting Friend Request for ID:", friendId);
    try {
        await rejectFriendRequest({ variables: { friendId: friendId.toString() } });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
    }
  };

  const handleViewFriends = () => {
    navigate('/friends');
  };

  if (!user && !name && !lastname) {
    return (
      <div className="login-signup-container">
      <p>Please log in or sign up if you don't have an account</p>
      <div className="button-group">
        <Link to="/login" className="btn login-btn">Login</Link>
        <Link to="/sign-up" className="btn signup-btn">Sign Up</Link>
      </div>
    </div>
    )
    ;
    
  }

  if (userLoading || postsLoading) return <Spinner />;
  if (userError || postsError) return <p>Error: {userError?.message || postsError?.message}</p>;

  if (!userData || !userData.user) {
    return <p>Profile not found</p>;
  }

  const isOwnProfile = user && user.id === userData.user.id;

  return (
    <div className="profile-container p-4 flex">
      <div className="profile-card bg-white shadow-md rounded p-4 w-3/4">
        <div className="profile-section mb-4 text-center">
          <img src={profileImageUrl || 'https://via.placeholder.com/150'} alt="Profile" className="profile-image rounded-full mb-4" style={{ width: '150px', height: '150px' }} />
          {editable && (
            <>
              <input type="file" onChange={handleImageChange} className="mb-4" />
              {/* Upload button is no longer needed */}
            </>
          )}
        </div>
        <div className="profile-section mb-4">
          <h1 className="text-2xl font-bold mb-4">{userData.user.name} {userData.user.lastname}</h1>
          <div className="profile-info">
            <div className="info-item">
              <span className="label">City:</span>
              {editable ? (
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="value-edit" />
              ) : (
                <span className="value">{userData.user.city || 'N/A'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">Birthday:</span>
              {editable ? (
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="value-edit" />
              ) : (
                <span className="value">{userData.user.birthday ? new Date(parseInt(userData.user.birthday)).toISOString().split('T')[0] : 'N/A'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">About Me:</span>
              {editable ? (
                <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} className="value-edit" />
              ) : (
                <span className="value">{userData.user.aboutMe || 'N/A'}</span>
              )}
            </div>
            {user && user.name === userData.user.name && user.lastname === userData.user.lastname && (
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
        {user && (user.name !== userData.user.name || user.lastname !== userData.user.lastname) && (
          <div className="action-section mt-4">
            <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Send Message</button>
            {isFriend ? (
              <button onClick={handleRemoveFriend} className="bg-red-500 text-white px-4 py-2 rounded mt-2 ml-2">Remove Friend</button>
            ) : (
              requestPending ? (
                <button disabled className="bg-gray-500 text-white px-4 py-2 rounded mt-2 ml-2">Request Pending</button>
              ) : (
                <button onClick={handleAddFriend} className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2">Add Friend</button>
              )
            )}
          </div>
        )}

        <div className="profile-section mb-4">
          <h2 className="text-xl font-bold mt-8 mb-4">Your Posts</h2>
          {user && user.name === userData.user.name && user.lastname === userData.user.lastname && <CreatePost />}
          {postsData.posts.filter(post => post.author.id === userData.user.id).map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
        {/* <div className="profile-section mb-4">
          <h2 className="text-xl font-bold mt-8 mb-4">Friends</h2>
          <button onClick={handleViewFriends} className="bg-blue-500 text-white px-4 py-2 rounded">View All Friends</button>
        </div> */}
      </div>

      {isOwnProfile && (
        <div className="friend-requests-container bg-white shadow-md rounded p-4 w-1/4 ml-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
          {userData.user.friendRequests.length === 0 ? (
            <p>No friend requests</p>
          ) : (
            userData.user.friendRequests.map((request) => (
              <div key={request.id} className="friend-request-item mb-4">
                <div className="flex items-center">
                  <img src={request.profilePicture || 'https://via.placeholder.com/50'} alt={request.name} className="friend-request-image rounded-full" style={{ width: '50px', height: '50px' }} />
                  <div className="ml-4">
                    <p className="font-bold">{request.name} {request.lastname}</p>
                    <div className="flex mt-2">
                      <button onClick={() => handleAcceptRequest(request.id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Accept</button>
                      <button onClick={() => handleRejectRequest(request.id)} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;