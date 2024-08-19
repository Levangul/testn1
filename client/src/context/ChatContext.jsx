import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import io from 'socket.io-client';
import { useAuth } from "../context/AuthContext";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

const socket = io(import.meta.env.VITE_API_URL);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, { skip: !user });
  const [receiverId, setReceiverId] = useState(null);
  const [isProfileChatOpen, setIsProfileChatOpen] = useState(false);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [threads, setThreads] = useState({});
  const [unreadUsers, setUnreadUsers] = useState(new Set());
  const messageListRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 400); // Adjust delay as necessary
    }
  }, []);

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
    setIsProfileChatOpen(fromProfile);
    setIsThreadOpen(!fromProfile); // Toggle based on which component is open
  };

  const closeProfileChat = () => {
    setIsProfileChatOpen(false);
  };

  const closeThreadChat = () => {
    setIsThreadOpen(false);
  };

  const sendMessageViaSocket = (receiverId, message) => {
    if (!user || !receiverId) {
      console.error('Error: senderId or receiverId is undefined', { senderId: user?.id, receiverId });
      return;
    }
  
    socket.emit('sendMessage', {
      senderId: user.id,
      receiverId: receiverId,
      message: message,
    });
  };

  return (
    <ChatContext.Provider value={{
      receiverId,
      setReceiverId,
      threads,
      loading,
      error,
      refetch,
      openChatWithUser,
      closeProfileChat,
      closeThreadChat,
      isProfileChatOpen,
      isThreadOpen,
      sendMessageViaSocket,
      scrollToBottom,  // Make scrollToBottom available to the components
      messageListRef,  // Make the ref available to the components
      socket
    }}>
      {children}
    </ChatContext.Provider>
  );
};
