import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  // 1. Fetch Wishlist on Login/App Load
  fetchWishlist: async () => {
    if (USE_MOCK_DATA) return;
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/wishlist');
      set({ wishlistItems: res.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      set({ isLoading: false });
    }
  },
  
  // 2. Toggle Wishlist (Add/Remove)
  toggleWishlist: async (product) => {
    const isSaved = get().wishlistItems.some(item => item.id === product.id);
    
    // Optimistic UI Update
    set((state) => {
      if (isSaved) {
        return { wishlistItems: state.wishlistItems.filter(item => item.id !== product.id) };
      } else {
        return { wishlistItems: [...state.wishlistItems, product] };
      }
    });

    if (USE_MOCK_DATA) return;

    try {
      // Send to server
      const res = await axiosInstance.post('/wishlist', { productId: product.id });
      // Sync with server's source of truth just to be safe
      set({ wishlistItems: res.data });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Revert Optimistic Update on failure
      get().fetchWishlist(); 
    }
  },
}));
