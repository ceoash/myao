import { create } from 'zustand';

interface MessageModalStore {
  isOpen: boolean;
  userId: string | null;
  recipientId: string | null;
  onOpen: (
    userId: string,
    recipientId: string,
  ) => void;
  onClose: () => void;
}

const useMessageModal = create<MessageModalStore>((set) => ({
  isOpen: false,
  userId: null,
  recipientId: null,
  onOpen: (
    userId: string,
    recipientId: string,
  ) => {
    set({ isOpen: true, userId, recipientId });
  },
  onClose: () => {
    set({ isOpen: false, userId: null, recipientId: null });
  },
}));

export default useMessageModal;

