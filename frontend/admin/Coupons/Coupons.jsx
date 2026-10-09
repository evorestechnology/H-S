import { useEffect, useMemo, useState } from "react";
import "./Coupons.css";
import { getCoupons, createCoupon, toggleCouponStatus, deleteCoupon } from "./api";
import CouponsHeader from "./components/CouponsHeader/CouponsHeader";
import CouponStats from "./components/CouponStats/CouponStats";
import SearchBar from "./components/SearchBar/SearchBar";
import CouponTable from "./components/CouponTable/CouponTable";
import Pagination from "./components/Pagination/Pagination";
import CouponModal from "./components/CouponModal/CouponModal";
const PAGE_SIZE = 6;
const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await getCoupons();
            setCoupons(res.coupons || []);
        }
        catch (error) {
            console.error("Failed to load coupons:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const summary = useMemo(() => {
        return {
            totalCoupons: coupons.length,
            publicCoupons: coupons.filter((c) => c.type === "Public").length,
            privateCoupons: coupons.filter((c) => c.type === "Private").length,
            activeCoupons: coupons.filter((c) => c.status === "Active").length
        };
    }, [coupons]);
    const filteredCoupons = useMemo(() => {
        return coupons.filter((item) => {
            const matchesFilter = filter === "All"
                ? true
                : filter === "Public" || filter === "Private"
                    ? item.type === filter
                    : item.status === filter;
            const keyword = search.toLowerCase();
            const matchesSearch = item.code.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword);
            return matchesFilter && matchesSearch;
        });
    }, [coupons, filter, search]);
    const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / PAGE_SIZE));
    const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const handleCreateCoupon = async (couponData) => {
        try {
            setIsSubmitting(true);
            await createCoupon(couponData);
            await loadData();
            setIsModalOpen(false);
        }
        catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to create coupon";
            alert(msg);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleToggleStatus = async (id) => {
        const target = coupons.find((c) => c.id === id);
        if (!target)
            return;
        const nextStatus = target.status === "Active" ? "Disabled" : "Active";
        // Optimistic update
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
        try {
            await toggleCouponStatus(id, nextStatus);
        }
        catch (err) {
            // Revert on error
            setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, status: target.status } : c)));
            const msg = err?.response?.data?.message || err?.message || "Failed to update coupon status";
            alert(msg);
        }
    };
    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
            return;
        }
        const original = [...coupons];
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        try {
            await deleteCoupon(id);
        }
        catch (err) {
            setCoupons(original);
            const msg = err?.response?.data?.message || err?.message || "Failed to delete coupon";
            alert(msg);
        }
    };
    return (<div className="coupons-page">
            <CouponsHeader onCreateCoupon={() => setIsModalOpen(true)}/>

            <CouponStats summary={summary}/>

            <SearchBar value={search} onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
        }} activeFilter={filter} onFilterChange={(val) => {
            setFilter(val);
            setCurrentPage(1);
        }}/>

            <CouponTable coupons={paginatedCoupons} isLoading={isLoading} onToggleStatus={handleToggleStatus} onDelete={handleDeleteCoupon} onOpenCreate={() => setIsModalOpen(true)}/>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>

            <CouponModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateCoupon} isSubmitting={isSubmitting}/>
        </div>);
};
export default Coupons;
