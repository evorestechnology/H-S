import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Helper to format backend cart into frontend state
const formatCartItems = (cartData) => {
  if (!cartData || !cartData.items) return [];
  return cartData.items.map(item => ({
    id: item.productId, // Map productId back to id for UI
    itemId: item.id, // The unique cartItem ID
    name: item.product.name,
    price: item.product.price,
    images: item.product.images || [],
    size: item.size,
    color: item.color || 'Default',
    quantity: item.quantity,
  }));
};

export const useCartStore = create((set, get) => ({
  cartItems: [],
  isCartOpen: false,
  isLoading: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // 1. Fetch Cart on Login/App Load
  fetchCart: async () => {
    if (USE_MOCK_DATA) return;
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/cart');
      set({ cartItems: formatCartItems(res.data), isLoading: false });
    } catch (error) {
      console.error('Error fetching cart:', error);
      set({ isLoading: false });
    }
  },

  // 2. Add to Cart
  addToCart: async (product, size, quantity = 1, color = 'Default') => {
    set({ isCartOpen: true });
    if (USE_MOCK_DATA) {
      set((state) => {
        const existingItem = state.cartItems.find(item => item.id === product.id && item.size === size);
        if (existingItem) {
          return { cartItems: state.cartItems.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + quantity } : item) };
        }
        return { cartItems: [...state.cartItems, { ...product, size, color, quantity }] };
      });
      return;
    }

    try {
      const res = await axiosInstance.post('/cart', {
        productId: product.id,
        size,
        color,
        quantity
      });
      set({ cartItems: formatCartItems(res.data) });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  },

  // 3. Remove from Cart
  removeFromCart: async (productId, size) => {
    const itemToRemove = get().cartItems.find(item => item.id === productId && item.size === size);
    
    if (USE_MOCK_DATA || !itemToRemove?.itemId) {
      set((state) => ({
        cartItems: state.cartItems.filter(item => !(item.id === productId && item.size === size))
      }));
      return;
    }

    try {
      // Optimistic update
      set((state) => ({
        cartItems: state.cartItems.filter(item => !(item.id === productId && item.size === size))
      }));
      const res = await axiosInstance.delete(`/cart/${itemToRemove.itemId}`);
      set({ cartItems: formatCartItems(res.data) });
    } catch (error) {
      console.error('Error removing from cart:', error);
      get().fetchCart(); // Revert on failure
    }
  },

  // 4. Update Quantity
  updateQuantity: async (productId, size, newQuantity) => {
    const itemToUpdate = get().cartItems.find(item => item.id === productId && item.size === size);

    if (USE_MOCK_DATA || !itemToUpdate?.itemId) {
      set((state) => ({
        cartItems: state.cartItems.map(item =>
          item.id === productId && item.size === size ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      }));
      return;
    }

    try {
      // Optimistic update
      set((state) => ({
        cartItems: state.cartItems.map(item =>
          item.id === productId && item.size === size ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      }));
      const res = await axiosInstance.put(`/cart/${itemToUpdate.itemId}`, { quantity: newQuantity });
      set({ cartItems: formatCartItems(res.data) });
    } catch (error) {
      console.error('Error updating quantity:', error);
      get().fetchCart(); // Revert on failure
    }
  },
  
  // 5. Clear Cart (After Checkout)
  clearCart: async () => {
    if (USE_MOCK_DATA) {
      set({ cartItems: [] });
      return;
    }

    try {
      set({ cartItems: [] });
      await axiosInstance.delete('/cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
}));
