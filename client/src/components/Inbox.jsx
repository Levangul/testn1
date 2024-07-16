import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import { useAuth } from "../context/AuthContext";
import ChatThread from "./ChatThread";
import '../css/inbox.css'; // Make sure to import the CSS file

const Inbox = () => {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_MESSAGES);
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Group messages by the other user
  const threads = {};
  data.messages.forEach((msg) => {
    const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
    if (!threads[otherUser.id]) {
      threads[otherUser.id] = {
        user: otherUser,
        messages: [],
      };
    }
    threads[otherUser.id].messages.push(msg);
  });

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="inbox-container">
      <div className="user-list">
        <h2>Inbox</h2>
        {Object.keys(threads).length === 0 && <p>No messages</p>}
        {Object.values(threads).map((thread) => (
          <div key={thread.user.id} className="user-item" onClick={() => handleUserClick(thread.user.id)}>
            <p>{thread.user.username}</p>
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedUserId ? (
          <ChatThread thread={threads[selectedUserId]} onBack={() => setSelectedUserId(null)} />
        ) : (
          <p>Select a user to view the chat</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
