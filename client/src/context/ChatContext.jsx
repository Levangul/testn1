import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import io from 'socket.io-client';
import { useAuth } from "../context/AuthContext";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

const socket = io(import.meta.env.VITE_API_URL);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES);
  const [receiverId, setReceiverId] = useState(null);
  const [threads, setThreads] = useState({});
  const [unreadUsers, setUnreadUsers] = useState(new Set()); // Track users who sent unread messages

  useEffect(() => {
    if (data && data.messages && user) {
      const updatedThreads = {};
      const userSet = new Set();
      
      data.messages.forEach((msg) => {
        const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
        if (!updatedThreads[otherUser.id]) {
          updatedThreads[otherUser.id] = {
            user: otherUser,
            messages: [],
            unread: true, // Mark thread as unread initially
          };
        }
        updatedThreads[otherUser.id].messages.push(msg);
        userSet.add(otherUser.id); // Add sender/receiver to the set
      });

      // Sort messages by timestamp
      Object.values(updatedThreads).forEach((thread) => {
        thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });

      setThreads(updatedThreads);
      setUnreadUsers(userSet); // Update unread users set
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
              unread: true, // Mark new thread as unread
            };
          }
          updatedThreads[otherUser.id].messages.push(newMessage);
          updatedThreads[otherUser.id].unread = true; // Mark as unread on new message

          // Sort messages by timestamp
          updatedThreads[otherUser.id].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          return updatedThreads;
        });
        setUnreadUsers((prevUsers) => new Set(prevUsers.add(otherUser.id))); // Add to unread users set
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [user]);

  const openChatWithUser = (userId) => {
    setReceiverId(userId);
    setThreads((prevThreads) => {
      const updatedThreads = { ...prevThreads };
      if (updatedThreads[userId]) {
        updatedThreads[userId].unread = false; // Mark thread as read
      }
      return updatedThreads;
    });
    setUnreadUsers((prevUsers) => {
      const updatedUsers = new Set(prevUsers);
      updatedUsers.delete(userId); // Remove from unread users set
      return updatedUsers;
    });
  };

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser, unreadCount: unreadUsers.size }}>
      {children}
    </ChatContext.Provider>
  );
};

