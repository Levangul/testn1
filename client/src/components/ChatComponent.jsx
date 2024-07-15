import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../utils/mutations";
import "../css/chat.css";

const socket = io(import.meta.env.VITE_API_URL);

const ChatComponent = ({ receiverId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (user) {
      console.log("Joining room with userId:", user._id);
      socket.emit("join", { userId: user._id });

      socket.on("receiveMessage", (newMessage) => {
        console.log("Received message:", newMessage);
        if (
          newMessage.senderId === receiverId ||
          newMessage.receiverId === user._id
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
    }

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("receiveMessage");
    };
  }, [user, receiverId]);

  const sendMessage = async () => {
    console.log("Receiver ID:", receiverId, "Sender ID:", user._id);
    if (message.trim() && receiverId && receiverId !== user._id) {
      const newMessage = {
        senderId: user._id,
        receiverId: receiverId,
        message: message.trim(),
      };

      try {
        console.log("Sending message via mutation:", newMessage);
        const { data } = await sendMessageMutation({
          variables: { receiverId, message: message.trim() },
        });
        console.log("Mutation response:", data);

        console.log("Emitting sendMessage event to socket");
        socket.emit("sendMessage", {
          senderId: user._id,
          receiverId: receiverId,
          message: data.sendMessage.message,
          timestamp: data.sendMessage.timestamp,
        });

        setMessages((prevMessages) => [...prevMessages, data.sendMessage]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("Cannot send message to self or empty message");
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
            <strong>{msg.senderId === user._id ? "You" : msg.senderId}</strong>:{" "}
            {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
