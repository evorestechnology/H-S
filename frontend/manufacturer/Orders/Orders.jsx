import { useEffect, useMemo, useState } from "react";
import "./Orders.css";
import { getOrders, createOrder, updateOrderToShipping, completeOrder, cancelOrder, requestPriceAdjustment, requestOrderCancellation, saveOrdersToStorage } from "./api";
import OrdersHeader from "./components/OrdersHeader/OrdersHeader";
import OrdersSearch from "./components/OrdersSearch/OrdersSearch";
import OrdersTable from "./components/OrdersTable/OrdersTable";
import Pagination from "./components/Pagination/Pagination";
import OrdersModal from "./components/OrdersModal/OrdersModal";
import ShippingModal from "./components/ShippingModal/ShippingModal";
import CancelReasonModal from "./components/CancelReasonModal/CancelReasonModal";
import ViewOrderModal from "./components/ViewOrderModal/ViewOrderModal";
import { PriceAdjustmentModal } from "./components/PriceAdjustmentModal/PriceAdjustmentModal";
const PAGE_SIZE = 5;
const Orders = () => {
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
    // State for price adjustment request modal
    const [selectedOrderForPriceAdj, setSelectedOrderForPriceAdj] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    useEffect(() => {
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
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        // Instant cross-tab sync via BroadcastChannel
        let channel = null;
        try {
            channel = new BroadcastChannel("hs_orders_sync_channel");
            channel.onmessage = (event) => {
                if (event.data?.type === "ORDER_UPDATED" || event.data?.type === "TRACKING_UPDATED") {
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
            if (channel) {
                channel.close();
            }
        };
    }, []);
    const loadOrdersData = async (initialLoad = false, manualSync = false) => {
        if (initialLoad)
            setIsLoading(true);
        if (manualSync)
            setIsSyncing(true);
        try {
            const response = await getOrders();
            if (response && Array.isArray(response.orders)) {
                setOrders(response.orders);
                saveOrdersToStorage(response.orders);
            }
        }
        catch (err) {
            console.error("Error loading manufacturer orders:", err);
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
            const next = updater(prev);
            saveOrdersToStorage(next);
            return next;
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
                try {
                    const channel = new BroadcastChannel("hs_orders_sync_channel");
                    channel.postMessage({ type: "ORDER_UPDATED", orderId: order.id });
                    channel.close();
                }
                catch (e) { }
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
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "TRACKING_UPDATED", orderId: id });
                channel.close();
            }
            catch (e) { }
        }
        catch (err) {
            console.error("Failed to complete order:", err);
            alert(`Error: ${err.message}`);
        }
        setSelectedOrderForCompletion(null);
    };
    // Cancellation: Initiate cancellation request
    const handleInitiateCancel = (order) => {
        setSelectedOrderForCancel(order);
    };
    const handleConfirmCancelRequest = async (id, reason) => {
        try {
            await cancelOrder(id, reason);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === id) {
                    return {
                        ...order,
                        previousStatus: order.status,
                        status: "Cancelled",
                        cancelReason: reason,
                        cancelledByRole: "MANUFACTURER",
                        cancelledAt: new Date().toISOString(),
                        cancelRequested: false
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
            alert("Order has been cancelled.");
        }
        catch (err) {
            console.error("Direct cancel failed, submitting cancellation request:", err);
            try {
                await requestOrderCancellation(id, reason);
                updateOrdersState((prev) => prev.map((order) => {
                    if (order.id === id) {
                        return {
                            ...order,
                            previousStatus: order.status,
                            status: "Cancel Requested",
                            cancelReason: reason,
                            cancelRequested: true
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
                alert("Cancellation request submitted to Admin.");
            }
            catch (fallbackErr) {
                alert(`Error: ${fallbackErr.message || err.message}`);
            }
        }
        setSelectedOrderForCancel(null);
    };
    // Price Adjustment Request Submission Handler
    const handleSubmitPriceAdjustmentRequest = async (orderId, amount, reason) => {
        try {
            await requestPriceAdjustment(orderId, amount, reason);
            updateOrdersState((prev) => prev.map((order) => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        priceAdjustmentStatus: "Pending Approval",
                        priceAdjustmentAmount: amount,
                        priceAdjustmentReason: reason
                    };
                }
                return order;
            }));
            await loadOrdersData();
            // Broadcast real-time sync to Admin Orders & Dashboard
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", orderId });
                channel.close();
            }
            catch (e) { }
            alert(`Price adjustment request of ₹${amount} submitted to Admin for approval.`);
        }
        catch (err) {
            console.error("Failed to submit price adjustment:", err);
            alert(`Error: ${err.message}`);
        }
        setSelectedOrderForPriceAdj(null);
    };
    // Create New Order
    const handleCreateOrder = async (newOrderData) => {
        setIsCreating(true);
        try {
            const created = await createOrder(newOrderData);
            setOrders((prev) => [created, ...prev]);
            saveOrdersToStorage([created, ...orders]);
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
                    Loading manufacturer orders...
                </div>) : (<OrdersTable orders={paginatedOrders} onMoveToShipping={handleOpenShippingModal} onUpdateTracking={(order) => setSelectedOrderForTrackingUpdate(order)} onMoveToCompleted={handleMoveToCompleted} onInitiateCancel={handleInitiateCancel} onRequestPriceAdj={(order) => setSelectedOrderForPriceAdj(order)} onViewCancelReason={(order) => setSelectedOrderForViewReason(order)} onViewOrderDetails={(order) => setSelectedOrderForViewDetails(order)}/>)}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>

            {/* Create Order Modal */}
            <OrdersModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateOrder}/>

            {/* Shipping Details Modal for In Progress -> Shipping */}
            {selectedOrderForShipping && (<ShippingModal open={!!selectedOrderForShipping} mode="shipping" order={selectedOrderForShipping} onClose={() => setSelectedOrderForShipping(null)} onSubmit={handleConfirmShipping}/>)}

            {/* Update Tracking Details Modal (Order remains in Shipping status) */}
            {selectedOrderForTrackingUpdate && (<ShippingModal open={!!selectedOrderForTrackingUpdate} mode="update" order={selectedOrderForTrackingUpdate} onClose={() => setSelectedOrderForTrackingUpdate(null)} onSubmit={handleConfirmShipping}/>)}

            {/* Shipping Details Modal for Shipping -> Completed (Mandatory Tracking Details) */}
            {selectedOrderForCompletion && (<ShippingModal open={!!selectedOrderForCompletion} mode="complete" order={selectedOrderForCompletion} onClose={() => setSelectedOrderForCompletion(null)} onSubmit={handleConfirmCompletion}/>)}

            {/* Order Cancellation Modal */}
            {selectedOrderForCancel && (<CancelReasonModal open={!!selectedOrderForCancel} mode="create" order={selectedOrderForCancel} onClose={() => setSelectedOrderForCancel(null)} onConfirmCancel={handleConfirmCancelRequest}/>)}

            {/* View Cancellation Reason Modal */}
            {selectedOrderForViewReason && (<CancelReasonModal open={!!selectedOrderForViewReason} mode="view" order={selectedOrderForViewReason} onClose={() => setSelectedOrderForViewReason(null)}/>)}

            {/* View Full Product Tech Pack & Artwork Details Modal */}
            {selectedOrderForViewDetails && (<ViewOrderModal open={!!selectedOrderForViewDetails} order={selectedOrderForViewDetails} onClose={() => setSelectedOrderForViewDetails(null)} onRequestPriceAdj={(ord) => setSelectedOrderForPriceAdj(ord)}/>)}

            {/* Price Adjustment Request Modal */}
            {selectedOrderForPriceAdj && (<PriceAdjustmentModal open={!!selectedOrderForPriceAdj} order={selectedOrderForPriceAdj} onClose={() => setSelectedOrderForPriceAdj(null)} onSubmitRequest={handleSubmitPriceAdjustmentRequest}/>)}
        </div>);
};
export default Orders;
