import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import '../css/chatThread.css';

const ChatThread = ({ thread, onBack }) => {
  const { user } = useAuth();
  const { openChatWithUser, sendMessage, formatTimestamp } = useChat();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(thread.messages);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (thread && thread.user) {
      openChatWithUser(thread.user.id);
    }
  }, [thread, openChatWithUser]);

  useEffect(() => {
    if (thread && thread.messages) {
      setMessages(thread.messages);
    }
  }, [thread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() && thread.user.id !== user.id) {
      try {
        await sendMessage(thread.user.id, message.trim());
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

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
                <small>{formatTimestamp(msg.timestamp)}</small>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
