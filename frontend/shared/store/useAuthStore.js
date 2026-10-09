import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isCheckingAuth: true,
      isLoggingIn: false,
      isSigningUp: false,

      checkAuth: async () => {
        try {
          const res = await axiosInstance.get('/auth/check');
          set({ user: res.data, isAuthenticated: true });
        } catch (error) {
          console.log('Error checking auth:', error.message);
          // Only log out if it's explicitly an unauthorized or not found error
          if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
            sessionStorage.removeItem('hs_auth_token');
            set({ user: null, isAuthenticated: false });
          } else {
            // For network errors or 500s, assume the token is still valid if we were authenticated before
            // We don't remove the token so they can try again later
          }
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post('/auth/register', data);
          sessionStorage.setItem('hs_auth_token', res.data.token);
          set({ user: res.data, isAuthenticated: true });
          toast.success('Account created successfully!');
        } catch (error) {
          const msg = error.response?.data?.message || 'Something went wrong';
          toast.error(msg);
          throw error;
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post('/auth/login', data);
          sessionStorage.setItem('hs_auth_token', res.data.token);
          set({ user: res.data, isAuthenticated: true });
          toast.success('Welcome back!');
        } catch (error) {
          const msg = error.response?.data?.message || 'Invalid credentials';
          toast.error(msg);
          throw error;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.log('Error during logout API call', error);
        } finally {
          sessionStorage.removeItem('hs_auth_token');
          set({ user: null, isAuthenticated: false });
          toast.success('Logged out successfully');
        }
      }
    }),
    {
      name: 'hs_auth_store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of default localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
