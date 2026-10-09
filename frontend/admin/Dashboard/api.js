import apiClient from "../../shared/services/apiClient";
// ==========================================
// GET DASHBOARD DATA (GET /api/dashboard/stats)
// Supports optional period query: "7d", "30d", "90d", "1y"
// ==========================================
export const getDashboardData = async (period = "7d") => {
    return await apiClient.get(`/dashboard/stats?period=${period}`);
};
