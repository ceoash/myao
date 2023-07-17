import { User } from '@prisma/client';
import { create } from 'zustand';

interface QuickConnectStore {
  isOpen: boolean;
  foundUser: User | null;
  sessionId: string | null;
  onOpen: (user: User | null, sessionId: string, isLoading: boolean) => void;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useQuickConnect = create<QuickConnectStore>((set) => ({
  isOpen: false,
  foundUser: null,
  sessionId: null,
  isLoading: false,

  onOpen: (user, sessionId, isLoading) => {
    set({ isOpen: true, foundUser: user, sessionId, isLoading });
  },
  onClose: () => {
    set({ isOpen: false, foundUser: null, sessionId: null, isLoading: false });
  },
  setIsLoading: (isLoading) => {
    set({ isLoading });
  },
}));

export default useQuickConnect;
