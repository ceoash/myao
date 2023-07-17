import { create } from 'zustand';
import { User } from '@prisma/client';

interface Profile {
    image?: string;
  }
interface UserStore extends User {
  profile?: Profile;  
}
interface OfferModalStore {
    isOpen: boolean;
    user?: User | null;
    participant?: UserStore | null;
    conversationId?: string | null;
    onOpen: (user?: any, participant?: any, conversationId?: string) => void;
    onClose: () => void;
  }
  
  const useOfferModal = create<OfferModalStore>((set) => ({
    isOpen: false,
    user: null,
    participant: null,
    conversationId: null,
    onOpen: (user?: any, participant?: any, conversationId?: string) =>
      set({ isOpen: true, user, participant, conversationId }),
    onClose: () => set({ isOpen: false, user: null, participant: null }),
  }));
  

export default useOfferModal;