import { create } from 'zustand';
import { User } from '@prisma/client';
import { CustomListing } from '@/interfaces/authenticated';

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
    listing: CustomListing | null,
    onOpen: (user?: any, participant?: any, conversationId?: string, listing?: CustomListing | null ) => void;
    onClose: () => void;
  }
  
  const useOfferModal = create<OfferModalStore>((set) => ({
    isOpen: false,
    user: null,
    participant: null,
    conversationId: null,
    listing: null,
    onOpen: (user?: any, participant?: any, conversationId?: string, listing?: CustomListing | null) =>
      set({ isOpen: true, user, participant, conversationId, listing }),
    onClose: () => set({ isOpen: false, user: null, participant: null, conversationId: null, listing: null}),
  }));
  

export default useOfferModal;