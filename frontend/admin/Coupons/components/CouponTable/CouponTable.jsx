import { useState } from "react";
import "./CouponTable.css";
import { Copy, Check, Lock, Eye, Trash2, Power, TicketPercent } from "lucide-react";
const CouponTable = ({ coupons, isLoading = false, onToggleStatus, onDelete, onOpenCreate }) => {
    const [copiedId, setCopiedId] = useState(null);
    const handleCopy = (id, code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return (<div className="coupon-table-container">
            <table className="coupon-table">
                <thead>
                    <tr>
                        <th className="col-id">COUPON ID</th>
                        <th className="col-code">COUPON NAME</th>
                        <th className="col-type">TYPE</th>
                        <th className="col-discount">DISCOUNT</th>
                        <th className="col-spend">MIN SPEND</th>
                        <th className="col-usage">USAGE</th>
                        <th className="col-expiry">EXPIRY DATE</th>
                        <th className="col-status">STATUS</th>
                        <th className="col-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? ([1, 2, 3, 4].map((i) => (<tr key={`skeleton-${i}`} className="coupon-skeleton-row">
                                <td><div className="skeleton-line w-16"/></td>
                                <td><div className="skeleton-line w-24"/></td>
                                <td><div className="skeleton-line w-16"/></td>
                                <td><div className="skeleton-line w-20"/></td>
                                <td><div className="skeleton-line w-16"/></td>
                                <td><div className="skeleton-line w-20"/></td>
                                <td><div className="skeleton-line w-24"/></td>
                                <td><div className="skeleton-line w-16"/></td>
                                <td><div className="skeleton-line w-12"/></td>
                            </tr>))) : coupons.length === 0 ? (<tr>
                            <td colSpan={9} className="coupon-empty-cell">
                                <div className="coupon-empty-content">
                                    <div className="coupon-empty-icon-wrap">
                                        <TicketPercent size={32}/>
                                    </div>
                                    <h4 className="coupon-empty-title">No coupons found</h4>
                                    <p className="coupon-empty-desc">
                                        No discount coupons matched your criteria or none have been created yet.
                                    </p>
                                    {onOpenCreate && (<button className="coupon-empty-btn" onClick={onOpenCreate}>
                                            + Create New Coupon
                                        </button>)}
                                </div>
                            </td>
                        </tr>) : (coupons.map((item) => {
            const isPercentage = item.discountType === "Percentage";
            const isPrivate = item.type === "Private";
            const statusClass = item.status.toLowerCase();
            return (<tr key={item.id}>
                                <td className="col-id-val">{item.id}</td>
                                <td>
                                    <div className="code-cell">
                                        <span className="code-badge">{item.code}</span>
                                        <button className="copy-btn" title="Copy Coupon Code" onClick={() => handleCopy(item.id, item.code)}>
                                            {copiedId === item.id ? (<Check size={14} className="copied-icon"/>) : (<Copy size={14}/>)}
                                        </button>
                                    </div>
                                </td>

                                {/* Coupon Type Badge (Public vs Private) */}
                                <td>
                                    <span className={`coupon-type-badge ${isPrivate ? "private" : "public"}`}>
                                        {isPrivate ? <Lock size={12}/> : <Eye size={12}/>}
                                        <span>{item.type}</span>
                                    </span>
                                </td>

                                {/* Coupon Discount */}
                                <td>
                                    <span className="discount-val">
                                        {isPercentage ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
                                    </span>
                                </td>

                                <td className="col-text font-medium">
                                    {item.minSpend > 0 ? `₹${item.minSpend}` : "None"}
                                </td>

                                <td className="col-text font-medium">
                                    {item.usageLimit > 0 ? (<span>{item.usageCount} / {item.usageLimit}</span>) : (<span className="unlimited-usage-tag" style={{ color: "#2563EB", fontWeight: 600 }}>
                                            {item.usageCount} / ∞ (Unlimited)
                                        </span>)}
                                </td>

                                <td className="col-text">{item.expiryDate}</td>

                                <td>
                                    <span className={`coupon-status-badge ${statusClass}`}>
                                        <span className="status-dot"></span>
                                        {item.status}
                                    </span>
                                </td>

                                <td>
                                    <div className="coupon-actions">
                                        <button className="action-btn toggle-btn" title={item.status === "Active" ? "Disable Coupon" : "Activate Coupon"} onClick={() => onToggleStatus?.(item.id)}>
                                            <Power size={14}/>
                                        </button>
                                        <button className="action-btn delete-btn" title="Delete Coupon" onClick={() => onDelete?.(item.id)}>
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>);
        }))}
                </tbody>
            </table>
        </div>);
};
export default CouponTable;
