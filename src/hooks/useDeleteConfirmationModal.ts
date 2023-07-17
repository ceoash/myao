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
      return;  
    },
    onClose: () => {
      set({ isOpen: false, listingId: null });
      return;  
    },
  }));

  
  
  export default useDeleteConfirmationModal;
  
