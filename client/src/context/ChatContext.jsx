import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import { MARK_MESSAGES_AS_READ } from "../utils/mutations";
import io from 'socket.io-client';
import { useAuth } from "../context/AuthContext";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

const socket = io(import.meta.env.VITE_API_URL);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, {
    skip: !user,
  });
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);
  const [receiverId, setReceiverId] = useState(null);
  const [threads, setThreads] = useState({});
  const [unreadUsers, setUnreadUsers] = useState(new Set());

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
            unread: false,
          };
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
            updatedThreads[otherUser.id] = {
              user: otherUser,
              messages: [],
              unread: true,
            };
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

  const openChatWithUser = async (userId) => {
    setReceiverId(userId);

    try {
      await markMessagesAsRead({ variables: { receiverId: userId } });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }

    setThreads((prevThreads) => {
      const updatedThreads = { ...prevThreads };
      if (updatedThreads[userId]) {
        updatedThreads[userId].unread = false;
        updatedThreads[userId].messages = updatedThreads[userId].messages.map(msg => ({
          ...msg,
          read: msg.sender.id !== user.id ? true : msg.read,
        }));
      }
      return updatedThreads;
    });
    setUnreadUsers((prevUsers) => {
      const updatedUsers = new Set(prevUsers);
      updatedUsers.delete(userId);
      return updatedUsers;
    });
  };

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser, unreadCount: unreadUsers.size }}>
      {children}
    </ChatContext.Provider>
  );
};

