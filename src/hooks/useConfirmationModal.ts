import { create } from "zustand";

interface ConfirmationModal {
    isOpen: boolean;
    confirmAction: (() => void) | null;
    text: string;
    onOpen: (text: string, confirmAction: () => void) => void;
    onClose: () => void;
}

const useConfirmationModal = create<ConfirmationModal>((set) => ({
    isOpen: false,
    confirmAction: null,
    text: "",
    onOpen: (text: string, confirmAction: () => void) => {
      set({ isOpen: true, confirmAction, text });
    },
    onClose: () => {
      set({ isOpen: false, confirmAction: null, text: "" });
    },
}));

export default useConfirmationModal;
