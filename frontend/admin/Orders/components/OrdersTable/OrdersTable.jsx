import { useState } from "react";
import "./OrdersTable.css";
import { ExternalLink, CheckCircle2, XCircle, Eye, Truck, Clock, CreditCard, Tag, Copy, Check, MapPin } from "lucide-react";
import ShippingAddressModal, { copyToClipboard } from "../ShippingAddressModal/ShippingAddressModal";
const OrdersTable = ({ orders, onMoveToShipping, onUpdateTracking, onMoveToCompleted, onInitiateCancel, onAcceptCancelRequest, onRejectCancelRequest, onViewCancelReason, onViewOrderDetails, onViewPriceAdjRequest, onMarkAsPaid }) => {
    const [selectedAddressOrder, setSelectedAddressOrder] = useState(null);
    const [copiedOrderId, setCopiedOrderId] = useState(null);
    const handleQuickCopy = async (address, orderId) => {
        const success = await copyToClipboard(address);
        if (success) {
            setCopiedOrderId(orderId);
            setTimeout(() => setCopiedOrderId(null), 1800);
        }
    };
    return (<div className="orders-table-container">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th className="col-order-id">ORDER ID</th>
                        <th className="col-date">ORDERED DATE</th>
                        <th className="col-item-name">ITEMS</th>
                        <th className="col-size">SIZE</th>
                        <th className="col-color">COLOR</th>
                        <th className="col-user">ORDERED BY</th>
                        <th className="col-fullname">FULL NAME</th>
                        <th className="col-phone">PHONE NUMBER</th>
                        <th className="col-country">COUNTRY</th>
                        <th className="col-address">SHIPPING ADDRESS</th>
                        <th className="col-amount">AMOUNT PAID</th>
                        <th className="col-gst-collected">GST COLLECTED</th>
                        <th className="col-mfg-payment">MFG PAYMENT</th>
                        <th className="col-price-adj">PRICE ADJUSTMENT</th>
                        <th className="col-mfg-paid-status">AMOUNT PAID TO MFG</th>
                        <th className="col-shipper">SHIPPER NAME</th>
                        <th className="col-tracking">TRACKING ID</th>
                        <th className="col-link">TRACKING LINK</th>
                        <th className="col-status">STATUS</th>
                        <th className="col-view-order">VIEW ORDER</th>
                        <th className="col-cancel-reason">CANCEL REASON</th>
                        <th className="col-coupon-applied">COUPONS APPLIED</th>
                        <th className="col-coupon-discount">COUPON DISCOUNT</th>
                        <th className="col-actions">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((item) => {
            const statusClass = item.status.toLowerCase().replace(/\s+/g, "-");
            const isNoneShipper = !item.shipperName || item.shipperName === "None";
            const isNoneTracking = !item.trackingId || item.trackingId === "None";
            const isNoneLink = !item.trackingLink || item.trackingLink === "None";
            const isPaid = item.mfgPaymentStatus === "Paid";
            const adjStatus = item.priceAdjustmentStatus || "None";
            return (<tr key={item.id}>
                                <td className="col-order-id-val">{item.id}</td>
                                <td className="col-text">{item.orderedDate}</td>
                                <td className="col-item-name-val">
                                    {item.items && item.items.length > 1 ? (<div className="item-name-stack multi-items-container">
                                            <div className="multi-items-badge-container">
                                                <span className="multi-items-count-badge">
                                                    {item.items.length} Products
                                                </span>
                                            </div>
                                            <div className="multi-items-list">
                                                {item.items.map((prod, pIdx) => (<div key={prod.id || pIdx} className="multi-item-entry">
                                                        <span className="user-item-name">
                                                            <strong className="item-qty-tag">{prod.quantity || 1}x</strong> {prod.name}
                                                        </span>
                                                        <span className="mfg-item-subtext">
                                                            Mfg: {prod.mfgItemName || prod.productDetails?.mfgProductName || prod.name}
                                                        </span>
                                                    </div>))}
                                            </div>
                                        </div>) : (<div className="item-name-stack">
                                            <span className="user-item-name">{item.itemName}</span>
                                            <span className="mfg-item-subtext">
                                                Mfg: {item.mfgItemName || item.productDetails?.mfgProductName || `MFG-${item.id}`}
                                            </span>
                                        </div>)}
                                </td>
                                <td className="col-text font-semibold">
                                    {item.items && item.items.length > 1 ? (<div className="multi-props-stack">
                                            {item.items.map((prod, pIdx) => (<span key={pIdx} className="prop-badge size-badge" title={`${prod.name}: ${prod.size}`}>
                                                    {prod.size || "—"}
                                                </span>))}
                                        </div>) : (item.size)}
                                </td>
                                <td className="col-text">
                                    {item.items && item.items.length > 1 ? (<div className="multi-props-stack">
                                            {item.items.map((prod, pIdx) => (<span key={pIdx} className="prop-badge color-badge" title={`${prod.name}: ${prod.color}`}>
                                                    {prod.color || "—"}
                                                </span>))}
                                        </div>) : (item.color)}
                                </td>
                                <td className="col-user-val">{item.orderedBy}</td>
                                <td className="col-text font-medium">{item.fullName}</td>
                                <td className="col-text">{item.phone}</td>
                                <td className="col-text font-medium">{item.country}</td>
                                <td className="col-address">
                                    <div className="shipping-address-cell">
                                        <button type="button" className="address-preview-btn" onClick={() => setSelectedAddressOrder(item)} title="Click to view full shipping address in popup">
                                            <MapPin size={13} className="address-pin-icon"/>
                                            <span className="address-snippet">
                                                {item.shippingAddress || "—"}
                                            </span>
                                        </button>

                                        {item.shippingAddress && item.shippingAddress !== "N/A" && (<button type="button" className={`btn-address-quick-copy ${copiedOrderId === item.id ? "copied" : ""}`} onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCopy(item.shippingAddress, item.id);
                    }} title={copiedOrderId === item.id ? "Address copied to clipboard!" : "Copy shipping address directly"} aria-label="Copy shipping address">
                                                {copiedOrderId === item.id ? (<Check size={12} className="copy-check-icon"/>) : (<Copy size={12}/>)}
                                            </button>)}
                                    </div>
                                </td>
                                <td className="col-amount-val">₹{item.amountPaid.toFixed(2)}</td>
                                <td className="col-gst-collected-val">
                                    ₹{(item.gstCollected ?? item.taxPrice ?? 0).toFixed(2)}
                                </td>
                                <td className="col-mfg-payment-val">
                                    ₹{typeof item.mfgPayment === "number" ? item.mfgPayment.toFixed(2) : item.mfgPayment}
                                </td>

                                {/* PRICE ADJUSTMENT COLUMN */}
                                <td className="col-price-adj-cell">
                                    {adjStatus === "Pending Approval" && (<button className="btn-review-adj-req" onClick={() => onViewPriceAdjRequest(item)} title="Click to review reason & Accept / Reject price adjustment">
                                            <Clock size={12}/>
                                            <span>Review Adj (+₹{item.priceAdjustmentAmount})</span>
                                        </button>)}
                                    {adjStatus === "Approved" && (<span className="badge-adj-approved" title={`Approved Adjustment: ₹${item.priceAdjustmentAmount}`}>
                                            <CheckCircle2 size={12}/>
                                            <span>Approved (+₹{item.priceAdjustmentAmount})</span>
                                        </span>)}
                                    {adjStatus === "Rejected" && (<span className="badge-adj-rejected" title="Rejected adjustment request">
                                            <XCircle size={12}/>
                                            <span>Rejected</span>
                                        </span>)}
                                    {adjStatus === "None" && <span className="text-none">—</span>}
                                </td>

                                {/* AMOUNT PAID TO MFG STATUS COLUMN [PAID / UNPAID] */}
                                <td className="col-mfg-paid-cell">
                                    {item.status === "Cancelled" ? (<span className="mfg-paid-badge excluded" title="Order cancelled — excluded from manufacturer payouts" style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                            Excluded
                                        </span>) : isPaid ? (<span className="mfg-paid-badge paid" title={`Paid on ${item.mfgPaidDate || "Recently"}`}>
                                            <CheckCircle2 size={12}/>
                                            <span>Paid</span>
                                        </span>) : (<button className="btn-mark-paid" onClick={() => onMarkAsPaid(item)} title="Click to mark as paid & credit Manufacturer Wallet / update Admin Wallet">
                                            <CreditCard size={12}/>
                                            <span>Mark as Paid</span>
                                        </button>)}
                                </td>

                                <td className="col-shipper">
                                    {isNoneShipper ? (<span className="text-none">—</span>) : (<span className="shipper-text">{item.shipperName}</span>)}
                                </td>

                                <td className="col-tracking">
                                    {isNoneTracking ? (<span className="text-none">—</span>) : (<span className="tracking-badge">{item.trackingId}</span>)}
                                </td>

                                <td className="col-link">
                                    {isNoneLink ? (<span className="text-none">—</span>) : (<a href={item.trackingLink} target="_blank" rel="noopener noreferrer" className="track-link-btn">
                                            <span>Track</span>
                                            <ExternalLink size={12}/>
                                        </a>)}
                                </td>

                                <td>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                        <span className={`order-status-badge ${statusClass}`}>
                                            <span className="status-dot"></span>
                                            {item.status === "Completed" ? "Delivered" : item.status}
                                        </span>
                                        {(item.status === "Completed" || item.status === "Delivered") && (<span className="completed-date-subtext" style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                                                Delivered: {item.completedDate || item.orderedDate}
                                            </span>)}
                                    </div>
                                </td>

                                {/* VIEW ORDER Column with Eye Icon button */}
                                <td className="col-view-order-cell">
                                    <button type="button" className="btn-view-order-details" title="View MFG Product Specs, Front/Back View & Neck Tag Artwork" onClick={() => onViewOrderDetails(item)}>
                                        <Eye size={14}/>
                                        <span>View Order</span>
                                    </button>
                                </td>

                                {/* Cancel Reason Column with View Reason button */}
                                <td className="col-cancel-reason-cell">
                                    {(item.status === "Cancel Requested" || item.status === "Cancelled") ? (<button type="button" className="btn-view-reason" title="View Cancellation Reason Details" onClick={() => onViewCancelReason(item)}>
                                            <Eye size={14}/>
                                            <span>View Reason</span>
                                        </button>) : (<span className="text-none">—</span>)}
                                </td>

                                {/* Coupons Applied Column */}
                                <td className="col-coupon-applied-cell">
                                    {item.couponApplied || item.couponCode ? (<span className="coupon-applied-badge applied" title={`Coupon: ${item.couponCode || 'Applied'}`}>
                                            <Tag size={12}/>
                                            <span>{item.couponCode ? `Yes (${item.couponCode})` : "Yes"}</span>
                                        </span>) : (<span className="coupon-applied-badge not-applied">
                                            <span>No</span>
                                        </span>)}
                                </td>

                                {/* Coupon Discount Column */}
                                <td className="col-coupon-discount-cell">
                                    {typeof item.couponDiscount === "number" && item.couponDiscount > 0 ? (<span className="coupon-discount-val">
                                            ₹{item.couponDiscount.toFixed(2)}
                                        </span>) : (<span className="text-none">₹0.00</span>)}
                                </td>

                                {/* Action column for Admin */}
                                <td>
                                    <div className="order-actions-cell">
                                        {item.status === "In Progress" && (<>
                                                <button className="action-btn-status btn-shipping" title="Move from In Progress to Shipping" onClick={() => onMoveToShipping(item)}>
                                                    <Truck size={13}/>
                                                    <span>Move to Shipping</span>
                                                </button>
                                                <button className="action-btn-status btn-cancel" title="Cancel Order" onClick={() => onInitiateCancel(item)}>
                                                    <XCircle size={13}/>
                                                    <span>Cancel Order</span>
                                                </button>
                                            </>)}

                                        {item.status === "Shipping" && (<>
                                                <button className="action-btn-status btn-shipping" title="Update Shipper Name, Tracking ID & Link while keeping order in Shipping status" onClick={() => onUpdateTracking(item)}>
                                                    <Truck size={13}/>
                                                    <span>Update Tracking</span>
                                                </button>
                                                <button className="action-btn-status btn-complete" title="Move from Shipping to Delivered" onClick={() => onMoveToCompleted(item)}>
                                                    <CheckCircle2 size={13}/>
                                                    <span>Move to Delivered</span>
                                                </button>
                                                <button className="action-btn-status btn-cancel" title="Cancel Order" onClick={() => onInitiateCancel(item)}>
                                                    <XCircle size={13}/>
                                                    <span>Cancel Order</span>
                                                </button>
                                            </>)}

                                        {item.status === "Cancel Requested" && (<>
                                                <button className="action-btn-status btn-accept-cancel" title="Accept Cancellation Request" onClick={() => onAcceptCancelRequest(item)}>
                                                    <CheckCircle2 size={13}/>
                                                    <span>Accept Cancel</span>
                                                </button>
                                                <button className="action-btn-status btn-reject-cancel" title="Reject Cancellation Request" onClick={() => onRejectCancelRequest(item)}>
                                                    <XCircle size={13}/>
                                                    <span>Reject Cancel</span>
                                                </button>
                                            </>)}

                                        {(item.status === "Completed" || item.status === "Delivered") && (<span className="status-completed-text">
                                                <CheckCircle2 size={14}/> Delivered
                                            </span>)}

                                        {item.status === "Cancelled" && (<span className="status-cancelled-text">
                                                <XCircle size={14}/> Cancelled
                                            </span>)}
                                    </div>
                                </td>
                            </tr>);
        })}
                </tbody>
            </table>

            {selectedAddressOrder && (<ShippingAddressModal open={!!selectedAddressOrder} order={selectedAddressOrder} onClose={() => setSelectedAddressOrder(null)}/>)}
        </div>);
};
export default OrdersTable;
