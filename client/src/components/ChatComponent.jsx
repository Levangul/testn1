import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import '../css/chat.css';

const ChatComponent = () => {
  const { user } = useAuth();
  const { receiverId, threads, isProfileChatOpen, closeProfileChat, closeThreadChat, sendMessageViaSocket } = useChat();
  const [message, setMessage] = useState('');
  const messageListRef = useRef(null);

  const messages = receiverId ? threads[receiverId]?.messages || [] : [];
  const receiverName = receiverId ? `${threads[receiverId].user.name} ${threads[receiverId].user.lastname}` : 'Unknown User';

  const handleSendMessage = () => {
    if (message.trim() && receiverId && receiverId !== user.id) {
      sendMessageViaSocket(receiverId, message.trim());
      setMessage('');
      scrollToBottom(); // Scroll after sending the message
    } else {
      console.error('Cannot send message to self or empty message');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  if (!isProfileChatOpen) {
    return null;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{receiverName}</h2>
        <button onClick={() => { closeProfileChat(); closeThreadChat(); }}>Close</button>
      </div>
      <div className="chat-messages" ref={messageListRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender.id === user.id ? 'sender' : 'receiver'}`}>
          <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
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
