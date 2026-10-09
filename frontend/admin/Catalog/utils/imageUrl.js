import { API_HOST_URL } from "../../../shared/config/apiConfig";
/**
 * Utility to resolve full image URLs for frontend display & previewing.
 * Converts relative static paths (/uploads/...) to full backend URLs (e.g. http://localhost:5000/uploads/...).
 */
export const getImageUrl = (url) => {
    if (!url || typeof url !== "string")
        return "";
    // If it's already a base64 Data URI or absolute HTTP/HTTPS URL, return as is
    if (url.startsWith("data:") ||
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("//") ||
        url.startsWith("blob:")) {
        return url;
    }
    // If it starts with /uploads/ or uploads/, prefix with Backend API host
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${API_HOST_URL}${cleanPath}`;
};
