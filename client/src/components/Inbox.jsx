import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import ChatThread from "./ChatThread";
import '../css/inbox.css';

const Inbox = () => {
  const { user } = useAuth();
  const { receiverId, setReceiverId, threads, loading, error, refetch, openChatWithUser } = useChat();
  const [selectedUserId, setSelectedUserId] = useState(receiverId);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receiverIdFromParams = queryParams.get("receiverId");
    if (receiverIdFromParams) {
      setReceiverId(receiverIdFromParams);
      setSelectedUserId(receiverIdFromParams);
      openChatWithUser(receiverIdFromParams);
    }
  }, [location.search, setReceiverId, openChatWithUser]);

  useEffect(() => {
    if (user) {
      refetch(); 
    }
  }, [user, refetch]);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    openChatWithUser(userId);
  };

  useEffect(() => {
    setSelectedUserId(receiverId);
  }, [receiverId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const selectedThread = threads[selectedUserId] || { user: { id: selectedUserId }, messages: [] };

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
        {selectedThread ? (
          <ChatThread thread={selectedThread} onBack={() => setSelectedUserId(null)} />
        ) : (
          <p>Select a user to view the chat</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
