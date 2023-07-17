import React, { useState, useEffect } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';

interface SocketProviderProps {
  children: React.ReactNode;
  session: any;
}

export const SocketProvider = ({ children, session }: SocketProviderProps): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(config.PORT || 'https://myao-add-1fcc5262bac8.herokuapp.com');
    newSocket.emit('register', session?.user?.id);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
