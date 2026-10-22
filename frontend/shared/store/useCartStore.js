import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const quantityUpdateQueues = new Map();

const isSameCartItem = (item, productId, size, color) =>
  item.id === productId && item.size === size && (!color || item.color === color);

// Helper to format backend cart into frontend state
const formatCartItems = (cartData) => {
  if (!cartData || !cartData.items) return [];
  return cartData.items.map(item => ({
    id: item.productId, // Map productId back to id for UI
    itemId: item.id, // The unique cartItem ID
    name: item.product.name,
    price: item.product.price,
    images: item.product.images?.length
      ? item.product.images
      : (item.product.coverPhoto ? [item.product.coverPhoto] : []),
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

  // 4. Update Quantity
  updateQuantity: async (productId, size, newQuantity, color) => {
    const itemToUpdate = get().cartItems.find(item => isSameCartItem(item, productId, size, color));
    const normalizedQuantity = Math.max(1, Math.floor(Number(newQuantity) || 1));

    if (USE_MOCK_DATA || !itemToUpdate?.itemId) {
      set((state) => ({
        cartItems: state.cartItems.map(item =>
          isSameCartItem(item, productId, size, color)
            ? { ...item, quantity: normalizedQuantity }
            : item
        )
      }));
      return;
    }

    set((state) => ({
      cartItems: state.cartItems.map(item =>
        isSameCartItem(item, productId, size, color)
          ? { ...item, quantity: normalizedQuantity }
          : item
      )
    }));

    const itemKey = itemToUpdate.itemId;
    const previousRequest = quantityUpdateQueues.get(itemKey) || Promise.resolve();
    const request = previousRequest
      .catch(() => {})
      .then(async () => {
        const res = await axiosInstance.put(`/cart/${itemKey}`, { quantity: normalizedQuantity });
        set({ cartItems: formatCartItems(res.data) });
      })
      .catch(async (error) => {
        console.error('Error updating quantity:', error);
        await get().fetchCart();
      })
      .finally(() => {
        if (quantityUpdateQueues.get(itemKey) === request) {
          quantityUpdateQueues.delete(itemKey);
        }
      });
    quantityUpdateQueues.set(itemKey, request);
    await request;
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
