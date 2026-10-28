import "./OrdersSearch.css";
import { Search, AlertCircle } from "lucide-react";

const standardFilters = ["All", "In Progress", "Shipping", "Delivered", "Cancel Requested", "Cancelled"];

const OrdersSearch = ({ value, onChange, activeFilter, onFilterChange, failedPaymentsCount = 0 }) => {
    return (
        <div className="orders-toolbar">
            <div className="orders-filter-container">
                <div className="orders-filter">
                    {standardFilters.map((filter) => (
                        <button
                            key={filter}
                            className={activeFilter === filter ? "orders-filter-btn active" : "orders-filter-btn"}
                            onClick={() => onFilterChange(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={`orders-filter-btn failed-payments-tab ${activeFilter === "Failed Payments" ? "active" : ""}`}
                    onClick={() => onFilterChange("Failed Payments")}
                    title="View orders with failed, abandoned or incomplete payments"
                >
                    <AlertCircle size={14} className="failed-tab-icon" />
                    <span>Failed Payments</span>
                    {failedPaymentsCount > 0 && (
                        <span className="failed-count-badge">{failedPaymentsCount}</span>
                    )}
                </button>
            </div>

            <div className="orders-search-box">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Search Order ID, Item, User ID, Phone, Country, Shipper..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default OrdersSearch;

