import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { getPortalToken, clearPortalSession, getCurrentPortal } from './authStorage';
/**
 * Retrieve the active authentication token from client storage based on the active portal context.
 */
export const getAuthToken = () => {
    return getPortalToken();
};
/**
 * Clear stored auth tokens upon session invalidation / logout for the active portal.
 */
export const clearAuthTokens = () => {
    clearPortalSession(getCurrentPortal());
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
};
// Create configured Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});
// Request interceptor: attach Bearer token automatically
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.url && config.url.startsWith('/api/') && config.baseURL && config.baseURL.endsWith('/api')) {
        config.url = config.url.replace(/^\/api/, '');
    }
    return config;
}, (error) => Promise.reject(error));
// Response interceptor: handle 401 Unauthorized, 403 Forbidden, and standard errors
axiosInstance.interceptors.response.use((response) => response, (error) => {
    const status = error.response?.status || 500;
    const responseData = error.response?.data;
    const message = responseData?.message ||
        (typeof responseData === 'string' ? responseData : null) ||
        error.message ||
        'An unexpected network error occurred';
    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname.toLowerCase();
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
        // Handle 401 Unauthorized (Stale / Expired session)
        if (status === 401 && !isAuthPage) {
            clearAuthTokens();
            window.dispatchEvent(new CustomEvent('auth:unauthorized', {
                detail: { message: message || 'Session expired. Please log in again.' }
            }));
        }
        // Handle 403 Forbidden (Privilege mismatch / Unauthorized access)
        if (status === 403 && !isAuthPage) {
            window.dispatchEvent(new CustomEvent('auth:forbidden', {
                detail: {
                    message: message || 'Access denied. You do not have permission for this resource.',
                    portal: getCurrentPortal()
                }
            }));
        }
    }
    const formattedError = {
        message,
        status,
        errors: responseData?.errors
    };
    return Promise.reject(formattedError);
});
// Type-safe HTTP helpers
export const apiClient = {
    instance: axiosInstance,
    async get(url, config) {
        const response = await axiosInstance.get(url, config);
        return response.data;
    },
    async post(url, data, config) {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    },
    async put(url, data, config) {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    },
    async patch(url, data, config) {
        const response = await axiosInstance.patch(url, data, config);
        return response.data;
    },
    async delete(url, config) {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    },
    getToken() {
        return getAuthToken();
    }
};
export default apiClient;
