import { useState, useEffect, useMemo } from "react";
import WalletHeader from "./components/WalletHeader/WalletHeader";
import WalletStats from "./components/WalletStats/WalletStats";
import WalletFilter from "./components/WalletFilter/WalletFilter";
import WalletTable from "./components/WalletTable/WalletTable";
import { getAdminWalletMetrics, getAdminWalletTransactions, markTransactionAsPaid, toggleTransactionAdjustment } from "./api";
import "./Wallet.css";
const Wallet = () => {
    const [metrics, setMetrics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filterOption, setFilterOption] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    useEffect(() => {
        loadWalletData();
        window.addEventListener("focus", loadWalletData);
        const handleStorage = (e) => {
            if (e.key === "hs_orders_sync") {
                loadWalletData();
            }
        };
        window.addEventListener("storage", handleStorage);
        let channel = null;
        try {
            channel = new BroadcastChannel("hs_orders_sync_channel");
            channel.onmessage = (event) => {
                if (event.data?.type === "ORDER_UPDATED" || event.data?.type === "TRACKING_UPDATED" || event.data?.type === "PAYOUT_UPDATED") {
                    loadWalletData();
                }
            };
        }
        catch (e) { }
        return () => {
            window.removeEventListener("focus", loadWalletData);
            window.removeEventListener("storage", handleStorage);
            if (channel)
                channel.close();
        };
    }, []);
    const loadWalletData = async () => {
        setLoading(true);
        try {
            const [tData, mData] = await Promise.all([
                getAdminWalletTransactions(),
                getAdminWalletMetrics()
            ]);
            setTransactions(tData);
            setMetrics(mData);
        }
        catch (err) {
            console.error("Error loading wallet data from database:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };
    const handleMarkAsPaid = async (txnId) => {
        try {
            const updatedTxns = await markTransactionAsPaid(txnId);
            setTransactions(updatedTxns);
            const updatedMetrics = await getAdminWalletMetrics();
            setMetrics(updatedMetrics);
            showNotification(`Payout for transaction ${txnId} marked as Paid [P]!`);
            // Broadcast real-time sync
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "PAYOUT_UPDATED", txnId });
                channel.close();
            }
            catch (e) { }
        }
        catch (e) {
            alert(`Failed to update payout: ${e.message}`);
        }
    };
    const handleToggleAdjustment = async (txnId) => {
        try {
            const updatedTxns = await toggleTransactionAdjustment(txnId);
            setTransactions(updatedTxns);
            const updatedMetrics = await getAdminWalletMetrics();
            setMetrics(updatedMetrics);
            showNotification(`Price adjustment status updated for ${txnId}!`);
            // Broadcast real-time sync
            try {
                const channel = new BroadcastChannel("hs_orders_sync_channel");
                channel.postMessage({ type: "ORDER_UPDATED", txnId });
                channel.close();
            }
            catch (e) { }
        }
        catch (e) {
            alert(`Failed to toggle adjustment: ${e.message}`);
        }
    };
    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Order ID,Gross Sale,GST Collected,Manufacturer Payment,Adjustment Status,Payment Status,Paid Date,Our Earnings"]
                .concat(filteredTransactions.map(t => {
                const gst = (t.gstCollected ?? t.gstAmount ?? 0);
                const adjText = t.adjustmentStatus === "Approved"
                    ? `Adjusted (+₹${t.adjustmentAmount})`
                    : t.adjustmentStatus === "Rejected"
                        ? "Rejected"
                        : t.adjustmentStatus === "Pending Approval"
                            ? `Pending Approval (+₹${t.adjustmentAmount})`
                            : "Not Adjusted";
                return `${t.orderId},${t.grossSaleValue},${gst},${t.manufacturerPayment},"${adjText}",${t.paymentStatus},${t.paidDate || 'Pending'},${t.ourEarnings}`;
            }))
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `wallet_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Financial Ledger statement export downloaded successfully.");
    };
    // Filtering logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Filter by Paid / Not Paid
            if (filterOption === "paid" && t.paymentStatus !== "Paid")
                return false;
            if (filterOption === "not_paid" && t.paymentStatus !== "Not Paid")
                return false;
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchOrderId = t.orderId.toLowerCase().includes(q);
                const matchMfg = t.manufacturerName.toLowerCase().includes(q);
                const matchCustomer = t.customerName.toLowerCase().includes(q);
                return matchOrderId || matchMfg || matchCustomer;
            }
            return true;
        });
    }, [transactions, filterOption, searchQuery]);
    const paidCount = useMemo(() => transactions.filter(t => t.paymentStatus === "Paid").length, [transactions]);
    const notPaidCount = useMemo(() => transactions.filter(t => t.paymentStatus === "Not Paid").length, [transactions]);
    return (<div className="wallet-page">
            {notification && (<div className="wallet-toast-notification">
                    <span>{notification}</span>
                </div>)}

            <WalletHeader onRefresh={loadWalletData} onExport={handleExport}/>

            <WalletStats metrics={metrics}/>

            <WalletFilter currentFilter={filterOption} onFilterChange={setFilterOption} searchQuery={searchQuery} onSearchChange={setSearchQuery} totalCount={transactions.length} paidCount={paidCount} notPaidCount={notPaidCount}/>

            {loading ? (<div className="wallet-loading-state">
                    <p>Loading financial transactions ledger...</p>
                </div>) : (<WalletTable transactions={filteredTransactions} onMarkAsPaid={handleMarkAsPaid} onToggleAdjustment={handleToggleAdjustment}/>)}
        </div>);
};
export default Wallet;
