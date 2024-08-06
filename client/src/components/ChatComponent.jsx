import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import '../css/chat.css';

const ChatComponent = () => {
  const { user } = useAuth();
  const { receiverId, threads, isProfileChatOpen, closeProfileChat, closeThreadChat, sendMessageViaSocket, formatTimestamp } = useChat();
  const [message, setMessage] = useState('');

  const messages = receiverId ? threads[receiverId]?.messages || [] : [];

  const handleSendMessage = () => {
    if (message.trim() && receiverId && receiverId !== user.id) {
      sendMessageViaSocket(receiverId, message.trim());
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
        <button onClick={() => { closeProfileChat(); closeThreadChat(); }}>Close</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
            <p><small>{("date")}</small></p>
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
