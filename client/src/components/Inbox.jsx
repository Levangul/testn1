import React from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../utils/queries";
import { useAuth } from "../context/AuthContext";

const Inbox = () => {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_MESSAGES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="inbox-container">
      <h2>Inbox</h2>
      {data && data.messages.length === 0 && <p>No messages</p>}
      {data &&
        data.messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>
              <strong>{msg.sender.username}</strong>: {msg.message}
            </p>
            <p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </p>
          </div>
        ))}
    </div>
  );
};

export default Inbox;


