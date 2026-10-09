const STORAGE_KEYS = {
    admin: {
        token: "admin_authToken",
        user: "admin_authUser"
    },
    manufacturer: {
        token: "mfg_authToken",
        user: "mfg_authUser"
    },
    legacy: {
        token: "authToken",
        tokenAlt: "token",
        user: "authUser"
    }
};
/**
 * Detect the active portal type from the current browser location.
 */
export const getCurrentPortal = () => {
    if (typeof window === "undefined")
        return "admin";
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/manufacturer") || path.includes("/login/manufacturer")) {
        return "manufacturer";
    }
    return "admin";
};
/**
 * Retrieve the active authentication token for the target portal (or current portal if unspecified).
 */
export const getPortalToken = (portal) => {
    if (typeof window === "undefined")
        return "";
    const targetPortal = portal || getCurrentPortal();
    const key = STORAGE_KEYS[targetPortal].token;
    // 1. Check scoped storage (localStorage then sessionStorage)
    const scopedToken = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (scopedToken)
        return scopedToken;
    // 2. Fallback to legacy keys if the legacy user role matches this portal
    const legacyUser = getLegacyUser();
    if (legacyUser && isRoleMatchingPortal(legacyUser.role, targetPortal)) {
        const legacyToken = localStorage.getItem(STORAGE_KEYS.legacy.token) ||
            localStorage.getItem(STORAGE_KEYS.legacy.tokenAlt) ||
            sessionStorage.getItem(STORAGE_KEYS.legacy.token) ||
            sessionStorage.getItem(STORAGE_KEYS.legacy.tokenAlt);
        if (legacyToken)
            return legacyToken;
    }
    return "";
};
/**
 * Retrieve the active authentication user profile for the target portal.
 */
export const getPortalUser = (portal) => {
    if (typeof window === "undefined")
        return null;
    const targetPortal = portal || getCurrentPortal();
    const key = STORAGE_KEYS[targetPortal].user;
    // 1. Check scoped storage
    const scopedRaw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (scopedRaw) {
        try {
            return JSON.parse(scopedRaw);
        }
        catch {
            // Ignore parse error
        }
    }
    // 2. Fallback to legacy user if role matches
    const legacyUser = getLegacyUser();
    if (legacyUser && isRoleMatchingPortal(legacyUser.role, targetPortal)) {
        return legacyUser;
    }
    return null;
};
/**
 * Save authentication session for a specific portal without clobbering the other portal.
 */
export const setPortalSession = (portal, token, user, rememberMe = true) => {
    if (typeof window === "undefined")
        return;
    const keys = STORAGE_KEYS[portal];
    const userStr = JSON.stringify(user);
    if (rememberMe) {
        localStorage.setItem(keys.token, token);
        localStorage.setItem(keys.user, userStr);
        sessionStorage.removeItem(keys.token);
        sessionStorage.removeItem(keys.user);
        // Synchronize legacy keys for active portal
        localStorage.setItem(STORAGE_KEYS.legacy.token, token);
        localStorage.setItem(STORAGE_KEYS.legacy.tokenAlt, token);
        localStorage.setItem(STORAGE_KEYS.legacy.user, userStr);
    }
    else {
        sessionStorage.setItem(keys.token, token);
        sessionStorage.setItem(keys.user, userStr);
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.user);
        sessionStorage.setItem(STORAGE_KEYS.legacy.token, token);
        sessionStorage.setItem(STORAGE_KEYS.legacy.tokenAlt, token);
        sessionStorage.setItem(STORAGE_KEYS.legacy.user, userStr);
    }
};
/**
 * Clear the authentication session for a specific portal.
 */
export const clearPortalSession = (portal) => {
    if (typeof window === "undefined")
        return;
    const targetPortal = portal || getCurrentPortal();
    const keys = STORAGE_KEYS[targetPortal];
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
    sessionStorage.removeItem(keys.token);
    sessionStorage.removeItem(keys.user);
    // If the legacy storage belongs to this portal, clear legacy too
    const legacyUser = getLegacyUser();
    if (!legacyUser || isRoleMatchingPortal(legacyUser.role, targetPortal)) {
        localStorage.removeItem(STORAGE_KEYS.legacy.token);
        localStorage.removeItem(STORAGE_KEYS.legacy.tokenAlt);
        localStorage.removeItem(STORAGE_KEYS.legacy.user);
        sessionStorage.removeItem(STORAGE_KEYS.legacy.token);
        sessionStorage.removeItem(STORAGE_KEYS.legacy.tokenAlt);
        sessionStorage.removeItem(STORAGE_KEYS.legacy.user);
    }
};
/**
 * Clear all authentication sessions across all portals.
 */
export const clearAllSessions = () => {
    if (typeof window === "undefined")
        return;
    clearPortalSession("admin");
    clearPortalSession("manufacturer");
};
/**
 * Validate whether a user's role satisfies the required allowed roles.
 */
export const isUserInRole = (user, allowedRoles) => {
    if (!user || !user.role)
        return false;
    if (!allowedRoles || allowedRoles.length === 0)
        return true;
    const normalizedUserRole = user.role.trim().toUpperCase();
    return allowedRoles.some((role) => role.trim().toUpperCase() === normalizedUserRole);
};
// Helper: read legacy user from storage
const getLegacyUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.legacy.user) ||
            sessionStorage.getItem(STORAGE_KEYS.legacy.user);
        if (raw)
            return JSON.parse(raw);
    }
    catch {
        // Ignore parse error
    }
    return null;
};
// Helper: determine if a role string matches a portal
const isRoleMatchingPortal = (role, portal) => {
    const r = (role || "").toUpperCase();
    if (portal === "admin") {
        return r === "ADMIN" || r === "ADMINISTRATOR";
    }
    if (portal === "manufacturer") {
        return r === "MANUFACTURER";
    }
    return false;
};
