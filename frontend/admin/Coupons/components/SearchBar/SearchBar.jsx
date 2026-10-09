import "./SearchBar.css";
import { Search } from "lucide-react";
const filterOptions = ["All", "Public", "Private", "Active", "Expired"];
const SearchBar = ({ value, onChange, activeFilter, onFilterChange }) => {
    return (<div className="coupons-toolbar">
            <div className="coupons-filter">
                {filterOptions.map((filter) => (<button key={filter} className={activeFilter === filter
                ? "filter-btn active"
                : "filter-btn"} onClick={() => onFilterChange(filter)}>
                        {filter}
                    </button>))}
            </div>

            <div className="coupons-search">
                <Search size={18}/>
                <input type="text" placeholder="Search coupon name or code..." value={value} onChange={(e) => onChange(e.target.value)}/>
            </div>
        </div>);
};
export default SearchBar;
