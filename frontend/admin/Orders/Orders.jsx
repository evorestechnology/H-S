import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./Orders.css";
import { getOrders, createOrder, updateOrderToShipping, completeOrder, cancelOrder, processOrderRefund, respondToPriceAdjustment, respondToCancelRequest, updateMfgPaymentStatus } from "./api";
import OrdersHeader from "./components/OrdersHeader/OrdersHeader";
import OrdersSearch from "./components/OrdersSearch/OrdersSearch";
import OrdersTable from "./components/OrdersTable/OrdersTable";
import Pagination from "./components/Pagination/Pagination";
import OrdersModal from "./components/OrdersModal/OrdersModal";
import ShippingModal from "./components/ShippingModal/ShippingModal";
import CancelReasonModal from "./components/CancelReasonModal/CancelReasonModal";
import AdminRefundModal from "./components/AdminRefundModal/AdminRefundModal";
import ViewOrderModal from "./components/ViewOrderModal/ViewOrderModal";
import { ViewPriceAdjustmentModal } from "./components/PriceAdjustmentModal/ViewPriceAdjustmentModal";
import { getPortalUser, isUserInRole } from "../../shared/services/authStorage";
const PAGE_SIZE = 5;
const Orders = () => {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFetchingRef = useRef(false);
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
    // State for admin refund management
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
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
        // Auto-polling interval: Sync with backend every 30 seconds if tab is visible and not already fetching
        const pollInterval = setInterval(() => {
            if (document.visibilityState === "visible" && !isFetchingRef.current) {
                loadOrdersData(false);
            }
        }, 30000);
        const handleFocus = () => {
            if (!isFetchingRef.current) loadOrdersData(false);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !isFetchingRef.current) {
                loadOrdersData(false);
            }
        };
        const handleStorageEvent = (event) => {
            if (event.key === "hs_orders_sync_event" && !isFetchingRef.current) {
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
        if (!isAdmin || isFetchingRef.current)
            return;
        isFetchingRef.current = true;
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
            isFetchingRef.current = false;
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
    const handleConfirmCancelDirect = async (id, reason, refundData = {}) => {
        try {
            await cancelOrder(id, reason, refundData);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        status: "Cancelled",
                        cancelReason: reason,
                        cancelledByRole: "ADMIN",
                        cancelledAt: new Date().toISOString(),
                        refundStatus: refundData.refundStatus || "Refunded",
                        refundAmount: refundData.refundAmount,
                        refundImage: refundData.refundImage,
                        refundNote: refundData.refundNote,
                        refundedAt: refundData.refundStatus === "Refunded" ? new Date().toISOString() : null
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
    // Admin Process Refund Management
    const handleProcessRefund = async (id, refundData) => {
        try {
            await processOrderRefund(id, refundData);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        refundStatus: refundData.refundStatus,
                        refundAmount: refundData.refundAmount,
                        refundImage: refundData.refundImage,
                        refundNote: refundData.refundNote,
                        refundedAt: refundData.refundStatus === "Refunded" ? new Date().toISOString() : order.refundedAt
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
            alert(`Refund details updated successfully for Order #${id}!`);
        }
        catch (err) {
            console.error("Failed to process refund:", err);
            alert(`Error updating refund: ${err.message}`);
        }
    };
    // Price Adjustment Handlers (Accept / Reject)
    const handleAcceptPriceAdjustment = async (targetOrder) => {
        const adjustment = targetOrder.priceAdjustmentAmount || 0;
        try {
            const res = await respondToPriceAdjustment(targetOrder.id, "approve");
            const updatedOrder = res?.order || res?.data;
            if (updatedOrder) {
                updateOrdersState((prev) => prev.map((order) => {
                    if (order.id === targetOrder.id) {
                        return {
                            ...order,
                            ...updatedOrder
                        };
                    }
                    return order;
                }));
            }
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
            const res = await respondToPriceAdjustment(targetOrder.id, "reject");
            const updatedOrder = res?.order || res?.data;
            if (updatedOrder) {
                updateOrdersState((prev) => prev.map((order) => {
                    if (order.id === targetOrder.id) {
                        return {
                            ...order,
                            ...updatedOrder
                        };
                    }
                    return order;
                }));
            }
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
                </div>) : (<OrdersTable orders={paginatedOrders} onMoveToShipping={handleOpenShippingModal} onUpdateTracking={(order) => setSelectedOrderForTrackingUpdate(order)} onMoveToCompleted={handleMoveToCompleted} onInitiateCancel={handleInitiateCancel} onManageRefund={(order) => setSelectedOrderForRefund(order)} onAcceptCancelRequest={handleAcceptCancelRequest} onRejectCancelRequest={handleRejectCancelRequest} onViewCancelReason={(order) => setSelectedOrderForViewReason(order)} onViewOrderDetails={(order) => setSelectedOrderForViewDetails(order)} onViewPriceAdjRequest={(order) => setSelectedOrderForViewPriceAdj(order)} onMarkAsPaid={handleMarkAsPaid}/>)}

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
            {selectedOrderForViewReason && (<CancelReasonModal open={!!selectedOrderForViewReason} mode="view" order={selectedOrderForViewReason} onClose={() => setSelectedOrderForViewReason(null)} onOpenRefundModal={(order) => setSelectedOrderForRefund(order)}/>)}

            {/* Admin Refund Management Modal */}
            {selectedOrderForRefund && (<AdminRefundModal open={!!selectedOrderForRefund} order={selectedOrderForRefund} onClose={() => setSelectedOrderForRefund(null)} onSubmit={handleProcessRefund}/>)}

            {/* View Full Product Tech Pack & Artwork Details Modal */}
            {selectedOrderForViewDetails && (<ViewOrderModal open={!!selectedOrderForViewDetails} order={selectedOrderForViewDetails} onClose={() => setSelectedOrderForViewDetails(null)}/>)}

            {/* Review Price Adjustment Request Modal (Master Admin Only) */}
            {selectedOrderForViewPriceAdj && (<ViewPriceAdjustmentModal open={!!selectedOrderForViewPriceAdj} order={selectedOrderForViewPriceAdj} onClose={() => setSelectedOrderForViewPriceAdj(null)} onAccept={handleAcceptPriceAdjustment} onReject={handleRejectPriceAdjustment}/>)}
        </div>);
};
export default Orders;
