import { useSocketContext } from "@/context/SocketContext";
import { useEffect, useCallback } from "react";

export function useSocket(session: any) {
  const socket = useSocketContext();

  useEffect(() => {
    if (session?.user?.id) {
      socket?.emit("register", session?.user.id);
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket, session?.user?.id]);

  const subscribeToEvent = useCallback(
    (eventType: string, callback: (data: any) => void) => {
      socket?.on(eventType, callback);

      return () => {
        socket?.off(eventType, callback);
      };
    },
    [socket]
  );

  const emitEvent = useCallback((eventName: string, ...args: any[]) => {
    socket?.emit(eventName, ...args);
  }, [socket]);

  return {
    subscribeToEvent,
    emitEvent, 
  };
}
