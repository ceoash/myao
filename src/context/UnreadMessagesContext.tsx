import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UnreadMessagesContextProps {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextProps | undefined>(undefined);

export const useUnreadMessages = (): UnreadMessagesContextProps => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error("useUnreadMessages must be used within an UnreadMessagesProvider");
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const UnreadMessagesProvider: React.FC<ProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};
