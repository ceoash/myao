import { create } from 'zustand';

interface UseListingStore {
    isOpen: boolean;
    listingId: string | null;
    listing: any;  
    recipientId: string | null; 
    recipient: any; 
    onOpen: (id: string) => void;
    onClose: () => void;
    setListing: (listing: any) => void;  // Add this line
    setRecipient: (recipient: any) => void;  // Add this line
    
}

const useListing = create<UseListingStore>((set) => ({
    isOpen: false,
    listingId: null,
    listing: null,
    recipientId: null,
    recipient: null,
    messages: [],
    onOpen: (id: string) => {
        set({ isOpen: true, listingId: id });
    },
    onClose: () => {
        set({ isOpen: false, listingId: null, listing: null });
    },
    setListing: (listing: any) => set({ listing }),
    setRecipient: (recipient: any) => set({ recipient }),
    
}));

export default useListing;

  