import "./WalletFilter.css";
import { Search, Filter } from "lucide-react";
const WalletFilter = ({ currentFilter, onFilterChange, searchQuery, onSearchChange, totalCount, paidCount, notPaidCount }) => {
    return (<div className="wallet-filter-bar">
            {/* Filter Tabs: all / paid / not paid */}
            <div className="filter-tabs">
                <button className={`filter-tab ${currentFilter === "all" ? "active" : ""}`} onClick={() => onFilterChange("all")}>
                    <Filter size={14}/>
                    <span>All</span>
                    <span className="tab-count badge-all">{totalCount}</span>
                </button>

                <button className={`filter-tab ${currentFilter === "paid" ? "active" : ""}`} onClick={() => onFilterChange("paid")}>
                    <span className="status-indicator paid-dot"></span>
                    <span>Paid (P)</span>
                    <span className="tab-count badge-paid">{paidCount}</span>
                </button>

                <button className={`filter-tab ${currentFilter === "not_paid" ? "active" : ""}`} onClick={() => onFilterChange("not_paid")}>
                    <span className="status-indicator unpaid-dot"></span>
                    <span>Not Paid (NP)</span>
                    <span className="tab-count badge-unpaid">{notPaidCount}</span>
                </button>
            </div>

            {/* Search Input */}
            <div className="filter-search-box">
                <Search size={16} className="search-icon"/>
                <input type="text" placeholder="Search by Order ID or Manufacturer..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="search-input"/>
                {searchQuery && (<button className="clear-search-btn" onClick={() => onSearchChange("")}>
                        ×
                    </button>)}
            </div>
        </div>);
};
export default WalletFilter;
