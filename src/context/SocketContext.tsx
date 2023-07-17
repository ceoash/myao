import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

export const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
