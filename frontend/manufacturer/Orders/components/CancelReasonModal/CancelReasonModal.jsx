import { useState, useEffect } from "react";
import "./CancelReasonModal.css";
import { X, Eye, AlertTriangle } from "lucide-react";
const PRESET_REASONS = [
    "Out of stock at manufacturing facility",
    "Defective material batch identified during QA",
    "Customer requested cancellation before dispatch",
    "Delivery location unserviceable by carrier",
    "Custom reason"
];
const formatCancellationTimestamp = (timestamp) => {
    if (!timestamp)
        return "N/A";
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime()))
            return timestamp;
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }) + ", " + d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }
    catch {
        return timestamp;
    }
};
const CancelReasonModal = ({ open, mode, order, onClose, onConfirmCancel }) => {
    const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
    const [customReason, setCustomReason] = useState("");
    useEffect(() => {
        if (open) {
            setSelectedPreset(PRESET_REASONS[0]);
            setCustomReason("");
        }
    }, [open]);
    if (!open || !order)
        return null;
    const handleConfirm = () => {
        const finalReason = selectedPreset === "Custom reason"
            ? customReason.trim() || "Manufacturer cancelled order"
            : selectedPreset;
        if (onConfirmCancel) {
            onConfirmCancel(order.id, finalReason);
        }
        onClose();
    };
    return (<div className="cancel-reason-modal-overlay">
            <div className="cancel-reason-modal">
                {/* Header */}
                <div className="cancel-reason-modal-header">
                    <div className="header-title-group">
                        {mode === "view" ? (<div className="modal-icon-badge view-badge">
                                <Eye size={18}/>
                            </div>) : (<div className="modal-icon-badge cancel-badge">
                                <AlertTriangle size={18}/>
                            </div>)}
                        <h2>
                            {mode === "view" ? "Order Cancelled" : "Cancel Order Request"}
                        </h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18}/>
                    </button>
                </div>

                {/* Body */}
                <div className="cancel-reason-modal-body">
                    {/* Order summary info */}
                    <div className="order-summary-card">
                        <div className="summary-row">
                            <span className="summary-label">Order ID:</span>
                            <span className="summary-val font-mono">{order.id}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Item:</span>
                            <span className="summary-val">{order.mfgItemName || order.productDetails?.mfgProductName || `H&S ${order.itemName} (Ref: MFG-${order.id})`} ({order.size}, {order.color})</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Ordered By:</span>
                            <span className="summary-val">{order.fullName} ({order.orderedBy})</span>
                        </div>
                    </div>

                    {mode === "view" ? (<div className="reason-display-box">
                            <label className="reason-display-label">REASON FOR CANCELLATION</label>
                            <p className="reason-text">
                                {order.cancelReason || "Cancellation reason not provided."}
                            </p>
                            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #fee2e2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                                        Cancelled By
                                    </span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                                        {order.cancelledByRole ? (order.cancelledByRole.toUpperCase() === "ADMIN" ? "Admin" : "Manufacturer") : (order.status === "Cancelled" ? "Admin" : "Pending Approval")}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                                        Cancelled At
                                    </span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                                        {formatCancellationTimestamp(order.cancelledAt || order.orderedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>) : (<div className="reason-form-group">
                            <label className="form-label">SELECT CANCELLATION REASON</label>
                            <select className="reason-select" value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}>
                                {PRESET_REASONS.map((r) => (<option key={r} value={r}>
                                        {r}
                                    </option>))}
                            </select>

                            {selectedPreset === "Custom reason" && (<div className="custom-reason-input-group">
                                    <label className="form-label">ENTER DETAILED REASON</label>
                                    <textarea className="reason-textarea" rows={3} placeholder="Type the specific reason for cancelling this order..." value={customReason} onChange={(e) => setCustomReason(e.target.value)}/>
                                </div>)}
                        </div>)}
                </div>

                {/* Footer */}
                <div className="cancel-reason-modal-footer">
                    {mode === "view" ? (<button className="btn-secondary" onClick={onClose}>
                            Close
                        </button>) : (<>
                            <button className="btn-secondary" onClick={onClose}>
                                Dismiss
                            </button>
                            <button className="btn-danger-confirm" onClick={handleConfirm}>
                                Confirm Cancellation
                            </button>
                        </>)}
                </div>
            </div>
        </div>);
};
export default CancelReasonModal;
