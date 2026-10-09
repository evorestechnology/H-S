import { useNavigate } from "react-router-dom";
import { PackageOpen, ShoppingBag } from "lucide-react";
import "./DashboardWidgets.css";
export const LatestDropsWidget = ({ drops, isLoading }) => {
    const navigate = useNavigate();
    return (<div className="widget-card">
            <div className="widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ marginBottom: 0 }}>Latest Product Drops</h3>
                <button className="btn-view-all" onClick={() => navigate("/catalog")} style={{ fontSize: "12px", background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                    View Catalog
                </button>
            </div>
            <div className="widget-list">
                {isLoading ? (Array.from({ length: 3 }).map((_, i) => <div key={i} className="widget-skeleton-row"/>)) : drops.length === 0 ? (<div className="widget-empty">No collection drops created yet.</div>) : (drops.map(drop => (<div key={drop.id} className="widget-item" onClick={() => navigate("/catalog")} style={{ cursor: "pointer" }}>
                            {drop.image ? (<img src={drop.image} alt={drop.name} className="widget-img-sq" onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback)
                        fallback.style.display = "flex";
                }}/>) : null}
                            <div className="widget-img-placeholder" style={{ display: drop.image ? "none" : "flex" }}>
                                <PackageOpen size={20}/>
                            </div>
                            <div className="widget-info">
                                <h4>{drop.name}</h4>
                                <p>{drop.productsCount} Products • {drop.launchDate}</p>
                            </div>
                            <span className={`badge ${drop.status === 'Live' ? 'badge-success' : 'badge-warning'}`}>
                                {drop.status}
                            </span>
                        </div>)))}
            </div>
        </div>);
};
export const TopProductsWidget = ({ products, isLoading }) => {
    const navigate = useNavigate();
    return (<div className="widget-card">
            <h3 className="widget-title">Top Selling Products</h3>
            <div className="widget-list">
                {isLoading ? (Array.from({ length: 3 }).map((_, i) => <div key={i} className="widget-skeleton-row"/>)) : products.length === 0 ? (<div className="widget-empty">No products found in store.</div>) : (products.map(product => (<div key={product.id} className="widget-item" onClick={() => navigate("/catalog")} style={{ cursor: "pointer" }}>
                            {product.image ? (<img src={product.image} alt={product.name} className="widget-img-sq" onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback)
                        fallback.style.display = "flex";
                }}/>) : null}
                            <div className="widget-img-placeholder" style={{ display: product.image ? "none" : "flex" }}>
                                <ShoppingBag size={20}/>
                            </div>
                            <div className="widget-info">
                                <h4>{product.name}</h4>
                                <p>{product.category}</p>
                            </div>
                            <div className="widget-stats-right">
                                <span className="text-secondary font-semibold">
                                    ₹{product.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-light">{product.unitsSold} sold</span>
                            </div>
                        </div>)))}
            </div>
        </div>);
};
export const LowStockWidget = ({ products, isLoading }) => {
    const navigate = useNavigate();
    return (<div className="widget-card">
            <h3 className="widget-title">Low Stock Alerts</h3>
            <div className="widget-list">
                {isLoading ? (Array.from({ length: 3 }).map((_, i) => <div key={i} className="widget-skeleton-row"/>)) : products.length === 0 ? (<div className="widget-empty">All inventory levels are healthy.</div>) : (products.map(product => (<div key={product.id} className="widget-item">
                            <div className="widget-info">
                                <h4>{product.name}</h4>
                                <p className={product.remainingStock === 0 ? "text-danger" : "text-warning"}>
                                    {product.remainingStock} remaining
                                </p>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/catalog")} title="Manage product inventory in catalog">
                                Restock
                            </button>
                        </div>)))}
            </div>
        </div>);
};
const getUserInitials = (name) => {
    if (!name)
        return "U";
    const cleaned = name.replace(/^@/, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
};
const getAvatarGradient = (str) => {
    const gradients = [
        "linear-gradient(135deg, #10B981, #059669)", // Emerald
        "linear-gradient(135deg, #6366F1, #4F46E5)", // Indigo
        "linear-gradient(135deg, #0EA5E9, #0284C7)", // Sky
        "linear-gradient(135deg, #F59E0B, #D97706)", // Amber
        "linear-gradient(135deg, #8B5CF6, #7C3AED)", // Purple
        "linear-gradient(135deg, #EC4899, #DB2777)" // Pink
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
};
export const RecentUsersWidget = ({ users, isLoading }) => {
    const navigate = useNavigate();
    return (<div className="widget-card">
            <div className="widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="widget-title" style={{ marginBottom: 0 }}>Recent Users</h3>
                <button className="btn-view-all" onClick={() => navigate("/users")} style={{ fontSize: "12px", background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                    View All
                </button>
            </div>
            <div className="widget-list">
                {isLoading ? (Array.from({ length: 3 }).map((_, i) => <div key={i} className="widget-skeleton-row"/>)) : users.length === 0 ? (<div className="widget-empty">No recent users found.</div>) : (users.map((user) => {
            const initials = getUserInitials(user.username || user.email);
            const gradient = getAvatarGradient(user.username || user.email || user.id);
            return (<div key={user.id} className="widget-item" onClick={() => navigate("/users")} style={{ cursor: "pointer" }}>
                                {user.profileImage ? (<img src={user.profileImage} alt={user.username} className="widget-img-circle" onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const sibling = e.currentTarget.nextElementSibling;
                        if (sibling)
                            sibling.style.display = "flex";
                    }}/>) : null}
                                <div className="widget-avatar-fallback" style={{
                    background: gradient,
                    display: user.profileImage ? "none" : "flex"
                }}>
                                    {initials}
                                </div>
                                <div className="widget-info">
                                    <h4>@{user.username}</h4>
                                    <p>{user.email}</p>
                                </div>
                                <span className={`badge ${user.status === "Active" ? "badge-success" : "badge-secondary"}`}>
                                    {user.status}
                                </span>
                            </div>);
        }))}
            </div>
        </div>);
};
