/**
 * Centralized Environment & API Configuration
 *
 * Production-ready configuration that:
 * 1. Strongly types environment variables via Vite's `import.meta.env`.
 * 2. Sanitizes URLs (removes trailing slashes to prevent malformed double-slash endpoints).
 * 3. Prevents data leakage by avoiding hardcoded internal/cloud deployment URLs in client source code.
 * 4. Exposes canonical exports for API_BASE_URL, API_HOST_URL, and environment flags.
 */
/**
 * Normalizes and sanitizes a URL string by trimming whitespace and trailing slashes.
 */
const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string") {
        return "";
    }
    return url.trim().replace(/\/+$/, "");
};
/**
 * Resolved Base URL for backend API requests.
 *
 * - In all environments: Uses `VITE_API_URL` when provided via `.env` or deployment variables (e.g. Vercel, Netlify).
 * - In Local Development (`DEV`): Safely defaults to `http://localhost:5000/api`.
 * - In Production (`PROD`): If `VITE_API_URL` is not set, safely defaults to relative `/api` to avoid leaking internal hostnames.
 */
export const API_BASE_URL = (() => {
    const configuredUrl = sanitizeUrl(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL);
    if (configuredUrl) {
        return configuredUrl;
    }
    return "/api";
})();
/**
 * Root Backend Host URL (with `/api` stripped).
 * Used for resolving backend uploaded assets (e.g., `/uploads/products/image.png`).
 */
export const API_HOST_URL = (() => {
    return API_BASE_URL.replace(/\/api$/, "");
})();
/**
 * Compile-time flag indicating if the application is running in production mode.
 */
export const IS_PRODUCTION = import.meta.env.PROD;
/**
 * Compile-time flag indicating if the application is running in development mode.
 */
export const IS_DEVELOPMENT = import.meta.env.DEV;
