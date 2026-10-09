import "./OrdersHeader.css";
import { Plus, RefreshCw } from "lucide-react";
const OrdersHeader = ({ onNewOrder, onRefresh, isRefreshing = false }) => {
    return (<div className="orders-header">
            <div className="orders-header-title">
                <h1>Order Tracking</h1>
                <p>Manage and update customer order fulfillment statuses</p>
            </div>

            <div className="orders-header-actions">
                {onRefresh && (<button className="refresh-orders-btn" onClick={onRefresh} disabled={isRefreshing} title="Sync latest orders and tracking updates from server">
                        <RefreshCw size={15} className={isRefreshing ? "spin-icon" : ""}/>
                        <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
                    </button>)}

                {onNewOrder && (<button className="new-order-btn" onClick={onNewOrder}>
                        <Plus size={16}/>
                        <span>New Order</span>
                    </button>)}
            </div>
        </div>);
};
export default OrdersHeader;
