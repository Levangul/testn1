import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import ChatThread from "./ChatThread";
import '../css/inbox.css';

const Inbox = () => {
  const { user } = useAuth();
  const { receiverId, threads, loading, error, refetch } = useChat();
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (user) {
      refetch(); // Fetch threads when the component mounts and user is available
    }
  }, [user, refetch]);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  useEffect(() => {
    if (receiverId) {
      setSelectedUserId(receiverId);
    }
  }, [receiverId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const selectedThread = threads[selectedUserId];

  return (
    <div className="inbox-container">
      <div className="user-list">
        <h2>Inbox</h2>
        {Object.keys(threads).length === 0 && <p>No messages</p>}
        {Object.values(threads).map((thread) => (
          <div key={thread.user.id} className="user-item" onClick={() => handleUserClick(thread.user.id)}>
            <p>{thread.user.name} {thread.user.lastname}</p>
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedUserId ? (
          <ChatThread thread={selectedThread} onBack={() => setSelectedUserId(null)} />
        ) : (
          <p>Select a user to view the chat</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;


