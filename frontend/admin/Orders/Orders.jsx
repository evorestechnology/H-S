import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Orders.css";
import { getOrders, createOrder, updateOrderToShipping, completeOrder, cancelOrder, respondToPriceAdjustment, respondToCancelRequest, updateMfgPaymentStatus } from "./api";
import OrdersHeader from "./components/OrdersHeader/OrdersHeader";
import OrdersSearch from "./components/OrdersSearch/OrdersSearch";
import OrdersTable from "./components/OrdersTable/OrdersTable";
import Pagination from "./components/Pagination/Pagination";
import OrdersModal from "./components/OrdersModal/OrdersModal";
import ShippingModal from "./components/ShippingModal/ShippingModal";
import CancelReasonModal from "./components/CancelReasonModal/CancelReasonModal";
import ViewOrderModal from "./components/ViewOrderModal/ViewOrderModal";
import { ViewPriceAdjustmentModal } from "./components/PriceAdjustmentModal/ViewPriceAdjustmentModal";
import { getPortalUser, isUserInRole } from "../../shared/services/authStorage";
const PAGE_SIZE = 5;
const Orders = () => {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // State for moving from In Progress -> Shipping
    const [selectedOrderForShipping, setSelectedOrderForShipping] = useState(null);
    const [selectedOrderForTrackingUpdate, setSelectedOrderForTrackingUpdate] = useState(null);
    // State for moving from Shipping -> Completed (when tracking details are missing)
    const [selectedOrderForCompletion, setSelectedOrderForCompletion] = useState(null);
    // State for cancelling an order & viewing cancellation reason
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
    const [selectedOrderForViewReason, setSelectedOrderForViewReason] = useState(null);
    // State for viewing product artwork & manufacturing tech pack details
    const [selectedOrderForViewDetails, setSelectedOrderForViewDetails] = useState(null);
    // State for reviewing price adjustment request
    const [selectedOrderForViewPriceAdj, setSelectedOrderForViewPriceAdj] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const currentUser = getPortalUser("admin");
    const isAdmin = isUserInRole(currentUser, ["ADMIN", "ADMINISTRATOR"]);
    useEffect(() => {
        if (!isAdmin) {
            setIsLoading(false);
            return;
        }
        const orderIdParam = searchParams.get("orderId");
        if (orderIdParam) {
            setSearch(orderIdParam);
        }
        loadOrdersData(true);
        // Auto-polling interval: Sync with backend every 15 seconds if tab is visible
        const pollInterval = setInterval(() => {
            if (document.visibilityState === "visible") {
                loadOrdersData(false);
            }
        }, 15000);
        const handleFocus = () => loadOrdersData(false);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadOrdersData(false);
            }
        };
        const handleStorageEvent = (event) => {
            if (event.key === "hs_orders_sync_event") {
                loadOrdersData(false);
            }
        };
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("storage", handleStorageEvent);
        // Instant cross-tab sync via BroadcastChannel
        let channel = null;
        try {
            channel = new BroadcastChannel("hs_orders_sync_channel");
            channel.onmessage = (event) => {
                if (event.data?.type === "ORDER_CREATED" ||
                    event.data?.type === "ORDER_UPDATED" ||
                    event.data?.type === "TRACKING_UPDATED" ||
                    event.data?.type === "PAYOUT_UPDATED") {
                    loadOrdersData(false);
                }
            };
        }
        catch (e) {
            // Ignore if unsupported
        }
        return () => {
            clearInterval(pollInterval);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("storage", handleStorageEvent);
            if (channel) {
                channel.close();
            }
        };
    }, []);
    const loadOrdersData = async (initialLoad = false, manualSync = false) => {
        if (!isAdmin)
            return;
        if (initialLoad)
            setIsLoading(true);
        if (manualSync)
            setIsSyncing(true);
        try {
            const response = await getOrders();
            if (response && Array.isArray(response.orders)) {
                setOrders(response.orders);
                const orderIdParam = searchParams.get("orderId");
                if (orderIdParam) {
                    const matched = response.orders.find((o) => o.id === orderIdParam);
                    if (matched) {
                        if (matched.priceAdjustmentStatus === "Pending Approval") {
                            setSelectedOrderForViewPriceAdj(matched);
                        }
                        else {
                            setSelectedOrderForViewDetails(matched);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error("Failed to load admin orders:", err);
        }
        finally {
            if (initialLoad)
                setIsLoading(false);
            if (manualSync)
                setIsSyncing(false);
        }
    };
    const updateOrdersState = (updater) => {
        setOrders((prev) => {
            return updater(prev);
        });
    };
    const filteredOrders = useMemo(() => {
        return orders.filter((item) => {
            const matchesStatus = filter === "All" ? true : item.status === filter;
            const keyword = search.toLowerCase();
            const matchesSearch = item.id.toLowerCase().includes(keyword) ||
                item.itemName.toLowerCase().includes(keyword) ||
                (item.mfgItemName && item.mfgItemName.toLowerCase().includes(keyword)) ||
                item.orderedBy.toLowerCase().includes(keyword) ||
                (item.fullName && item.fullName.toLowerCase().includes(keyword)) ||
                (item.phone && item.phone.toLowerCase().includes(keyword)) ||
                (item.country && item.country.toLowerCase().includes(keyword)) ||
                (item.shippingAddress && item.shippingAddress.toLowerCase().includes(keyword)) ||
                (item.trackingId && item.trackingId.toLowerCase().includes(keyword)) ||
                (item.shipperName && item.shipperName.toLowerCase().includes(keyword)) ||
                (item.couponCode && item.couponCode.toLowerCase().includes(keyword)) ||
                (item.cancelReason && item.cancelReason.toLowerCase().includes(keyword));
            return matchesStatus && matchesSearch;
        });
    }, [orders, filter, search]);
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    // Transition 1: Move from In Progress to Shipping (Shipper Name mandatory, tracking ID/link optional)
    const handleOpenShippingModal = (order) => {
        setSelectedOrderForShipping(order);
    };
    const handleConfirmShipping = async (id, shipperName, trackingId, trackingLink) => {
        try {
            await updateOrderToShipping(id, shipperName, trackingId, trackingLink);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        status: "Shipping",
                        shipperName,
                        trackingId: trackingId.trim() ? trackingId.trim() : "None",
                        trackingLink: trackingLink.trim() ? trackingLink.trim() : "None"
                    };
                }
                return order;
            }));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "TRACKING_UPDATED", orderId: id });
                channel.close();
            }
            catch (e) { }
        }
        catch (err) {
            console.error("Failed to update shipping:", err);
            alert(`Error updating shipping: ${err.message}`);
        }
        setSelectedOrderForShipping(null);
        setSelectedOrderForTrackingUpdate(null);
    };
    // Transition 2: Move from Shipping to Completed (Tracking ID & Link are mandatory)
    const handleMoveToCompleted = async (order) => {
        const hasValidTracking = order.trackingId &&
            order.trackingId !== "None" &&
            order.trackingLink &&
            order.trackingLink !== "None";
        const todayStr = new Date().toISOString().split("T")[0];
        if (hasValidTracking) {
            try {
                await completeOrder(order.id, todayStr);
                updateOrdersState((prev) => prev.map((item) => item.id === order.id ? { ...item, status: "Completed", completedDate: item.completedDate || todayStr } : item));
                await loadOrdersData();
            }
            catch (err) {
                console.error("Failed to complete order:", err);
                alert(`Error: ${err.message}`);
            }
        }
        else {
            setSelectedOrderForCompletion(order);
        }
    };
    const handleConfirmCompletion = async (id, shipperName, trackingId, trackingLink) => {
        const todayStr = new Date().toISOString().split("T")[0];
        try {
            await updateOrderToShipping(id, shipperName, trackingId, trackingLink);
            await completeOrder(id, todayStr);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        status: "Completed",
                        completedDate: order.completedDate || todayStr,
                        shipperName,
                        trackingId,
                        trackingLink
                    };
                }
                return order;
            }));
            await loadOrdersData();
        }
        catch (err) {
            console.error("Failed to complete order:", err);
            alert(`Error: ${err.message}`);
        }
        setSelectedOrderForCompletion(null);
    };
    // Transition 3: Admin Accepts Cancellation Request -> Status becomes "Cancelled"
    const handleAcceptCancelRequest = async (order) => {
        try {
            await respondToCancelRequest(order.id, "accept");
            updateOrdersState((prev) => prev.map((item) => item.id === order.id
                ? {
                    ...item,
                    status: "Cancelled",
                    cancelReason: order.cancelReason || item.cancelReason,
                    previousStatus: undefined,
                    cancelledByRole: "MANUFACTURER",
                    cancelledAt: new Date().toISOString()
                }
                : item));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId: order.id, timestamp: Date.now() });
                setTimeout(() => {
                    try {
                        channel.close();
                    }
                    catch (e) { }
                }, 1000);
            }
            catch (e) { }
            try {
                localStorage.setItem("hs_orders_sync", Date.now().toString());
            }
            catch (e) { }
        }
        catch (err) {
            console.error("Failed to accept cancel request:", err);
            alert(`Error: ${err.message}`);
        }
    };
    // Transition 4: Admin Rejects Cancellation Request -> Revert status to previousStatus
    const handleRejectCancelRequest = async (order) => {
        try {
            await respondToCancelRequest(order.id, "reject");
            updateOrdersState((prev) => prev.map((item) => item.id === order.id
                ? {
                    ...item,
                    status: item.previousStatus || "In Progress",
                    cancelReason: undefined,
                    previousStatus: undefined
                }
                : item));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId: order.id });
                channel.close();
            }
            catch (e) { }
        }
        catch (err) {
            console.error("Failed to reject cancel request:", err);
            alert(`Error: ${err.message}`);
        }
    };
    // Admin Direct Cancellation
    const handleInitiateCancel = (order) => {
        setSelectedOrderForCancel(order);
    };
    const handleConfirmCancelDirect = async (id, reason) => {
        try {
            await cancelOrder(id, reason);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        status: "Cancelled",
                        cancelReason: reason,
                        cancelledByRole: "ADMIN",
                        cancelledAt: new Date().toISOString()
                    };
                }
                return order;
            }));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId: id, timestamp: Date.now() });
                setTimeout(() => {
                    try {
                        channel.close();
                    }
                    catch (e) { }
                }, 1000);
            }
            catch (e) { }
            try {
                localStorage.setItem("hs_orders_sync", Date.now().toString());
            }
            catch (e) { }
        }
        catch (err) {
            console.error("Failed to cancel order:", err);
            alert(`Error: ${err.message}`);
        }
        setSelectedOrderForCancel(null);
    };
    // Price Adjustment Handlers (Accept / Reject)
    const handleAcceptPriceAdjustment = async (targetOrder) => {
        const adjustment = targetOrder.priceAdjustmentAmount || 0;
        try {
            await respondToPriceAdjustment(targetOrder.id, "approve");
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === targetOrder.id) {
                    return {
                        ...order,
                        priceAdjustmentStatus: "Approved",
                        mfgPayment: Number((order.mfgPayment + adjustment).toFixed(2))
                    };
                }
                return order;
            }));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId: targetOrder.id });
                channel.close();
            }
            catch (e) { }
            alert(`Price Adjustment of ₹${adjustment} Approved for Order #${targetOrder.id}! Updated MFG Payment.`);
        }
        catch (err) {
            console.error("Failed to approve price adjustment:", err);
            alert(`Error: ${err.message}`);
        }
    };
    const handleRejectPriceAdjustment = async (targetOrder) => {
        try {
            await respondToPriceAdjustment(targetOrder.id, "reject");
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === targetOrder.id) {
                    return {
                        ...order,
                        priceAdjustmentStatus: "Rejected"
                    };
                }
                return order;
            }));
            await loadOrdersData();
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId: targetOrder.id });
                channel.close();
            }
            catch (e) { }
            alert(`Price Adjustment Request for Order #${targetOrder.id} has been Rejected.`);
        }
        catch (err) {
            console.error("Failed to reject price adjustment:", err);
            alert(`Error: ${err.message}`);
        }
    };
    // Requirement: Mark as Paid & Update Wallets (Authoritative Backend State)
    const handleMarkAsPaid = async (targetOrder) => {
        const totalPayout = targetOrder.mfgPayment;
        try {
            await updateMfgPaymentStatus(targetOrder.id, "Paid");
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === targetOrder.id) {
                    return {
                        ...order,
                        mfgPaymentStatus: "Paid",
                        mfgPaidDate: new Date().toLocaleDateString()
                    };
                }
                return order;
            }));
            await loadOrdersData();
            // Broadcast real-time sync across tabs (Wallets & Orders)
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "PAYOUT_UPDATED", orderId: targetOrder.id, mfgPaymentStatus: "Paid" });
                channel.close();
            }
            catch (e) { }
            alert(`Payment of ₹${totalPayout.toFixed(2)} marked as PAID for Order #${targetOrder.id}!`);
        }
        catch (err) {
            console.error("Failed to mark order as paid on backend:", err);
            alert(`Error: ${err.message}`);
        }
    };
    const handleCreateOrder = async (newOrderData) => {
        setIsCreating(true);
        try {
            const created = await createOrder(newOrderData);
            setOrders((prev) => [created, ...prev]);
            setIsCreateModalOpen(false);
            await loadOrdersData();
        }
        catch (err) {
            console.error("Failed to create order on backend:", err);
            alert(`Failed to create order: ${err.message || "Unknown error"}`);
        }
        finally {
            setIsCreating(false);
        }
    };
    if (!isAdmin) {
        return (<div className="orders-page">
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>
                        Access Restricted
                    </h2>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                        Admin privileges are required to view or manage admin orders.
                    </p>
                </div>
            </div>);
    }
    return (<div className="orders-page">
            <OrdersHeader onNewOrder={() => setIsCreateModalOpen(true)} onRefresh={() => loadOrdersData(false, true)} isRefreshing={isSyncing}/>

            <OrdersSearch value={search} onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
        }} activeFilter={filter} onFilterChange={(val) => {
            setFilter(val);
            setCurrentPage(1);
        }}/>

            {isLoading && orders.length === 0 ? (<div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    Loading orders from server...
                </div>) : (<OrdersTable orders={paginatedOrders} onMoveToShipping={handleOpenShippingModal} onUpdateTracking={(order) => setSelectedOrderForTrackingUpdate(order)} onMoveToCompleted={handleMoveToCompleted} onInitiateCancel={handleInitiateCancel} onAcceptCancelRequest={handleAcceptCancelRequest} onRejectCancelRequest={handleRejectCancelRequest} onViewCancelReason={(order) => setSelectedOrderForViewReason(order)} onViewOrderDetails={(order) => setSelectedOrderForViewDetails(order)} onViewPriceAdjRequest={(order) => setSelectedOrderForViewPriceAdj(order)} onMarkAsPaid={handleMarkAsPaid}/>)}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>

            {/* Create Order Modal */}
            <OrdersModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateOrder} isSubmitting={isCreating}/>

            {/* Shipping Details Modal for In Progress -> Shipping */}
            {selectedOrderForShipping && (<ShippingModal open={!!selectedOrderForShipping} mode="shipping" order={selectedOrderForShipping} onClose={() => setSelectedOrderForShipping(null)} onSubmit={handleConfirmShipping}/>)}

            {/* Update Tracking Details Modal (Order remains in Shipping status) */}
            {selectedOrderForTrackingUpdate && (<ShippingModal open={!!selectedOrderForTrackingUpdate} mode="update" order={selectedOrderForTrackingUpdate} onClose={() => setSelectedOrderForTrackingUpdate(null)} onSubmit={handleConfirmShipping}/>)}

            {/* Shipping Details Modal for Shipping -> Completed (Mandatory Tracking Details) */}
            {selectedOrderForCompletion && (<ShippingModal open={!!selectedOrderForCompletion} mode="complete" order={selectedOrderForCompletion} onClose={() => setSelectedOrderForCompletion(null)} onSubmit={handleConfirmCompletion}/>)}

            {/* Order Cancellation Modal */}
            {selectedOrderForCancel && (<CancelReasonModal open={!!selectedOrderForCancel} mode="create" order={selectedOrderForCancel} onClose={() => setSelectedOrderForCancel(null)} onConfirmCancel={handleConfirmCancelDirect}/>)}

            {/* View Cancellation Reason Modal */}
            {selectedOrderForViewReason && (<CancelReasonModal open={!!selectedOrderForViewReason} mode="view" order={selectedOrderForViewReason} onClose={() => setSelectedOrderForViewReason(null)}/>)}

            {/* View Full Product Tech Pack & Artwork Details Modal */}
            {selectedOrderForViewDetails && (<ViewOrderModal open={!!selectedOrderForViewDetails} order={selectedOrderForViewDetails} onClose={() => setSelectedOrderForViewDetails(null)}/>)}

            {/* Review Price Adjustment Request Modal (Master Admin Only) */}
            {selectedOrderForViewPriceAdj && (<ViewPriceAdjustmentModal open={!!selectedOrderForViewPriceAdj} order={selectedOrderForViewPriceAdj} onClose={() => setSelectedOrderForViewPriceAdj(null)} onAccept={handleAcceptPriceAdjustment} onReject={handleRejectPriceAdjustment}/>)}
        </div>);
};
export default Orders;
