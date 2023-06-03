import { create } from 'zustand';

interface SearchModalStore {
    isOpen: boolean;
    listingId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
  }
  
  const useSearchModal = create<SearchModalStore>((set) => ({
    isOpen: false,
    listingId: null,
    onOpen: (id: string) => {
      set({ isOpen: true, listingId: id });
      console.log("id", id);
      return;  // Ensure the function returns void
    },
    onClose: () => {
      set({ isOpen: false, listingId: null });
      return;  // Ensure the function returns void
    },
  }));

  
  
  export default useSearchModal;
  
