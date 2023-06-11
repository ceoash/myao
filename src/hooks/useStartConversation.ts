import { create } from 'zustand';

interface ConversationModalStore {
  isOpen: boolean;
  onOpen: (setActiveConversation: (newConversation: any) => void, setUsername: (username: string) => void) => void;
  onClose: () => void;
  setActiveConversation: (newConversation: any) => void;
  setUsername: (username: string) => void;
}

const useStartConversation = create<ConversationModalStore>((set) => ({
  isOpen: false,
  onOpen: (setActiveConversation, setUsername) => {
    set((state) => ({
      ...state,
      isOpen: true,
      setActiveConversation: setActiveConversation,
      setUsername: setUsername,
    }));
  },
  onClose: () => {
    set((state) => ({
      ...state,
      isOpen: false,
    }));
  },
  setActiveConversation: (newConversation) => {
    set((state) => ({
      ...state,
      activeConversation: newConversation,
    }));
  },
  setUsername: (username) => {
    set((state) => ({
      ...state,
      username: username,
    }));
  },
}));

export default useStartConversation;
