import React, { useState } from "react";
import { IndianRupee, AlertCircle, X, Send } from "lucide-react";
import "./PriceAdjustmentModal.css";
export const PriceAdjustmentModal = ({ open, order, onClose, onSubmitRequest }) => {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    if (!open || !order)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Please enter a valid positive adjustment amount in ₹");
            return;
        }
        if (!reason.trim()) {
            setError("Please provide a reason for the price adjustment");
            return;
        }
        onSubmitRequest(order.id, numAmount, reason.trim());
        setAmount("");
        setReason("");
        setError("");
        onClose();
    };
    return (<div className="price-adj-modal-overlay" onClick={onClose}>
            <div className="price-adj-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="price-adj-modal-header">
                    <div className="header-left">
                        <div className="modal-header-icon">
                            <IndianRupee size={20}/>
                        </div>
                        <div>
                            <h3>Request Price Adjustment</h3>
                            <p>Order #{order.id} • {order.mfgItemName || order.productDetails?.mfgProductName || `H&S ${order.itemName} (Ref: MFG-${order.id})`}</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={18}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="price-adj-modal-body">
                    <div className="order-summary-box">
                        <div className="summary-row">
                            <span>Current MFG Payment:</span>
                            <strong>₹{order.mfgPayment.toFixed(2)}</strong>
                        </div>
                    </div>

                    {order.priceAdjustmentStatus === "Rejected" && (<div className="rejection-notice-banner">
                            <AlertCircle size={14}/>
                            <span>Previous request was rejected by Master Admin. Enter a new quoted amount and reason below to resend.</span>
                        </div>)}

                    {error && (<div className="error-alert">
                            <AlertCircle size={14}/>
                            <span>{error}</span>
                        </div>)}

                    <div className="form-group">
                        <label>Enter Quoted Price Adjustment Amount (₹)*</label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">₹</span>
                            <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 250" min="1" step="any" required/>
                        </div>
                        <span className="form-hint">Enter any custom adjustment amount quoted for this order</span>
                    </div>

                    <div className="form-group">
                        <label>Reason for Price Adjustment*</label>
                        <textarea className="form-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Special high-density puff print required, or heavy GSM fabric surcharge..." rows={3} required/>
                    </div>

                    <div className="price-adj-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            <Send size={14}/>
                            <span>Submit Request to Master</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>);
};
