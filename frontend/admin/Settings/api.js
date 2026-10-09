import apiClient from "../../shared/services/apiClient";
// ==========================================
// 1. GET ALL SETTINGS (GET /api/settings)
// ==========================================
export const getSettings = async () => {
    return await apiClient.get("/settings");
};
// ==========================================
// 2. UPDATE TAX / GST SETTINGS (PUT /api/settings/tax)
// ==========================================
export const updateTaxSettings = async (settings) => {
    return await apiClient.put("/settings/tax", settings);
};
// ==========================================
// 3. UPDATE STORE PROFILE SETTINGS (PUT /api/settings/store)
// ==========================================
export const updateStoreSettings = async (settings) => {
    return await apiClient.put("/settings/store", settings);
};
// ==========================================
// 4. GET SHIPPING SETTINGS (GET /api/settings/shipping)
// ==========================================
export const getShippingSettings = async () => {
    const res = await apiClient.get("/settings/shipping");
    return res.data || res;
};
// ==========================================
// 5. UPDATE SHIPPING SETTINGS (PUT /api/settings/shipping)
// ==========================================
export const updateShippingSettings = async (settings) => {
    const res = await apiClient.put("/settings/shipping", settings);
    return res.data || res;
};
// ==========================================
// 6. GST SIMULATOR CALCULATION FUNCTION
// ==========================================
export const calculateGst = (price, country = "India", settings) => {
    const isIndian = country.trim().toLowerCase() === "india";
    let appliedRate = 0;
    let slabDescription = "";
    if (!settings) {
        return {
            productPrice: price,
            customerCountry: country,
            isIndian,
            appliedRate: 0,
            gstAmount: 0,
            totalPrice: price,
            slabDescription: "Awaiting database settings..."
        };
    }
    if (!isIndian) {
        appliedRate = settings.nonIndianRate; // 0%
        slabDescription = "0% GST / IGST (Non-Indian / Export of Goods)";
    }
    else {
        if (price > settings.indianThreshold) {
            appliedRate = settings.indianHighRate; // 18%
            slabDescription = `${settings.indianHighRate}% GST (Indian Domestic - Price > ₹${settings.indianThreshold.toLocaleString("en-IN")})`;
        }
        else {
            appliedRate = settings.indianLowRate; // 5%
            slabDescription = `${settings.indianLowRate}% GST (Indian Domestic - Price <= ₹${settings.indianThreshold.toLocaleString("en-IN")})`;
        }
    }
    const gstAmount = Number(((price * appliedRate) / 100).toFixed(2));
    const totalPrice = Number((price + gstAmount).toFixed(2));
    return {
        productPrice: price,
        customerCountry: country,
        isIndian,
        appliedRate,
        gstAmount,
        totalPrice,
        slabDescription
    };
};
