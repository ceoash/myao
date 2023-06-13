import { User } from '@prisma/client';
import { create } from 'zustand';

interface QuickConnectStore {
  isOpen: boolean;
  foundUser: User | null;
  sessionId: string | null;
  onOpen: (user: User | null, sessionId: string) => void;
  onClose: () => void;
}

const useQuickConnect = create<QuickConnectStore>((set) => ({
  isOpen: false,
  foundUser: null,
  sessionId: null,
  onOpen: (user, sessionId) => {
    set({ isOpen: true, foundUser: user, sessionId });
  },
  onClose: () => {
    set({ isOpen: false, foundUser: null, sessionId: null });
  },
}));

export default useQuickConnect;
