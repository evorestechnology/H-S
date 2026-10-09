import apiClient from "../../shared/services/apiClient";
// ==========================================
// 1. GET ALL COUPONS (GET /api/coupons)
// ==========================================
export const getCoupons = async () => {
    const data = await apiClient.get("/coupons");
    const coupons = Array.isArray(data.coupons) ? data.coupons : (Array.isArray(data) ? data : []);
    const summary = {
        totalCoupons: coupons.length,
        publicCoupons: coupons.filter(c => c.type === "Public").length,
        privateCoupons: coupons.filter(c => c.type === "Private").length,
        activeCoupons: coupons.filter(c => c.status === "Active").length
    };
    return { summary, coupons };
};
// ==========================================
// 2. CREATE A PUBLIC OR PRIVATE COUPON (POST /api/coupons)
// ==========================================
export const createCoupon = async (couponData) => {
    const data = await apiClient.post("/coupons", {
        code: couponData.code,
        type: couponData.type,
        discountValue: couponData.discountValue,
        discountType: couponData.discountType,
        minSpend: couponData.minSpend,
        usageLimit: couponData.usageLimit,
        expiryDate: couponData.expiryDate
    });
    return data.coupon || data;
};
// ==========================================
// 3. TOGGLE COUPON STATUS (PATCH /api/coupons/:id/status)
// ==========================================
export const toggleCouponStatus = async (id, status) => {
    await apiClient.patch(`/coupons/${id}/status`, { status });
    return true;
};
// ==========================================
// 4. DELETE COUPON (DELETE /api/coupons/:id)
// ==========================================
export const deleteCoupon = async (id) => {
    await apiClient.delete(`/coupons/${id}`);
    return true;
};
