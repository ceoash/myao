import { User } from '@/types';
import { create } from 'zustand';

interface Conversation{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  directMessages: any;
  participant1: User;
  participant2: User; 
}

interface PendingConversationModalStore {
  isOpen: boolean;
  userId: string | null;
  conversation: Conversation | null;
  session: any;
  onOpen: (
    userId: string,
    conversation: Conversation | null,
    session: any,
  ) => void;
  onClose: () => void;
}

const useConversationModal = create<PendingConversationModalStore>((set) => ({
  isOpen: false,
  userId: null,
  conversation: null,
  session: null,
  onOpen: (
    userId: string,
    conversation: Conversation | null,
    session: any,
  ) => {
    set({ isOpen: true, userId, conversation, session });
  },
  onClose: () => {
    set({ isOpen: false, userId: null, conversation: null, session: null });
  },
}));

export default useConversationModal;

