import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import { SEND_MESSAGE } from "../utils/mutations";
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
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [receiverId, setReceiverId] = useState(null);
  const [isProfileChatOpen, setIsProfileChatOpen] = useState(false);
  const [threads, setThreads] = useState({});
  const [unreadUsers, setUnreadUsers] = useState(new Set());

  const formatTimestamp = (timestamp) => dayjs(timestamp).tz(dayjs.tz.guess()).format('MMMM D YYYY HH:mm');

  const updateThreads = useCallback((messages) => {
    const updatedThreads = {};
    const userSet = new Set();

    messages.forEach((msg) => {
      const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
      if (!updatedThreads[otherUser.id]) {
        updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: false };
      }
      updatedThreads[otherUser.id].messages.push({
        ...msg,
        timestamp: dayjs(msg.timestamp).toISOString() // Ensure the timestamp is formatted correctly
      });
      if (msg.sender.id !== user.id && !msg.read) {
        updatedThreads[otherUser.id].unread = true;
        userSet.add(otherUser.id);
      }
    });

    Object.values(updatedThreads).forEach((thread) => {
      thread.messages.sort((a, b) => dayjs(a.timestamp).diff(dayjs(b.timestamp)));
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
        if (newMessage.sender.id === user.id) {
          // If the message was sent by the user, skip handling it
          return;
        }

        console.log('Received message timestamp:', newMessage.timestamp);
        newMessage.timestamp = dayjs(newMessage.timestamp).toISOString(); // Ensure correct format
        setThreads((prevThreads) => {
          const updatedThreads = { ...prevThreads };
          const otherUser = newMessage.sender.id === user.id ? newMessage.receiver : newMessage.sender;

          if (!updatedThreads[otherUser.id]) {
            updatedThreads[otherUser.id] = { user: otherUser, messages: [], unread: true };
          }
          if (!updatedThreads[otherUser.id].messages.find(msg => msg.id === newMessage.id)) {
            updatedThreads[otherUser.id].messages.push(newMessage);
            updatedThreads[otherUser.id].messages.sort((a, b) => dayjs(a.timestamp).diff(dayjs(b.timestamp)));
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

  const sendMessage = async (receiverId, message) => {
    if (!user || !receiverId) {
      console.error('Error: senderId or receiverId is undefined', { senderId: user?.id, receiverId });
      return;
    }

    try {
      console.log('Sending message:', { senderId: user.id, receiverId, message });

      const { data } = await sendMessageMutation({
        variables: { receiverId, message },
      });

      const newMessage = {
        id: data.sendMessage.id,
        sender: { id: user.id, name: user.name, lastname: user.lastname },
        receiver: { id: receiverId },
        message: data.sendMessage.message,
        timestamp: dayjs().toISOString(),  // Ensure the timestamp is correctly formatted
        read: false // Ensure read status is included
      };

      console.log('New message created:', newMessage);

      // Emit the message via socket
      socket.emit('sendMessage', newMessage);

      // Update the local state to include the new message
      setThreads((prevThreads) => {
        const updatedThreads = { ...prevThreads };
        if (!updatedThreads[receiverId]) {
          updatedThreads[receiverId] = { user: { id: receiverId }, messages: [] };
        }
        if (!updatedThreads[receiverId].messages.find(msg => msg.id === newMessage.id)) {
          updatedThreads[receiverId].messages.push(newMessage);
          updatedThreads[receiverId].messages.sort((a, b) => dayjs(a.timestamp).diff(dayjs(b.timestamp)));
        }
        return updatedThreads;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Error sending message');
    }
  };

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser, closeProfileChat, isProfileChatOpen, sendMessage, formatTimestamp, socket }}>
      {children}
    </ChatContext.Provider>
  );
};
