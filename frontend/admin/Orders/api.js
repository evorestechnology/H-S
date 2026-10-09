import apiClient from "../../shared/services/apiClient";
// Deprecated non-authoritative stubs to prevent broken imports during refactor
export const getStoredOrders = () => [];
export const saveOrdersToStorage = (_orders) => { };
// ==========================================
// 0. GET MANUFACTURERS LIST (GET /api/users/manufacturers)
// ==========================================
export const getManufacturers = async () => {
    try {
        const json = await apiClient.get("/users/manufacturers");
        return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    }
    catch (err) {
        console.error("Error fetching manufacturers from backend:", err);
        return [];
    }
};
// ==========================================
// 1. GET ALL ORDERS (GET /api/orders)
// ==========================================
export const getOrders = async () => {
    const json = await apiClient.get("/orders");
    const ordersList = Array.isArray(json.data)
        ? json.data
        : (Array.isArray(json.orders) ? json.orders : (Array.isArray(json) ? json : []));
    return { orders: ordersList };
};
// ==========================================
// 2. CREATE NEW ORDER (POST /api/orders)
// ==========================================
export const createOrder = async (newOrderData) => {
    const json = await apiClient.post("/orders", {
        itemName: newOrderData.itemName,
        mfgItemName: newOrderData.mfgItemName,
        size: newOrderData.size,
        color: newOrderData.color,
        orderedBy: newOrderData.orderedBy,
        fullName: newOrderData.fullName,
        phone: newOrderData.phone,
        country: newOrderData.country,
        shippingAddress: newOrderData.shippingAddress,
        amountPaid: newOrderData.amountPaid,
        mfgPayment: newOrderData.mfgPayment,
        status: newOrderData.status || "In Progress",
        shipperName: newOrderData.shipperName || null,
        trackingNumber: newOrderData.trackingId && newOrderData.trackingId !== "None" ? newOrderData.trackingId : null,
        trackingLink: newOrderData.trackingLink && newOrderData.trackingLink !== "None" ? newOrderData.trackingLink : null,
        manufacturerId: newOrderData.manufacturerId || null
    });
    return json.data || json.order || json;
};
// ==========================================
// 3. UPDATE ORDER TO SHIPPING (PUT /api/orders/:id/ship)
// ==========================================
export const updateOrderToShipping = async (id, shipperName, trackingId, trackingLink) => {
    await apiClient.put(`/orders/${id}/ship`, {
        shipperName,
        trackingId,
        trackingLink
    });
    return true;
};
// ==========================================
// 4. COMPLETE ORDER (PATCH /api/orders/:id/complete)
// ==========================================
export const completeOrder = async (id, completedDate) => {
    const date = completedDate || new Date().toISOString().split("T")[0];
    await apiClient.patch(`/orders/${id}/complete`, {
        completedDate: date
    });
    return true;
};
// ==========================================
// 5. CANCEL ORDER WITH REASON (PATCH /api/orders/:id/cancel)
// ==========================================
export const cancelOrder = async (id, cancelReason) => {
    await apiClient.patch(`/orders/${id}/cancel`, {
        cancelReason
    });
    return true;
};
// ==========================================
// 6. REQUEST PRICE ADJUSTMENT (POST /api/orders/:id/price-adjustment)
// ==========================================
export const requestPriceAdjustment = async (id, amount, reason) => {
    await apiClient.post(`/orders/${id}/price-adjustment`, {
        priceAdjustmentAmount: amount,
        priceAdjustmentReason: reason
    });
    return true;
};
// ==========================================
// 7. RESPOND TO PRICE ADJUSTMENT (PATCH /api/orders/:id/price-adjustment)
// ==========================================
export const respondToPriceAdjustment = async (id, action) => {
    await apiClient.patch(`/orders/${id}/price-adjustment`, { action });
    return true;
};
// ==========================================
// 8. REQUEST ORDER CANCELLATION (POST /api/orders/:id/cancel-request)
// ==========================================
export const requestOrderCancellation = async (id, reason) => {
    await apiClient.post(`/orders/${id}/cancel-request`, {
        cancelReason: reason
    });
    return true;
};
// ==========================================
// 9. RESPOND TO CANCEL REQUEST (PATCH /api/orders/:id/cancel-request)
// ==========================================
export const respondToCancelRequest = async (id, action) => {
    await apiClient.patch(`/orders/${id}/cancel-request`, { action });
    return true;
};
// ==========================================
// 10. UPDATE MFG PAYMENT STATUS (PATCH /api/orders/:id/mfg-payment-status)
// ==========================================
export const updateMfgPaymentStatus = async (id, mfgPaymentStatus) => {
    const paidDate = mfgPaymentStatus === "Paid" ? new Date().toISOString().split("T")[0] : undefined;
    await apiClient.patch(`/orders/${id}/mfg-payment-status`, {
        mfgPaymentStatus,
        mfgPaidDate: paidDate
    });
    return true;
};
