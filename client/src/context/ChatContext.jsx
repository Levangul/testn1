import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [receiverId, setReceiverId] = useState(null);

  return (
    <ChatContext.Provider value={{ receiverId, setReceiverId }}>
      {children}
    </ChatContext.Provider>
  );
};
