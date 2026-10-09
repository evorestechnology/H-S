import apiClient from "../../shared/services/apiClient";
// Deprecated stubs to avoid breaking imports
export const getStoredTransactions = () => [];
// ==========================================
// 1. GET ADMIN WALLET METRICS (GET /api/wallet/admin/metrics)
// ==========================================
export const getAdminWalletMetrics = async () => {
    const json = await apiClient.get("/wallet/admin/metrics");
    return json.data || json;
};
// ==========================================
// 2. GET ADMIN WALLET TRANSACTIONS (GET /api/wallet/admin/transactions)
// ==========================================
export const getAdminWalletTransactions = async () => {
    const json = await apiClient.get("/wallet/admin/transactions");
    return Array.isArray(json) ? json : (json.data || json.transactions || []);
};
// ==========================================
// 3. MARK TRANSACTION AS PAID (POST /api/wallet/admin/transactions/:id/pay)
// ==========================================
export const markTransactionAsPaid = async (txnId) => {
    const json = await apiClient.post(`/wallet/admin/transactions/${txnId}/pay`);
    return Array.isArray(json) ? json : (json.data || json.transactions || []);
};
// ==========================================
// 4. TOGGLE TRANSACTION PRICE ADJUSTMENT (POST /api/wallet/admin/transactions/:id/toggle-adjustment)
// ==========================================
export const toggleTransactionAdjustment = async (txnId) => {
    const json = await apiClient.post(`/wallet/admin/transactions/${txnId}/toggle-adjustment`);
    return Array.isArray(json) ? json : (json.data || json.transactions || []);
};
