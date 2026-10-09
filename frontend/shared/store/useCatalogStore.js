import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { mockProducts, mockDrops } from '../../data/mockCatalog';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const useCatalogStore = create((set, get) => ({
  products: [],
  drops: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      if (USE_MOCK_DATA) {
        set({ categories: ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Shorts', 'Sweatpants'] });
      } else {
        const res = await axiosInstance.get('/catalogue/categories');
        set({ categories: res.data });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filtered = [...mockProducts];
        if (filters.category && filters.category !== 'All Categories') {
          filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.isBestSeller) {
          filtered = filtered.filter(p => p.isBestSeller);
        }
        
        set({ products: filtered, isLoading: false });
      } else {
        const queryParams = new URLSearchParams(filters).toString();
        const res = await axiosInstance.get(`/catalogue/products?${queryParams}`);
        set({ products: res.data, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDrops: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ drops: mockDrops, isLoading: false });
      } else {
        const res = await axiosInstance.get('/catalogue/drops');
        set({ drops: res.data, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  getProductById: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts.find(p => p.id === id);
    } else {
      const res = await axiosInstance.get(`/catalogue/products/${id}`);
      return res.data;
    }
  }
}));
