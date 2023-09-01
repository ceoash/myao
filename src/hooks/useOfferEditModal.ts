import { create } from 'zustand';
import { User } from '@prisma/client';
import { CustomListing, OfferModalStore } from '@/interfaces/authenticated';


  
  const useOfferEditModal = create<OfferModalStore>((set) => ({
    isOpen: false,
    user: null,
    listing: null,
    section: null,
    data: null,
    onOpen: (user?: any, listing?: CustomListing, section?: string, data?: any) =>
      set({ isOpen: true, user, listing, section, data }),
    onClose: () => set({ isOpen: false, user: null, listing: null, data: null }),
  }));
  

export default useOfferEditModal;