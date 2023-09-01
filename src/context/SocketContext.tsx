import { config } from '@/config';
import React, { createContext, useContext, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps {
  socket: Socket;
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ socket, children }) => {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const initializeSocket = () => {
  const url = config.PORT
  const socket = io(url);
  return socket;
};
