import { create } from "zustand";

interface QRModal {
    isOpen: boolean;
    username: string;
    image: string;
    onOpen: (
        username: string,
        image: string
    ) => void;
    onClose: () => void;

}

const useQRModal = create<QRModal>((set) => ({
    isOpen: false,
    username: '',
    image: '',
    onOpen: () => {
      set({ isOpen: true, username: '', image: '' });
    },
    onClose: () => {
      set({ isOpen: false, username: '', image: '' });
    },
}));

export default useQRModal;
