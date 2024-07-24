import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { SEND_MESSAGE } from '../utils/mutations';
import dayjs from 'dayjs';
import '../css/chat.css';

const ChatComponent = () => {
  const { user } = useAuth();
  const { receiverId, threads, isProfileChatOpen, closeProfileChat, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  const messages = receiverId ? threads[receiverId]?.messages || [] : [];

  const handleSendMessage = async () => {
    if (message.trim() && receiverId && receiverId !== user.id) {
      await sendMessage(receiverId, message.trim(), sendMessageMutation);
      setMessage('');
    } else {
      console.error('Cannot send message to self or empty message');
    }
  };

  if (!isProfileChatOpen) {
    return null;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {receiverId}</h2>
        <button onClick={closeProfileChat}>Close</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
            <p><small>{dayjs(msg.timestamp).format('YYYY-MM-DD HH:mm:ss')}</small></p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;








