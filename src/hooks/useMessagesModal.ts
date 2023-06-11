import { create } from 'zustand';

interface MessageModalStore {
  isOpen: boolean;
  userId: string | null;
  onOpen: (
    userId: string,
    recipientId: string,
  ) => void;
  onClose: () => void;
}

const useMessageModal = create<MessageModalStore>((set) => ({
  isOpen: false,
  userId: null,
  onOpen: (
    userId: string,
    recipientId: string,
  ) => {
    set({ isOpen: true, userId });
  },
  onClose: () => {
    set({ isOpen: false, userId: null, });
  },
}));

export default useMessageModal;

