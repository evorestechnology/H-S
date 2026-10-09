/**
 * @deprecated Financial balances, transactions, and payouts are authoritative strictly
 * within the PostgreSQL database via `/api/wallet` endpoints.
 *
 * Client-side browser storage must never simulate or persist financial mutations.
 * These stubs remain for backward compatibility only.
 */
/**
 * @deprecated Use wallet API services (`/api/wallet/overview` or `/api/wallet/transactions`) instead.
 */
export const getWalletData = () => {
    if (import.meta.env.DEV) {
        console.warn("[SECURITY] getWalletData() is deprecated. Financial balances must be queried from backend APIs.");
    }
    return {
        mfgBalance: 0,
        adminBalance: 0
    };
};
/**
 * @deprecated Use `/api/wallet/admin/pay` backend endpoint for payout processing.
 */
export const payManufacturerForOrder = (_amount) => {
    if (import.meta.env.DEV) {
        console.warn("[SECURITY] payManufacturerForOrder() client-side mutation is deprecated. Payouts must be processed via backend APIs.");
    }
    return {
        mfgBalance: 0,
        adminBalance: 0
    };
};
