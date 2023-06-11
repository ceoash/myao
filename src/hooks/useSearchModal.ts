import { create } from 'zustand';

interface SearchModalStore {
  isOpen: boolean;
  listingId: string | null;
  onOpen: (
    id: string,
    setSellerId: (newSellerId: string | null) => void,
    setStatus: (newStatus: string | null) => void
  ) => void;
  onClose: () => void;
}

const useSearchModal = create<SearchModalStore>((set) => ({
  isOpen: false,
  listingId: null,
  onOpen: (
    id: string,
    setSellerId: (newSellerId: string | null) => void,
    setStatus: (newStatus: string | null) => void
  ) => {
    set({ isOpen: true, listingId: id });
    setSellerId(null);
  },
  onClose: () => {
    set({ isOpen: false, listingId: null });
  },
}));

export default useSearchModal;
