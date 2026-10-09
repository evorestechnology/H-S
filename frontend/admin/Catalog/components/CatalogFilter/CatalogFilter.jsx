import { Search, RotateCcw } from "lucide-react";
import "./CatalogFilter.css";
import { DropStatus } from "../../types";
import { useCategories } from "../../../../shared/services/categoryService";
const CatalogFilter = ({ search, onSearchChange, statusFilter, onStatusChange, categoryFilter, onCategoryChange, sortOrder, onSortChange, onReset }) => {
    const availableCategories = useCategories();
    return (<div className="catalog-toolbar">
            <div className="catalog-search">
                <Search size={18} className="catalog-search-icon"/>
                <input type="text" className="catalog-search-input" placeholder="Search product or drop..." value={search} onChange={(e) => onSearchChange(e.target.value)}/>
            </div>
            
            <div className="catalog-filters">
                <select className="catalog-select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
                    <option value="All Status">All Status</option>
                    {Object.values(DropStatus).map(status => (<option key={status} value={status}>{status}</option>))}
                </select>

                <select className="catalog-select" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="All Categories">All Categories</option>
                    {availableCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>

                <select className="catalog-select" value={sortOrder} onChange={(e) => onSortChange(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>

                <button className="catalog-reset-btn" onClick={onReset}>
                    <RotateCcw size={16}/>
                    <span>Reset</span>
                </button>
            </div>
        </div>);
};
export default CatalogFilter;
