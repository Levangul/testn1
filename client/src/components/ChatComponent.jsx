import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '../utils/mutations';
import '../css/chat.css';

const socket = io(import.meta.env.VITE_API_URL);

const ChatComponent = () => {
  const { user } = useAuth();
  const { receiverId } = useChat();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user._id });
      console.log("User joined socket with ID:", user._id);

      socket.on('receiveMessage', (newMessage) => {
        if (newMessage.senderId === receiverId || newMessage.receiverId === user._id) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          console.log("Received message:", newMessage);
        }
      });
    }

    return () => {
      socket.off('receiveMessage');
    };
  }, [user, receiverId]);

  const sendMessage = async () => {
    if (message.trim() && receiverId && receiverId !== user._id) {
      console.log("Sending message to receiverId:", receiverId);
      try {
        const { data } = await sendMessageMutation({
          variables: { receiverId, message: message.trim() },
        });

        socket.emit('sendMessage', {
          senderId: user._id,
          receiverId: receiverId,
          message: data.sendMessage.message,
          timestamp: data.sendMessage.timestamp,
        });

        setMessages((prevMessages) => [...prevMessages, data.sendMessage]);
        setMessage('');
        console.log("Message sent:", data.sendMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Cannot send message to self or empty message');
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat with {receiverId}</h2>
      <div>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId === user._id ? 'You' : msg.senderId}</strong>: {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
