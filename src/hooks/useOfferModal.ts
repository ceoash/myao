import { create } from 'zustand';

interface OfferModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useOfferModal = create<OfferModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
 }));

export default useOfferModal;