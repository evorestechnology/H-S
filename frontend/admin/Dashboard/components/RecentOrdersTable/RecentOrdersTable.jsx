import { useNavigate } from "react-router-dom";
import { Eye, Truck, Clock, ExternalLink, Tag } from "lucide-react";
import "./RecentOrdersTable.css";
const RecentOrdersTable = ({ orders, isLoading }) => {
    const navigate = useNavigate();
    const getStatusClass = (status) => {
        switch (status) {
            case "Completed":
            case "Delivered":
                return "badge-success";
            case "Shipping":
                return "badge-info";
            case "In Progress":
                return "badge-primary";
            case "Pending":
                return "badge-warning";
            case "Cancel Requested":
            case "Cancelled":
                return "badge-danger";
            default:
                return "badge-secondary";
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };
    return (<div className="orders-table-card">
            <div className="orders-table-header">
                <h2 className="chart-title">Recent Orders</h2>
                <button className="btn-view-all" onClick={() => navigate("/orders")}>
                    View All Orders
                </button>
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status &amp; Tracking</th>
                            <th>Date</th>
                            <th>Coupons Applied</th>
                            <th>Coupon Discount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
        // Skeleton loading rows
        Array.from({ length: 4 }).map((_, i) => (<tr key={i} className="skeleton-row">
                                    <td><div className="skeleton-td"></div></td>
                                    <td><div className="skeleton-td"></div></td>
                                    <td><div className="skeleton-td"></div></td>
                                    <td><div className="skeleton-td short"></div></td>
                                    <td><div className="skeleton-td short"></div></td>
                                    <td><div className="skeleton-td short"></div></td>
                                    <td><div className="skeleton-td"></div></td>
                                    <td><div className="skeleton-td short"></div></td>
                                    <td><div className="skeleton-td short"></div></td>
                                    <td><div className="skeleton-td circle"></div></td>
                                </tr>))) : orders.length === 0 ? (<tr>
                                <td colSpan={10} className="empty-table">No recent orders found.</td>
                            </tr>) : (orders.map(order => {
            const hasTracking = order.trackingId && order.trackingId !== "None";
            const isTrackingLink = order.trackingLink && order.trackingLink !== "None" && order.trackingLink.startsWith("http");
            const hasPriceAdj = order.priceAdjustmentStatus === "Pending Approval";
            return (<tr key={order.id}>
                                        <td className="font-medium text-secondary">{order.id}</td>
                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-avatar">
                                                    {order.customer.charAt(0)}
                                                </div>
                                                <span className="font-medium">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td>{order.product}</td>
                                        <td className="font-semibold text-secondary">
                                            <div>₹{order.amount.toFixed(2)}</div>
                                            {hasPriceAdj && (<div className="adj-pill pending" title={`Manufacturer requested price adjustment of ₹${order.priceAdjustmentAmount}. Click to review.`} onClick={() => navigate(`/orders?orderId=${order.id}`)}>
                                                    <Clock size={11}/>
                                                    <span>+₹{order.priceAdjustmentAmount} Adj</span>
                                                </div>)}
                                        </td>
                                        <td>{order.payment}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                                                <span className={`badge ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {hasTracking && (isTrackingLink ? (<a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="tracking-pill" title={`Track on ${order.shipperName || 'Carrier'}`}>
                                                            <Truck size={12} style={{ color: "#2563EB" }}/>
                                                            <span>{order.shipperName ? `${order.shipperName}: ` : ""}{order.trackingId}</span>
                                                            <ExternalLink size={10}/>
                                                        </a>) : (<span className="tracking-pill" title={`Carrier: ${order.shipperName || 'Standard'}`}>
                                                            <Truck size={12} style={{ color: "#2563EB" }}/>
                                                            <span>{order.shipperName ? `${order.shipperName}: ` : ""}{order.trackingId}</span>
                                                        </span>))}
                                            </div>
                                        </td>
                                        <td className="text-light">{formatDate(order.date)}</td>
                                        <td>
                                            {order.couponApplied || order.couponCode ? (<span className="recent-coupon-badge applied" title={`Coupon: ${order.couponCode || 'Applied'}`}>
                                                    <Tag size={11}/>
                                                    <span>{order.couponCode ? `Yes (${order.couponCode})` : "Yes"}</span>
                                                </span>) : (<span className="recent-coupon-badge not-applied">No</span>)}
                                        </td>
                                        <td>
                                            {typeof order.couponDiscount === "number" && order.couponDiscount > 0 ? (<span className="recent-coupon-discount-val">
                                                    ₹{order.couponDiscount.toFixed(2)}
                                                </span>) : (<span className="text-light">₹0.00</span>)}
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-icon btn-sm" title="View Order Details" onClick={() => navigate(`/orders?orderId=${order.id}`)}>
                                                <Eye size={16}/>
                                            </button>
                                        </td>
                                    </tr>);
        }))}
                    </tbody>
                </table>
            </div>
        </div>);
};
export default RecentOrdersTable;
