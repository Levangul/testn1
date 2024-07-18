import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import { useAuth } from "../context/AuthContext";
import ChatThread from "./ChatThread";
import io from 'socket.io-client';
import '../css/inbox.css'; // Make sure to import the CSS file

const socket = io(import.meta.env.VITE_API_URL);

const Inbox = () => {
  const { user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [threads, setThreads] = useState({});

  useEffect(() => {
    if (data && data.messages && user) {
      const updatedThreads = {};
      data.messages.forEach((msg) => {
        const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
        if (!updatedThreads[otherUser.id]) {
          updatedThreads[otherUser.id] = {
            user: otherUser,
            messages: [],
          };
        }
        updatedThreads[otherUser.id].messages.push(msg);
      });

      // Sort messages by timestamp
      Object.values(updatedThreads).forEach((thread) => {
        thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });

      setThreads(updatedThreads);
    }
  }, [data, user]);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.id });

      socket.on('receiveMessage', (newMessage) => {
        const otherUser = newMessage.senderId === user.id ? newMessage.receiver : newMessage.sender;
        setThreads((prevThreads) => {
          const updatedThreads = { ...prevThreads };
          if (!updatedThreads[otherUser.id]) {
            updatedThreads[otherUser.id] = {
              user: otherUser,
              messages: [],
            };
          }
          updatedThreads[otherUser.id].messages.push(newMessage);

          // Sort messages by timestamp
          updatedThreads[otherUser.id].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          return updatedThreads;
        });
      });
    }

    return () => {
      socket.off('receiveMessage');
    };
  }, [user]);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="inbox-container">
      <div className="user-list">
        <h2>Inbox</h2>
        {Object.keys(threads).length === 0 && <p>No messages</p>}
        {Object.values(threads).map((thread) => (
          <div key={thread.user.id} className="user-item" onClick={() => handleUserClick(thread.user.id)}>
            <p>{thread.user.name} {thread.user.lastname}</p>
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedUserId ? (
          <ChatThread thread={threads[selectedUserId]} onBack={() => setSelectedUserId(null)} />
        ) : (
          <p>Select a user to view the chat</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
