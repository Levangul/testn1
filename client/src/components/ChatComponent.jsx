// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import { useAuth } from '../context/AuthContext';
// import { useChat } from '../context/ChatContext';
// import { useMutation } from '@apollo/client';
// import { SEND_MESSAGE } from '../utils/mutations';
// import '../css/chat.css';

// const socket = io(import.meta.env.VITE_API_URL);

// const ChatComponent = () => {
//   const { user } = useAuth();
//   const { receiverId, threads } = useChat();
//   const [message, setMessage] = useState('');

//   const [sendMessageMutation] = useMutation(SEND_MESSAGE);

//   const messages = receiverId ? threads[receiverId]?.messages || [] : [];

//   const sendMessage = async () => {
//     if (message.trim() && receiverId && receiverId !== user.id) {
//       try {
//         const { data } = await sendMessageMutation({
//           variables: { receiverId, message: message.trim() },
//         });

//         const newMessage = {
//           id: data.sendMessage.id,
//           senderId: user.id,
//           receiverId: receiverId,
//           message: data.sendMessage.message,
//           timestamp: data.sendMessage.timestamp,
//         };

//         socket.emit('sendMessage', newMessage);
//         setMessage('');
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     } else {
//       console.error('Cannot send message to self or empty message');
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>Chat with {receiverId}</h2>
//       </div>
//       <div className="chat-messages">
//         {messages.map((msg) => (
//           <div key={msg.id}>
//             <strong>{msg.senderId === user.id ? 'You' : `${msg.sender.name} ${msg.sender.lastname}`}</strong>: {msg.message}
//           </div>
//         ))}
//       </div>
//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatComponent;
