import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Wallet, Users, Ticket, Settings, Menu, X, LogOut, BadgeIndianRupee } from "lucide-react";
import { clearPortalSession } from "../../shared/services/authStorage";
import brandLogoWhite from "../../assets/logo.png";
import "./Sidebar.css";
const Sidebar = ({ mobileOpen = false, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const isManufacturerRoute = location.pathname.startsWith("/manufacturer");
    const handleLogout = () => {
        clearPortalSession(isManufacturerRoute ? "manufacturer" : "admin");
        navigate(isManufacturerRoute ? "/login/manufacturer" : "/login/admin");
    };
    const adminMenuItems = [
        {
            title: "Dashboard",
            path: "/master",
            icon: <LayoutDashboard size={20}/>
        },
        {
            title: "Catalog",
            path: "/master/catalogue",
            icon: <ShoppingBag size={20}/>
        },
        {
            title: "Orders",
            path: "/master/orders",
            icon: <ShoppingCart size={20}/>
        },
        {
            title: "Wallet",
            path: "/master/wallet",
            icon: <Wallet size={20}/>
        },
        {
            title: "Adjustments",
            path: "/master/adjustments",
            icon: <BadgeIndianRupee size={20}/>
        },
        {
            title: "Users",
            path: "/master/users",
            icon: <Users size={20}/>
        },
        {
            title: "Coupons",
            path: "/master/coupons",
            icon: <Ticket size={20}/>
        },
        {
            title: "Settings",
            path: "/master/settings",
            icon: <Settings size={20}/>
        }
    ];
    const manufacturerMenuItems = [
        {
            title: "Dashboard",
            path: "/manufacturer",
            icon: <LayoutDashboard size={20}/>
        },
        {
            title: "Orders",
            path: "/manufacturer/orders",
            icon: <ShoppingCart size={20}/>
        },
        {
            title: "Settlements",
            path: "/manufacturer/settlements",
            icon: <Wallet size={20}/>
        },
        {
            title: "Other adjustments",
            path: "/manufacturer/adjustments",
            icon: <BadgeIndianRupee size={20}/>
        }
    ];
    const menuItems = isManufacturerRoute ? manufacturerMenuItems : adminMenuItems;

    const sidebarClasses = [
        "sidebar",
        collapsed ? "collapsed" : "",
        mobileOpen ? "mobile-open" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            {mobileOpen && (
                <div className="sidebar-backdrop" onClick={onClose} />
            )}
            <aside className={sidebarClasses}>
                <div className="sidebar-header">
                    <div className="logo flex items-center gap-2">
                        <img src={brandLogoWhite} alt="H&S Brand Logo" className="sidebar-brand-img h-8 object-contain" onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}/>
                        <span className="font-bold text-white tracking-widest uppercase text-sm">H&S Portal</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="toggle-btn hidden md:flex" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
                            {collapsed ? <Menu size={20}/> : <X size={20}/>}
                        </button>
                        <button className="toggle-btn flex md:hidden" onClick={onClose} aria-label="Close Menu">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            end={item.path === "/master" || item.path === "/manufacturer"} 
                            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                            onClick={() => {
                                if (onClose) onClose();
                            }}
                        >
                            {item.icon}
                            {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => {
                        if (onClose) onClose();
                        handleLogout();
                    }}>
                        <LogOut size={20}/>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};
export default Sidebar;
