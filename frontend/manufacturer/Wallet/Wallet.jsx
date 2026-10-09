import { useState, useEffect, useMemo } from "react";
import WalletHeader from "./components/WalletHeader/WalletHeader";
import WalletStats from "./components/WalletStats/WalletStats";
import WalletTable from "./components/WalletTable/WalletTable";
import WalletFilter from "../../admin/Wallet/components/WalletFilter/WalletFilter";
import { getMfgWalletMetrics, getMfgEarningRecords } from "./api";
import "./Wallet.css";
const ManufacturerWallet = () => {
    const [metrics, setMetrics] = useState(null);
    const [records, setRecords] = useState([]);
    const [filterOption, setFilterOption] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
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
        try {
            const [mData, rData] = await Promise.all([
                getMfgWalletMetrics(),
                getMfgEarningRecords()
            ]);
            setMetrics(mData);
            setRecords(rData);
        }
        catch (err) {
            console.error("Failed to load manufacturer wallet data from database:", err);
        }
    };
    const handleRequestPayout = () => {
        alert("Payout release request submitted to Master Admin!");
    };
    // Filter logic
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            if (filterOption === "paid" && r.paymentStatus !== "Paid")
                return false;
            if (filterOption === "not_paid" && r.paymentStatus !== "Not Paid")
                return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchOrderId = r.orderId.toLowerCase().includes(q);
                const matchItem = r.itemName.toLowerCase().includes(q);
                return matchOrderId || matchItem;
            }
            return true;
        });
    }, [records, filterOption, searchQuery]);
    const paidCount = useMemo(() => records.filter(r => r.paymentStatus === "Paid").length, [records]);
    const notPaidCount = useMemo(() => records.filter(r => r.paymentStatus === "Not Paid").length, [records]);
    return (<div className="mfg-wallet-page">
            <WalletHeader onRefresh={loadWalletData} onRequestPayout={handleRequestPayout}/>

            <WalletStats metrics={metrics}/>

            <WalletFilter currentFilter={filterOption} onFilterChange={setFilterOption} searchQuery={searchQuery} onSearchChange={setSearchQuery} totalCount={records.length} paidCount={paidCount} notPaidCount={notPaidCount}/>

            <WalletTable records={filteredRecords}/>
        </div>);
};
export default ManufacturerWallet;
