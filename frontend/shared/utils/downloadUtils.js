/**
 * Utility functions for client-side file downloads.
 */
/**
 * Sanitizes a file name by stripping path traversal sequences, illegal characters, and control characters.
 */
export const sanitizeFileName = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
        return 'download';
    }
    // Remove control characters, quotes, and invalid path characters
    const sanitized = fileName
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/[\x00-\x1f\x80-\x9f]/g, '')
        .trim();
    return sanitized.length > 0 ? sanitized : 'download';
};
/**
 * Triggers a browser download using a temporary anchor element.
 * Safe to call in SSR or headless testing environments.
 *
 * @param url The URL or Data URI of the file to download
 * @param fileName The default file name for the downloaded file
 */
export const triggerFileDownload = (url, fileName) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }
    if (!url || typeof url !== 'string') {
        console.warn('[downloadUtils] Cannot trigger download: invalid or empty URL.');
        return;
    }
    const safeFileName = sanitizeFileName(fileName);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
/**
 * Attempts to download a file from one or more candidate URLs via fetch + blob,
 * falling back to a direct download or a data URI if network fetch fails.
 *
 * @param candidateUrls List of URLs to attempt fetching
 * @param fallbackUrlOrDataUri URL or Base64 Data URI to use if fetch fails
 * @param fileName Desired file name for the download
 */
export const downloadFileWithFallback = async (candidateUrls = [], fallbackUrlOrDataUri = '', fileName = 'download') => {
    if (typeof window === 'undefined') {
        return;
    }
    const safeCandidateUrls = Array.isArray(candidateUrls) ? candidateUrls.filter(Boolean) : [];
    const safeFileName = sanitizeFileName(fileName);
    for (const url of safeCandidateUrls) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                triggerFileDownload(blobUrl, safeFileName);
                setTimeout(() => {
                    try {
                        window.URL.revokeObjectURL(blobUrl);
                    }
                    catch {
                        // ignore cleanup error if already revoked
                    }
                }, 3000);
                return;
            }
        }
        catch (error) {
            console.warn(`[downloadUtils] Failed to fetch download asset from ${url}:`, error);
        }
    }
    // Fallback if candidate URLs failed or were empty
    if (fallbackUrlOrDataUri && typeof fallbackUrlOrDataUri === 'string') {
        triggerFileDownload(fallbackUrlOrDataUri, safeFileName);
    }
    else {
        console.warn('[downloadUtils] All candidate URLs failed and no fallback URL was provided.');
    }
};
