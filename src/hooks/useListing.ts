import { create } from 'zustand';

interface UseListingStore {
    isOpen: boolean;
    listingId: string | null;
    listing: any;  
    sellerId: string | null; 
    seller: any; 
    onOpen: (id: string) => void;
    onClose: () => void;
    setListing: (listing: any) => void;  // Add this line
    setSeller: (seller: any) => void;  // Add this line
    
}

const useListing = create<UseListingStore>((set) => ({
    isOpen: false,
    listingId: null,
    listing: null,
    sellerId: null,
    seller: null,
    messages: [],
    onOpen: (id: string) => {
        set({ isOpen: true, listingId: id });
    },
    onClose: () => {
        set({ isOpen: false, listingId: null, listing: null });
    },
    setListing: (listing: any) => set({ listing }),
    setSeller: (seller: any) => set({ seller }),
    
}));

export default useListing;

  