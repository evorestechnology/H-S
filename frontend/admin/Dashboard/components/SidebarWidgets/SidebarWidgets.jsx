import { useNavigate } from "react-router-dom";
import "./SidebarWidgets.css";
import { Plus, Users, ShoppingBag, Wallet, Settings } from "lucide-react";
export const QuickActionsWidget = () => {
    const navigate = useNavigate();
    return (<div className="widget-card quick-actions">
            <h3 className="widget-title">Quick Actions</h3>
            <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => navigate("/catalog")} title="Manage Collection Drops in Catalog">
                    <div className="action-icon bg-primary-light text-primary"><Plus size={20}/></div>
                    <span>Add Drop</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/catalog")} title="Create or Manage Products in Catalog">
                    <div className="action-icon bg-primary-light text-primary"><Plus size={20}/></div>
                    <span>Add Product</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/orders")} title="View & Process Customer Orders">
                    <div className="action-icon bg-secondary-light text-secondary"><ShoppingBag size={20}/></div>
                    <span>Orders</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/users")} title="View Platform Users & Accounts">
                    <div className="action-icon bg-info-light text-info"><Users size={20}/></div>
                    <span>Users</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/wallet")} title="Financial Overview & Balances">
                    <div className="action-icon bg-success-light text-success"><Wallet size={20}/></div>
                    <span>Wallet</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/settings")} title="Configure System Settings">
                    <div className="action-icon bg-warning-light text-warning"><Settings size={20}/></div>
                    <span>Settings</span>
                </button>
            </div>
        </div>);
};
export const RecentActivityWidget = ({ activities, isLoading }) => {
    const formatActivityTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return isToday ? timeStr : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${timeStr}`;
        }
        catch (e) {
            return timestamp;
        }
    };
    return (<div className="widget-card">
            <h3 className="widget-title">Recent Activity</h3>
            <div className="timeline">
                {isLoading ? (Array.from({ length: 4 }).map((_, i) => <div key={i} className="timeline-skeleton"/>)) : activities.length === 0 ? (<div className="widget-empty">No recent platform activity logged.</div>) : (activities.map((activity) => (<div key={activity.id} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <p className="timeline-message">{activity.message}</p>
                                <span className="timeline-time">
                                    {formatActivityTime(activity.timestamp)}
                                </span>
                            </div>
                        </div>)))}
            </div>
        </div>);
};
export const NotificationsWidget = ({ notifications, isLoading }) => {
    const navigate = useNavigate();
    const handleNotificationClick = (notif) => {
        if (notif.type === 'low_inventory') {
            navigate("/catalog");
        }
        else if (notif.type === 'new_order' || notif.type === 'withdrawal_request') {
            navigate("/orders");
        }
        else if (notif.type === 'new_user') {
            navigate("/users");
        }
    };
    return (<div className="widget-card">
            <div className="widget-header">
                <h3 className="widget-title" style={{ marginBottom: 0 }}>Notifications</h3>
                {notifications.filter(n => !n.isRead).length > 0 && (<span className="notification-badge">{notifications.filter(n => !n.isRead).length} new</span>)}
            </div>
            <div className="notification-list">
                {isLoading ? (Array.from({ length: 3 }).map((_, i) => <div key={i} className="notification-skeleton"/>)) : notifications.length === 0 ? (<div className="widget-empty">No active notifications. System healthy.</div>) : (notifications.map(notif => (<div key={notif.id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`} onClick={() => handleNotificationClick(notif)} title="Click to view details" style={{ cursor: "pointer" }}>
                            <div className={`notification-indicator ${notif.type}`}></div>
                            <div className="notification-content">
                                <p>{notif.message}</p>
                                <span>{new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>)))}
            </div>
        </div>);
};
