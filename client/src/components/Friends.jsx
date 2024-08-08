import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_USER } from '../utils/queries';
import { useAuth } from '../context/AuthContext';
import '../css/friendsList.css';

const FriendsList = () => {
  const { user } = useAuth();

  const { loading, error, data, refetch } = useQuery(GET_USER, {
    variables: {
      name: user?.name,
      lastname: user?.lastname,
    },
    skip: !user,
  });

  useEffect(() => {
    refetch();
  }, [user, refetch]);

  if (!user) {
    return <p>You need to log in to view your friends.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.user) {
    return <p>No user data found.</p>;
  }

  return (
    <div className="friends-list-container">
      <h2>Friends</h2>
      {data.user.friends.length > 0 ? (
        <ul>
          {data.user.friends.map((friend) => (
            <li key={friend.id} className="friend-item">
              <Link to={`/user/${friend.name}/${friend.lastname}`} className="flex items-center">
                <img
                  src={friend.profilePicture || 'https://via.placeholder.com/60'}
                  alt="Friend"
                  className="friend-image"
                />
                <div className="friend-info">
                  <span>{friend.name} {friend.lastname}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-friends-message">No friends found.</p>
      )}
    </div>
  );
};

export default FriendsList;
