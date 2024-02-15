import { create } from 'zustand';
import { CustomListing, OfferModalStore } from '@/interfaces/authenticated';

const useOfferEditModal = create<OfferModalStore>((set) => ({
  isOpen: false,
  user: null,
  listing: null,
  section: null,
  data: null,
  setListing: undefined, // Initialize setListing as undefined
  onOpen: (user?: any, listing?: CustomListing, section?: string, data?: any, setListing?: (listing: CustomListing) => void) =>
    set({ isOpen: true, user, listing, section, data, setListing }),
  onClose: () => set({ isOpen: false, user: null, listing: null, section: null, data: null, setListing: undefined }), // Reset setListing on close
}));
  

export default useOfferEditModal;