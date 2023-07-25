import { create } from "zustand";

interface QRModal {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useQRModal = create<QRModal>((set) => ({
    isOpen: false,
    onOpen: () => {
      set({ isOpen: true, });
    },
    onClose: () => {
      set({ isOpen: false });
    },
}));

export default useQRModal;
