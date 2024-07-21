import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../utils/mutations";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import io from 'socket.io-client';
import '../css/chatThread.css';

const socket = io(import.meta.env.VITE_API_URL);

const ChatThread = ({ thread, onBack }) => {
  const { user } = useAuth();
  const { openChatWithUser } = useChat();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (thread && thread.user) {
      openChatWithUser(thread.user.id);
    }
  }, [thread, openChatWithUser]);

  useEffect(() => {
    if (thread && thread.messages) {
      setMessages(parseAndSortMessages(thread.messages));
    }
  }, [thread]);

  useEffect(() => {
    if (thread && thread.user) {
      const handleReceiveMessage = (newMessage) => {
        if (newMessage.sender.id === thread.user.id || newMessage.receiver.id === thread.user.id) {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            return parseAndSortMessages(updatedMessages);
          });
        }
      };

      socket.on('receiveMessage', handleReceiveMessage);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
      };
    }
  }, [thread]);

  const parseTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", timestamp);
      return new Date();
    }
    return date;
  };

  const parseAndSortMessages = (msgs) => {
    return msgs.map((msg) => ({
      ...msg,
      timestamp: parseTimestamp(msg.timestamp),
    })).sort((a, b) => a.timestamp - b.timestamp);
  };

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const { data } = await sendMessageMutation({
          variables: { receiverId: thread.user.id, message: message.trim() },
        });

        const newMessage = {
          id: data.sendMessage.id,
          sender: user,
          receiver: thread.user,
          message: data.sendMessage.message,
          timestamp: parseTimestamp(data.sendMessage.timestamp),
          read: true,
        };

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, { ...newMessage }];
          return parseAndSortMessages(updatedMessages);
        });

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Optionally, provide user feedback
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!thread || !thread.user) {
    return (
      <div className="chat-thread">
        <button onClick={onBack}>Back to Inbox</button>
        <p>Select a user to start a conversation</p>
      </div>
    );
  }

  return (
    <div className="chat-thread-container">
      <div className="chat-thread">
        <button onClick={onBack}>Back to Inbox</button>
        <h3>Chat with {thread.user.name} {thread.user.lastname}</h3>
        <div className="message-list" ref={messageListRef}>
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <p>
                <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
              </p>
              <p>
                <small>{msg.timestamp.toLocaleString()}</small>
              </p>
            </div>
          ))}
        </div>
        <div className="send-message">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null} // Send message on Enter key press
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;













