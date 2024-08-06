import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import '../css/chatThread.css';

const ChatThread = ({ thread, onBack }) => {
  const { user } = useAuth();
  const { openChatWithUser, sendMessageViaSocket, closeProfileChat, closeThreadChat } = useChat(); 
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(thread ? thread.messages : []); // Initialize with an empty array
  const messageListRef = useRef(null);

  useEffect(() => {
    if (thread && thread.user) {
      openChatWithUser(thread.user.id);
      closeProfileChat(); 
    }
  }, [thread, openChatWithUser, closeProfileChat]);

  useEffect(() => {
    if (thread && thread.messages) {
      setMessages(thread.messages);
    }
  }, [thread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && thread?.user?.id !== user.id) {
      sendMessageViaSocket(thread.user.id, message.trim());
      setMessage('');
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
        <button onClick={() => { closeThreadChat(); onBack(); }}>Back to Inbox</button>
        <p>Select a user to start a conversation</p>
      </div>
    );
  }

  return (
    <div className="chat-thread-container">
      <div className="chat-thread">
        <button onClick={() => { closeThreadChat(); onBack(); }}>Back to Inbox</button>
        <h3>Chat with {thread.user.name} {thread.user.lastname}</h3>
        <div className="message-list" ref={messageListRef}>
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="message">
                <p>
                  <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
                </p>
              </div>
            ))
          ) : (
            <p>No messages yet</p>
          )}
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
