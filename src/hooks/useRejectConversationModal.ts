import { create } from 'zustand';

interface RejectConversation {
    isOpen: boolean;
    conversationId: string | null;
    setStatus: (status: string | null) => void; 
    session?: any;
    recipientId?: string;
    onOpen: (
      id: string,
      session: any,
      recipientId: string,
      setStatus: (status: string | null) => void,
    ) => void;
    onClose: () => void;
  }
  
  const useRejectConversation = create<RejectConversation>((set) => ({
    isOpen: false,
    conversationId: null,
    setStatus: () => {},
    session: null,
    recipientId: "",  
    onOpen: (
        id: string, 
        session: any, 
        recipientId: string,  
        setStatus: (status: string | null) => void) => {
      set({ 
        isOpen: true, 
        conversationId: id,  
        setStatus, 
        session, 
        recipientId });
      return;
    },
    onClose: () => {
      set({ 
        isOpen: false, 
        session: null, 
        recipientId: "", 
        conversationId: null, 
        setStatus: () => {} }); 
      return;
    },
  }));
  
  export default useRejectConversation;
  