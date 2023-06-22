import { create } from 'zustand';

interface DeleteConfirmationModal {
    isOpen: boolean;
    listingId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
  }
  
  const useDeleteConfirmationModal = create<DeleteConfirmationModal>((set) => ({
    isOpen: false,
    listingId: null,
    onOpen: (id: string) => {
      set({ isOpen: true, listingId: id });
      return;  // Ensure the function returns void
    },
    onClose: () => {
      set({ isOpen: false, listingId: null });
      return;  // Ensure the function returns void
    },
  }));

  
  
  export default useDeleteConfirmationModal;
  
