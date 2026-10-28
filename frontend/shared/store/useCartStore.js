import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const pendingDebounceTimers = new Map();
const pendingTargetQuantities = new Map();

// Helper to reliably compare cart items across sizes, colors, and productId
export const isSameCartItem = (item, productId, size, color) => {
  if (!item) return false;
  const matchId = String(item.id) === String(productId) || (item.itemId && String(item.itemId) === String(productId));
  const matchSize = String(item.size || '').toLowerCase() === String(size || '').toLowerCase();
  const itemColor = String(item.color || 'Default').toLowerCase();
  const targetColor = String(color || 'Default').toLowerCase();
  const matchColor = !color || itemColor === targetColor;
  return matchId && matchSize && matchColor;
};

// Helper to format backend cart into frontend state
export const formatCartItems = (cartData) => {
  if (!cartData || !Array.isArray(cartData.items)) return [];
  return cartData.items.map((item) => {
    const product = item.product || {};
    const cover = product.coverPhoto || '';
    const imgList = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (cover ? [cover] : ['https://via.placeholder.com/300']);

    return {
      id: item.productId, // Map productId back to id for UI
      itemId: item.id, // The unique cartItem ID
      name: product.name || 'Product',
      category: product.category || item.category || 'T-Shirts',
      price: typeof product.price === 'number' ? product.price : (Number(product.price) || 0),
      images: imgList,
      coverPhoto: cover,
      size: item.size || 'Standard',
      color: item.color || 'Default',
      quantity: Math.max(1, Number(item.quantity) || 1),
    };
  });
};

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
      if (!pendingTargetQuantities.has(itemId) && res.data) {
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
      if (res.data) {
        set({ cartItems: formatCartItems(res.data), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      set({ isLoading: false });
    }
  },

  // 2. Add to Cart
  addToCart: async (product, size, quantity = 1, color = 'Default') => {
    set({ isCartOpen: true });
    const targetSize = size || 'Standard';
    const targetColor = color || 'Default';
    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Optimistic local update first for instant responsiveness
    set((state) => {
      const existingItem = state.cartItems.find(item => isSameCartItem(item, product.id, targetSize, targetColor));
      if (existingItem) {
        return {
          cartItems: state.cartItems.map(item =>
            isSameCartItem(item, product.id, targetSize, targetColor)
              ? { ...item, quantity: item.quantity + parsedQty }
              : item
          )
        };
      }
      const cover = product.coverPhoto || '';
      const imgList = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (cover ? [cover] : ['https://via.placeholder.com/300']);

      return {
        cartItems: [
          ...state.cartItems,
          {
            id: product.id,
            itemId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: product.name || 'Product',
            category: product.category || 'T-Shirts',
            price: typeof product.price === 'number' ? product.price : (Number(product.price) || 0),
            images: imgList,
            coverPhoto: cover,
            size: targetSize,
            color: targetColor,
            quantity: parsedQty
          }
        ]
      };
    });

    if (USE_MOCK_DATA) return;

    try {
      const res = await axiosInstance.post('/cart', {
        productId: product.id,
        size: targetSize,
        color: targetColor,
        quantity: parsedQty
      });
      if (res.data) {
        set({ cartItems: formatCartItems(res.data) });
      }
    } catch (error) {
      console.error('Error syncing add-to-cart to backend:', error);
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
    
    // Optimistic update
    set((state) => ({
      cartItems: state.cartItems.filter(item => !isSameCartItem(item, productId, size, color))
    }));

    if (USE_MOCK_DATA || !itemToRemove?.itemId || String(itemToRemove.itemId).startsWith('local-')) {
      return;
    }

    try {
      const res = await axiosInstance.delete(`/cart/${itemToRemove.itemId}`);
      if (res.data) {
        set({ cartItems: formatCartItems(res.data) });
      }
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

    if (USE_MOCK_DATA || !itemToUpdate.itemId || String(itemToUpdate.itemId).startsWith('local-')) return;

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

    set({ cartItems: [] });

    if (USE_MOCK_DATA) return;

    try {
      await axiosInstance.delete('/cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // 6. Reset local cart state (on user logout)
  resetCart: () => {
    pendingDebounceTimers.forEach(t => clearTimeout(t));
    pendingDebounceTimers.clear();
    pendingTargetQuantities.clear();
    set({ cartItems: [] });
  }
}));
