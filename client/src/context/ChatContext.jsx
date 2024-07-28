import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import io from 'socket.io-client';
import { useAuth } from "../context/AuthContext";
import dayjs from 'dayjs';

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

  const formatTimestamp = (timestamp) => dayjs(timestamp).format('MMMM D HH:mm');

  const updateThreads = useCallback((messages) => {
    const updatedThreads = {};
    const userSet = new Set();

    messages.forEach((msg) => {
      const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
      if (!updatedThreads[otherUser.id]) {
        updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: false };
      }
      updatedThreads[otherUser.id].messages.push(msg);
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
  }, [user]);

  useEffect(() => {
    if (data && data.messages && user) {
      updateThreads(data.messages);
    }
  }, [data, user, updateThreads]);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.id });

      const handleReceiveMessage = (newMessage) => {
        setThreads((prevThreads) => {
          const updatedThreads = { ...prevThreads };
          const otherUser = newMessage.sender.id === user.id ? newMessage.receiver : newMessage.sender;

          if (!updatedThreads[otherUser.id]) {
            updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: true };
          }
          if (!updatedThreads[otherUser.id].messages.find(msg => msg.id === newMessage.id)) {
            updatedThreads[otherUser.id].messages.push(newMessage);
            updatedThreads[otherUser.id].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          return updatedThreads;
        });
        setUnreadUsers((prevUsers) => new Set(prevUsers.add(newMessage.sender.id === user.id ? newMessage.receiver.id : newMessage.sender.id)));
      };

      socket.on('receiveMessage', handleReceiveMessage);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
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
        timestamp: data.sendMessage.timestamp,  // Assuming this is already correctly formatted
      };

      socket.emit('sendMessage', newMessage);

      setThreads((prevThreads) => {
        const updatedThreads = { ...prevThreads };
        if (!updatedThreads[receiverId]) {
          updatedThreads[receiverId] = { user: { id: receiverId }, messages: [] };
        }
        if (!updatedThreads[receiverId].messages.find(msg => msg.id === newMessage.id)) {
          updatedThreads[receiverId].messages.push(newMessage);
          updatedThreads[receiverId].messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        return updatedThreads;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser, closeProfileChat, isProfileChatOpen, sendMessage, formatTimestamp, socket }}>
      {children}
    </ChatContext.Provider>
  );
};