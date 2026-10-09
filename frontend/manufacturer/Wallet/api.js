import apiClient from "../../shared/services/apiClient";
// Deprecated stub
export const getStoredEarningRecords = () => [];
// ==========================================
// 1. GET MANUFACTURER WALLET METRICS (GET /api/wallet/mfg/metrics)
// ==========================================
export const getMfgWalletMetrics = async () => {
    const json = await apiClient.get("/wallet/mfg/metrics");
    return json.data || json;
};
// ==========================================
// 2. GET MANUFACTURER EARNING RECORDS (GET /api/wallet/mfg/earnings)
// ==========================================
export const getMfgEarningRecords = async () => {
    const json = await apiClient.get("/wallet/mfg/earnings");
    return Array.isArray(json) ? json : (json.data || json.earnings || []);
};
