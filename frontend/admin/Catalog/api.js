import { DropStatus } from "./types";
import apiClient from "../../shared/services/apiClient";
import { API_BASE_URL } from "../../shared/config/apiConfig";
// ==========================================
// 1. GET CATALOG SUMMARY (GET /api/catalogue/summary or computed)
// ==========================================
export const getCatalogSummary = async (cachedDrops) => {
    try {
        const summary = await apiClient.get("/catalogue/summary");
        if (summary && typeof summary.totalDrops === "number") {
            return summary;
        }
    }
    catch (error) {
        console.warn("Failed to fetch summary endpoint directly; computing from drops data.", error);
    }
    // Fallback: Compute summary directly from drops data without duplicate network calls
    const drops = cachedDrops || await getDrops();
    const allProducts = drops.flatMap(d => d.products || []);
    return {
        totalDrops: drops.length,
        totalProducts: allProducts.length,
        liveProducts: allProducts.filter(p => p.inStock).length,
        draftProducts: allProducts.filter(p => !p.inStock).length
    };
};
// ==========================================
// 2. GET ALL DROPS (GET /api/catalogue/drops)
// ==========================================
export const getDrops = async () => {
    const data = await apiClient.get("/catalogue/drops");
    return (Array.isArray(data) ? data : []).map((d) => ({
        id: d.id,
        dropName: d.dropName || d.title || "Untitled Drop",
        status: d.status || (d.isActive ? DropStatus.LIVE : DropStatus.DRAFT),
        createdAt: d.createdAt || d.releaseDate || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        products: d.products || []
    }));
};
// ==========================================
// 3. GET DROP BY ID (GET /api/catalogue/drops/:id)
// ==========================================
export const getDropById = async (id) => {
    const d = await apiClient.get(`/catalogue/drops/${id}`);
    return {
        id: d.id,
        dropName: d.dropName || d.title || "Untitled Drop",
        status: d.status || (d.isActive ? DropStatus.LIVE : DropStatus.DRAFT),
        createdAt: d.createdAt || d.releaseDate || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        products: d.products || []
    };
};
// ==========================================
// 4. CREATE DROP (POST /api/catalogue/drops)
// ==========================================
export const createDrop = async (dropInput, optionalStatus) => {
    const dropName = typeof dropInput === "string" ? dropInput : dropInput.dropName;
    const releaseDate = typeof dropInput === "object" ? dropInput.releaseDate : undefined;
    const status = (typeof dropInput === "object" ? dropInput.status : optionalStatus) || DropStatus.DRAFT;
    const payload = {
        dropName,
        title: dropName,
        status,
        isActive: status === DropStatus.LIVE,
        releaseDate: releaseDate || new Date().toISOString()
    };
    const d = await apiClient.post("/catalogue/drops", payload);
    return {
        id: d.id,
        dropName: d.dropName || d.title || dropName,
        status: d.status || (d.isActive ? DropStatus.LIVE : DropStatus.DRAFT),
        createdAt: d.createdAt || d.releaseDate || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        products: d.products || []
    };
};
// ==========================================
// 5. UPDATE DROP (PUT /api/catalogue/drops/:id)
// ==========================================
export const updateDrop = async (id, updates) => {
    const payload = { ...updates };
    if (updates.dropName)
        payload.title = updates.dropName;
    if (updates.status)
        payload.isActive = updates.status === DropStatus.LIVE;
    const d = await apiClient.put(`/catalogue/drops/${id}`, payload);
    return {
        id: d.id,
        dropName: d.dropName || d.title || updates.dropName || "Updated Drop",
        status: d.status || (d.isActive ? DropStatus.LIVE : DropStatus.DRAFT),
        createdAt: d.createdAt || d.releaseDate || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        products: d.products || updates.products || []
    };
};
// ==========================================
// 6. UPDATE DROP STATUS (PATCH /api/catalogue/drops/:id/status)
// ==========================================
export const updateDropStatus = async (id, status) => {
    return await updateDrop(id, { status });
};
// ==========================================
// 7. DELETE DROP (DELETE /api/catalogue/drops/:id)
// ==========================================
export const deleteDrop = async (id) => {
    await apiClient.delete(`/catalogue/drops/${id}`);
    return true;
};
// ==========================================
// 8. GET ALL PRODUCTS (GET /api/catalogue/products)
// ==========================================
export const getProducts = async (params) => {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== "All Categories")
        queryParams.append("category", params.category);
    if (params?.isBestSeller !== undefined)
        queryParams.append("isBestSeller", String(params.isBestSeller));
    if (params?.dropId)
        queryParams.append("dropId", params.dropId);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const res = await apiClient.get(`/catalogue/products${queryString}`);
    if (Array.isArray(res))
        return res;
    if (Array.isArray(res?.products))
        return res.products;
    if (Array.isArray(res?.data))
        return res.data;
    return [];
};
// ==========================================
// 9. GET PRODUCT BY ID (GET /api/catalogue/products/:productId)
// ==========================================
export const getProductById = async (productId) => {
    return await apiClient.get(`/catalogue/products/${productId}`);
};
// ==========================================
// 10. CREATE PRODUCT (POST /api/catalogue/drops/:dropId/products)
// ==========================================
export const createProduct = async (dropId, product) => {
    const payload = {
        ...product,
        dropId
    };
    return await apiClient.post(`/catalogue/drops/${dropId}/products`, payload);
};
// ==========================================
// 11. UPDATE PRODUCT (PUT /api/catalogue/products/:productId)
// ==========================================
export const updateProduct = async (productId, updates) => {
    return await apiClient.put(`/catalogue/products/${productId}`, updates);
};
// ==========================================
// 12. TOGGLE PRODUCT STOCK STATUS (PATCH /api/catalogue/products/:productId/stock)
// ==========================================
export const toggleProductStock = async (productId, inStock) => {
    return await updateProduct(productId, { inStock });
};
// ==========================================
// 13. DELETE PRODUCT (DELETE /api/catalogue/products/:productId)
// ==========================================
export const deleteProduct = async (productId) => {
    await apiClient.delete(`/catalogue/products/${productId}`);
    return true;
};
// ==========================================
// 14. UPLOAD PRODUCT IMAGE / DESIGN FILE (POST /api/catalogue/upload)
// ==========================================
export const uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = apiClient.getToken();
    const headers = {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    const response = await fetch(`${API_BASE_URL}/catalogue/upload`, {
        method: "POST",
        headers,
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload image to server.");
    }
    return await response.json();
};
// ==========================================
// 15. GET CATALOG CATEGORIES (GET /api/catalogue/categories)
// ==========================================
export const getCatalogCategories = async () => {
    const data = await apiClient.get("/catalogue/categories?format=names");
    return Array.isArray(data) ? data : [];
};
// ==========================================
// 16. GET PRINT TYPES (GET /api/catalogue/print-types)
// ==========================================
export const getPrintTypes = async () => {
    const data = await apiClient.get("/catalogue/print-types");
    return Array.isArray(data) ? data : [];
};
// ==========================================
// 17. GET PRINT POSITIONS (GET /api/catalogue/print-positions)
// ==========================================
export const getPrintPositions = async () => {
    const data = await apiClient.get("/catalogue/print-positions");
    return Array.isArray(data) ? data : [];
};
