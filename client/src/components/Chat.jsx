import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import '../css/chat.css';

const ChatComponent = ({ receiverId }) => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL);

        if (user) {
            socket.emit('join', { userId: user._id });

            socket.on('receiveMessage', (newMessage) => {
                if (newMessage.senderId === receiverId || newMessage.receiverId === user._id) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });
        }

        return () => {
            socket.off('receiveMessage');
        };
    }, [user, receiverId]);

    const sendMessage = () => {
        if (message.trim() && receiverId) {
            const newMessage = {
                senderId: user._id,
                receiverId: receiverId,
                message: message.trim(),
            };
            const socket = io(import.meta.env.VITE_API_URL);
            socket.emit('sendMessage', newMessage);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setMessage('');
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


