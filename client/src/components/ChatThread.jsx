import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../utils/mutations";
import { useAuth } from "../context/AuthContext";
import io from 'socket.io-client';
import '../css/chatThread.css';

const socket = io(import.meta.env.VITE_API_URL);

const ChatThread = ({ thread, onBack }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(thread.messages);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    setMessages(thread.messages);
  }, [thread]);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user.id });
      console.log("User joined socket with ID:", user.id);

      socket.on('receiveMessage', (newMessage) => {
        if (newMessage.senderId === thread.user.id || newMessage.receiverId === user.id) {
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
  }, [user, thread]);

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

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
        console.log("Message sent:", newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="chat-thread">
      <button onClick={onBack}>Back to Inbox</button>
      <h3>Chat with {thread.user.username}</h3>
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>
              <strong>{msg.sender.id === user.id ? 'You' : msg.sender.username}</strong>: {msg.message}
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


