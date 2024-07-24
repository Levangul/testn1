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
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, { skip: !user });
  const [receiverId, setReceiverId] = useState(null);
  const [isProfileChatOpen, setIsProfileChatOpen] = useState(false);
  const [threads, setThreads] = useState({});
  const [unreadUsers, setUnreadUsers] = useState(new Set());

  useEffect(() => {
    if (data && data.messages && user) {
      const updatedThreads = {};
      const userSet = new Set();

      data.messages.forEach((msg) => {
        const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
        if (!updatedThreads[otherUser.id]) {
          updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: false };
        }
        updatedThreads[otherUser.id].messages.push({ ...msg });
        if (msg.sender.id !== user.id && !msg.read) {
          updatedThreads[otherUser.id].unread = true;
          userSet.add(otherUser.id);
        }
      });

      Object.values(updatedThreads).forEach((thread) => {
        thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });

      setThreads(updatedThreads);
      setUnreadUsers(userSet);
    }
  }, [data, user]);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.id });

      socket.on('receiveMessage', (newMessage) => {
        const otherUser = newMessage.sender.id === user.id ? newMessage.receiver : newMessage.sender;
        setThreads((prevThreads) => {
          const updatedThreads = { ...prevThreads };
          if (!updatedThreads[otherUser.id]) {
            updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: true };
          }
          updatedThreads[otherUser.id].messages.push({ ...newMessage });
          updatedThreads[otherUser.id].unread = true;

          updatedThreads[otherUser.id].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          return updatedThreads;
        });
        setUnreadUsers((prevUsers) => new Set(prevUsers.add(otherUser.id)));
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [user]);

  const openChatWithUser = async (userId, fromProfile = false) => {
    setReceiverId(userId);
    if (fromProfile) {
      setIsProfileChatOpen(true);
    }
  };

  const closeProfileChat = () => {
    setIsProfileChatOpen(false);
  };

  const sendMessage = async (receiverId, message, sendMessageMutation) => {
    try {
      const { data } = await sendMessageMutation({
        variables: { receiverId, message },
      });

      const newMessage = {
        id: data.sendMessage.id,
        sender: { id: user.id, name: user.name, lastname: user.lastname },
        receiver: { id: receiverId },
        message: data.sendMessage.message,
        timestamp: data.sendMessage.timestamp,
      };

      socket.emit('sendMessage', newMessage);

      setThreads((prevThreads) => {
        const updatedThreads = { ...prevThreads };
        if (!updatedThreads[receiverId]) {
          updatedThreads[receiverId] = { user: { id: receiverId }, messages: [] };
        }
        updatedThreads[receiverId].messages.push(newMessage);
        updatedThreads[receiverId].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return updatedThreads;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser, closeProfileChat, isProfileChatOpen, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};


