import { User } from '@prisma/client';
import create from 'zustand';

interface UserStore {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const useUserStore = create<UserStore>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));

export default useUserStore;