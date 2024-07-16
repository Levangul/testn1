import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useMutation, useQuery } from '@apollo/client';
import { SEND_MESSAGE } from '../utils/mutations';
import { GET_MESSAGES } from '../utils/queries';
import '../css/chat.css';

const socket = io(import.meta.env.VITE_API_URL);

const ChatComponent = () => {
  const { user } = useAuth();
  const { receiverId } = useChat();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const { loading, error, data } = useQuery(GET_MESSAGES);

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (data && data.messages) {
      const filteredMessages = data.messages.filter(
        (msg) =>
          (msg.sender.id === user.id && msg.receiver.id === receiverId) ||
          (msg.sender.id === receiverId && msg.receiver.id === user.id)
      );
      setMessages(filteredMessages);
    }
  }, [data, user.id, receiverId]);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.id });
      console.log("User joined socket with ID:", user.id);

      socket.on('receiveMessage', (newMessage) => {
        if (
          (newMessage.senderId === receiverId && newMessage.receiverId === user.id) ||
          (newMessage.senderId === user.id && newMessage.receiverId === receiverId)
        ) {
          setMessages((prevMessages) => {
            if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });
          console.log("Received message:", newMessage);
        }
      });
    }

    return () => {
      socket.off('receiveMessage');
    };
  }, [user, receiverId]);

  const sendMessage = async () => {
    if (message.trim() && receiverId && receiverId !== user.id) {
      console.log("Sending message to receiverId:", receiverId);
      try {
        const { data } = await sendMessageMutation({
          variables: { receiverId, message: message.trim() },
        });

        const newMessage = {
          id: data.sendMessage.id,
          senderId: user.id,
          receiverId: receiverId,
          message: data.sendMessage.message,
          timestamp: data.sendMessage.timestamp,
        };

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
        console.log("Message sent:", newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Cannot send message to self or empty message');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {receiverId}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderId === user.id ? 'You' : msg.sender.username}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
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

export default ChatComponent;
