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
    openChatWithUser(thread.user.id); // Mark thread as read when opened
  }, [thread.user.id]); // Add thread.user.id to the dependency array to ensure it only runs once per thread

  const parseTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", timestamp);
      return new Date(); // Fallback to current date
    }
    return date;
  };

  useEffect(() => {
    // Parse and sort messages by timestamp
    const parsedMessages = thread.messages.map((msg) => ({
      ...msg,
      timestamp: parseTimestamp(msg.timestamp)
    }));
    const sortedMessages = parsedMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(sortedMessages);
  }, [thread.messages]);

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
          timestamp: parseTimestamp(data.sendMessage.timestamp), // Ensure proper parsing
        };

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
          return updatedMessages;
        });

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
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

  useEffect(() => {
    // Scroll to bottom after initial render
    scrollToBottom();
  }, []);

  return (
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
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatThread;







