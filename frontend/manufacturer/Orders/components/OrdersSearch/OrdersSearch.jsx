import "./OrdersSearch.css";
import { Search } from "lucide-react";
const filterOptions = ["All", "In Progress", "Shipping", "Delivered", "Cancel Requested", "Cancelled"];
const OrdersSearch = ({ value, onChange, activeFilter, onFilterChange }) => {
    return (<div className="orders-toolbar">
            <div className="orders-filter">
                {filterOptions.map((filter) => (<button key={filter} className={activeFilter === filter
                ? "orders-filter-btn active"
                : "orders-filter-btn"} onClick={() => onFilterChange(filter)}>
                        {filter}
                    </button>))}
            </div>

            <div className="orders-search-box">
                <Search size={16}/>
                <input type="text" placeholder="Search Order ID, Item, User ID, Phone, Country, Shipper..." value={value} onChange={(e) => onChange(e.target.value)}/>
            </div>
        </div>);
};
export default OrdersSearch;
