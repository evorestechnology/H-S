import React from "react";
import { IndianRupee, CheckCircle2, XCircle, X } from "lucide-react";
import "./ViewPriceAdjustmentModal.css";
export const ViewPriceAdjustmentModal = ({ open, order, onClose, onAccept, onReject }) => {
    if (!open || !order)
        return null;
    const requestedAmount = order.priceAdjustmentAmount || 0;
    const newTotalMfgPayment = order.mfgPayment + requestedAmount;
    return (<div className="view-price-adj-modal-overlay" onClick={onClose}>
            <div className="view-price-adj-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="view-price-adj-modal-header">
                    <div className="header-left">
                        <div className="modal-header-icon">
                            <IndianRupee size={20}/>
                        </div>
                        <div>
                            <h3>Price Adjustment Request</h3>
                            <p>Order #{order.id} • {order.itemName} (Mfg: {order.mfgItemName || order.productDetails?.mfgProductName || `MFG-${order.id}`})</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={18}/>
                    </button>
                </div>

                <div className="view-price-adj-modal-body">
                    <div className="adj-summary-box">
                        <div className="adj-summary-row">
                            <span>Requested Adjustment:</span>
                            <strong className="text-warning">+ ₹{requestedAmount.toFixed(2)}</strong>
                        </div>
                        <div className="adj-summary-row">
                            <span>Current MFG Payment:</span>
                            <span>₹{order.mfgPayment.toFixed(2)}</span>
                        </div>
                        <div className="adj-summary-row total-highlight">
                            <span>New MFG Payment if Accepted:</span>
                            <strong>₹{newTotalMfgPayment.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="reason-display-box">
                        <label>Manufacturer's Reason:</label>
                        <p>{order.priceAdjustmentReason || "No reason provided."}</p>
                    </div>

                    <div className="view-price-adj-modal-footer">
                        <button type="button" className="btn-reject-adj" onClick={() => {
            onReject(order);
            onClose();
        }}>
                            <XCircle size={15}/>
                            <span>Reject Adjustment</span>
                        </button>
                        <button type="button" className="btn-accept-adj" onClick={() => {
            onAccept(order);
            onClose();
        }}>
                            <CheckCircle2 size={15}/>
                            <span>Accept Adjustment (+₹{requestedAmount})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>);
};
