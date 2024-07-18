import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../utils/mutations";
import { useAuth } from "../context/AuthContext";
import '../css/chatThread.css'; // Make sure to import the CSS file

const ChatThread = ({ thread, onBack }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(thread.messages);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  // Update messages when the thread changes
  useEffect(() => {
    setMessages(thread.messages);
  }, [thread]);

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
          timestamp: data.sendMessage.timestamp,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="chat-thread">
      <button onClick={onBack}>Back to Inbox</button>
      <h3>Chat with {thread.user.name} {thread.user.lastname}</h3>
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>
              <strong>{msg.sender.id === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
            </p>
            <p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
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
