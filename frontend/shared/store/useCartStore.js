import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const pendingDebounceTimers = new Map();
const pendingTargetQuantities = new Map();

const syncQuantityToBackend = (itemId, get, set) => {
  if (pendingDebounceTimers.has(itemId)) {
    clearTimeout(pendingDebounceTimers.get(itemId));
  }

  const timer = setTimeout(async () => {
    pendingDebounceTimers.delete(itemId);
    const targetQty = pendingTargetQuantities.get(itemId);
    if (targetQty == null) return;

    try {
      const res = await axiosInstance.put(`/cart/${itemId}`, { quantity: targetQty });
      // Only overwrite local cart if user hasn't made another change in the meantime
      if (!pendingTargetQuantities.has(itemId)) {
        set({ cartItems: formatCartItems(res.data) });
      } else {
        syncQuantityToBackend(itemId, get, set);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (!pendingTargetQuantities.has(itemId)) {
        await get().fetchCart();
      }
    } finally {
      if (!pendingDebounceTimers.has(itemId)) {
        pendingTargetQuantities.delete(itemId);
      }
    }
  }, 250);

  pendingDebounceTimers.set(itemId, timer);
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
        const existingItem = state.cartItems.find(item => isSameCartItem(item, product.id, size, color));
        if (existingItem) {
          return {
            cartItems: state.cartItems.map(item =>
              isSameCartItem(item, product.id, size, color)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
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
  removeFromCart: async (productId, size, color) => {
    const itemToRemove = get().cartItems.find(item => isSameCartItem(item, productId, size, color));
    if (itemToRemove?.itemId && pendingDebounceTimers.has(itemToRemove.itemId)) {
      clearTimeout(pendingDebounceTimers.get(itemToRemove.itemId));
      pendingDebounceTimers.delete(itemToRemove.itemId);
      pendingTargetQuantities.delete(itemToRemove.itemId);
    }
    
    if (USE_MOCK_DATA || !itemToRemove?.itemId) {
      set((state) => ({
        cartItems: state.cartItems.filter(item => !isSameCartItem(item, productId, size, color))
      }));
      return;
    }

    try {
      // Optimistic update
      set((state) => ({
        cartItems: state.cartItems.filter(item => !isSameCartItem(item, productId, size, color))
      }));
      const res = await axiosInstance.delete(`/cart/${itemToRemove.itemId}`);
      set({ cartItems: formatCartItems(res.data) });
    } catch (error) {
      console.error('Error removing from cart:', error);
      get().fetchCart(); // Revert on failure
    }
  },

  // 4. Update Quantity (direct value)
  updateQuantity: (productId, size, newQuantity, color) => {
    const itemToUpdate = get().cartItems.find(item => isSameCartItem(item, productId, size, color));
    if (!itemToUpdate) return;
    const normalizedQuantity = Math.max(1, Math.floor(Number(newQuantity) || 1));

    // Instant local state update
    set((state) => ({
      cartItems: state.cartItems.map(item =>
        isSameCartItem(item, productId, size, color)
          ? { ...item, quantity: normalizedQuantity }
          : item
      )
    }));

    if (USE_MOCK_DATA || !itemToUpdate.itemId) return;

    pendingTargetQuantities.set(itemToUpdate.itemId, normalizedQuantity);
    syncQuantityToBackend(itemToUpdate.itemId, get, set);
  },

  // Fast increment that always reads latest store value
  incrementQuantity: (productId, size, color) => {
    const itemToUpdate = get().cartItems.find(item => isSameCartItem(item, productId, size, color));
    if (!itemToUpdate) return;
    const nextQty = (Number(itemToUpdate.quantity) || 1) + 1;
    get().updateQuantity(productId, size, nextQty, color);
  },

  // Fast decrement that always reads latest store value
  decrementQuantity: (productId, size, color) => {
    const itemToUpdate = get().cartItems.find(item => isSameCartItem(item, productId, size, color));
    if (!itemToUpdate || itemToUpdate.quantity <= 1) return;
    const nextQty = Number(itemToUpdate.quantity) - 1;
    get().updateQuantity(productId, size, nextQty, color);
  },
  
  // 5. Clear Cart (After Checkout)
  clearCart: async () => {
    pendingDebounceTimers.forEach(t => clearTimeout(t));
    pendingDebounceTimers.clear();
    pendingTargetQuantities.clear();

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
