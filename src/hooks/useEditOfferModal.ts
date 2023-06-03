import { create } from 'zustand';

interface EditOfferModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useEditOfferModal = create<EditOfferModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
 }));

export default useEditOfferModal;