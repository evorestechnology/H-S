import "./SearchBar.css";
import { Search } from "lucide-react";
const filterOptions = ["All Users", "Active", "Live", "Inactive", "Blocked"];
const SearchBar = ({ value, onChange, activeFilter, onFilterChange }) => {
    return (<div className="users-toolbar">
            <div className="users-filter">
                {filterOptions.map((filter) => (<button key={filter} className={activeFilter === filter
                ? "filter-btn active"
                : "filter-btn"} onClick={() => onFilterChange(filter)}>
                        {filter}
                    </button>))}
            </div>

            <div className="users-search">
                <Search size={18}/>
                <input type="text" placeholder="Search name, username, email, ID, country..." value={value} onChange={(e) => onChange(e.target.value)}/>
            </div>
        </div>);
};
export default SearchBar;
