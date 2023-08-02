import { create } from "zustand";

interface SearchComponentModal {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useSearchComponentModal = create<SearchComponentModal>((set) => ({
    isOpen: false,
    onOpen: () => {
      set({ isOpen: true, });
    },
    onClose: () => {
      set({ isOpen: false });
    },
}));

export default useSearchComponentModal;
