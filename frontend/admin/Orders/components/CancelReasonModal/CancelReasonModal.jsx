import { useState, useEffect } from "react";
import "./CancelReasonModal.css";
import { X, Eye, AlertTriangle, Receipt, Upload, Trash2, Download, CheckCircle2 } from "lucide-react";

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

const CancelReasonModal = ({ open, mode, order, onClose, onConfirmCancel, onOpenRefundModal }) => {
    const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
    const [customReason, setCustomReason] = useState("");
    
    // Admin Refund Section States
    const [refundStatus, setRefundStatus] = useState("Refunded");
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundNote, setRefundNote] = useState("");
    const [refundImage, setRefundImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (open && order) {
            setSelectedPreset(PRESET_REASONS[0]);
            setCustomReason("");
            setRefundStatus("Refunded");
            setRefundAmount(typeof order.refundAmount === "number" ? order.refundAmount : (order.amountPaid || order.totalPrice || 0));
            setRefundNote("");
            setRefundImage(null);
            setImagePreview(null);
        }
    }, [open, order]);

    if (!open || !order)
        return null;

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (PNG, JPG, JPEG, WEBP)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            const base64Data = uploadEvent.target?.result;
            setRefundImage(base64Data);
            setImagePreview(base64Data);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setRefundImage(null);
        setImagePreview(null);
    };

    const handleDownloadReceipt = () => {
        const targetSrc = imagePreview || order.refundImage;
        if (!targetSrc) return;
        const link = document.createElement("a");
        link.href = targetSrc;
        link.download = `Refund-Receipt-Order-${order.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConfirm = () => {
        const finalReason = selectedPreset === "Custom reason"
            ? customReason.trim() || "Admin cancelled order"
            : selectedPreset;

        const refundData = {
            refundStatus,
            refundAmount: Number(refundAmount) || 0,
            refundNote: refundNote.trim(),
            refundImage: refundImage || null
        };

        if (onConfirmCancel) {
            onConfirmCancel(order.id, finalReason, refundData);
        }
        onClose();
    };

    return (<div className="cancel-reason-modal-overlay">
            <div className="cancel-reason-modal cancel-reason-modal-enhanced">
                {/* Header */}
                <div className="cancel-reason-modal-header">
                    <div className="header-title-group">
                        {mode === "view" ? (<div className="modal-icon-badge view-badge">
                                <Eye size={18}/>
                            </div>) : (<div className="modal-icon-badge cancel-badge">
                                <AlertTriangle size={18}/>
                            </div>)}
                        <h2>
                            {mode === "view" ? "Order Cancellation & Refund Details" : "Cancel Order & Process Refund"}
                        </h2>
                    </div>
                    <button className="close-btn" onClick={onClose} type="button">
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
                            <span className="summary-val">{order.itemName} [Mfg: {order.mfgItemName || order.productDetails?.mfgProductName || `MFG-${order.id}`}] ({order.size}, {order.color})</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Customer / Amount:</span>
                            <span className="summary-val font-bold">{order.fullName} — ₹{(order.amountPaid || order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {mode === "view" ? (<>
                        {/* VIEW MODE: Cancellation Reason Box */}
                        <div className="reason-display-box">
                            <label className="reason-display-label">REASON FOR CANCELLATION</label>
                            <p className="reason-text">
                                {order.cancelReason || "Cancellation reason not provided."}
                            </p>
                            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #fee2e2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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
                        </div>

                        {/* VIEW MODE: Refund Status Section */}
                        <div className="refund-display-box">
                            <div className="refund-header-row">
                                <div className="flex items-center gap-2">
                                    <Receipt size={16} className="text-emerald-600" />
                                    <span className="font-bold text-xs uppercase tracking-wide text-slate-800">Admin Refund Status</span>
                                </div>
                                <span className={`refund-status-tag ${
                                    (order.refundStatus === "Refunded") ? "tag-refunded" :
                                    (order.refundStatus === "Processing") ? "tag-processing" : "tag-pending"
                                }`}>
                                    {order.refundStatus || "Refund Pending"}
                                </span>
                            </div>

                            <div className="refund-details-grid">
                                <div>
                                    <span className="detail-label">Refund Amount</span>
                                    <span className="detail-value text-emerald-700 font-bold">
                                        ₹{(typeof order.refundAmount === "number" ? order.refundAmount : (order.amountPaid || order.totalPrice || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="detail-label">Refund Settlement</span>
                                    <span className="detail-value">
                                        {order.refundedAt ? formatCancellationTimestamp(order.refundedAt) : "Pending completion"}
                                    </span>
                                </div>
                            </div>

                            {order.refundNote && (
                                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                                    <span className="font-bold">Note: </span>{order.refundNote}
                                </div>
                            )}

                            {/* View & Download Refund Proof Image */}
                            {order.refundImage ? (
                                <div className="refund-receipt-preview-section">
                                    <div className="receipt-preview-header">
                                        <span className="font-bold text-xs text-slate-700">Refund Receipt Proof Attached</span>
                                        <button
                                            type="button"
                                            onClick={handleDownloadReceipt}
                                            className="btn-download-receipt-pill"
                                            title="Download refund receipt image to device"
                                        >
                                            <Download size={13} />
                                            <span>Download Receipt</span>
                                        </button>
                                    </div>
                                    <div className="receipt-img-container">
                                        <img src={order.refundImage} alt="Refund Proof Receipt" />
                                    </div>
                                </div>
                            ) : (
                                <div className="no-receipt-note">
                                    <span>No refund proof image was attached.</span>
                                </div>
                            )}
                        </div>
                    </>) : (<>
                        {/* CREATE MODE: Cancellation Reason Selection */}
                        <div className="reason-form-group">
                            <label className="form-label">SELECT CANCELLATION REASON <span className="required-star">*</span></label>
                            <select className="reason-select" value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}>
                                {PRESET_REASONS.map((r) => (<option key={r} value={r}>
                                        {r}
                                    </option>))}
                            </select>

                            {selectedPreset === "Custom reason" && (<div className="custom-reason-input-group">
                                    <label className="form-label">ENTER DETAILED REASON</label>
                                    <textarea className="reason-textarea" rows={2} placeholder="Type the specific reason for cancelling this order..." value={customReason} onChange={(e) => setCustomReason(e.target.value)}/>
                                </div>)}
                        </div>

                        {/* CREATE MODE: Admin Refund Projected Section */}
                        <div className="admin-projected-refund-section">
                            <div className="section-title-badge">
                                <Receipt size={15} />
                                <span>ADMIN REFUND (PROJECTED)</span>
                            </div>

                            <div className="refund-grid-fields">
                                <div className="form-field-group">
                                    <label className="field-label">REFUND STATUS</label>
                                    <select
                                        className="field-select"
                                        value={refundStatus}
                                        onChange={(e) => setRefundStatus(e.target.value)}
                                    >
                                        <option value="Refunded">Refunded (Settled)</option>
                                        <option value="Processing">Processing (Initiated)</option>
                                        <option value="Refund Pending">Refund Pending</option>
                                    </select>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">REFUND AMOUNT (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="field-input"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="form-field-group" style={{ marginTop: "10px" }}>
                                <label className="field-label">REFUND NOTE / REFERENCE (OPTIONAL)</label>
                                <input
                                    type="text"
                                    className="field-input"
                                    value={refundNote}
                                    onChange={(e) => setRefundNote(e.target.value)}
                                    placeholder="e.g. Returned to customer original payment method"
                                />
                            </div>

                            {/* Optional Image Upload Section */}
                            <div className="form-field-group image-section-group" style={{ marginTop: "12px" }}>
                                <div className="image-section-header">
                                    <label className="field-label">
                                        REFUND PROOF / RECEIPT IMAGE (OPTIONAL)
                                    </label>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="btn-remove-image"
                                            title="Remove image"
                                        >
                                            <Trash2 size={13} />
                                            <span>Remove</span>
                                        </button>
                                    )}
                                </div>

                                {imagePreview ? (
                                    <div className="refund-image-preview-card">
                                        <div className="preview-img-wrapper">
                                            <img src={imagePreview} alt="Receipt Preview" />
                                        </div>
                                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 justify-center mt-1">
                                            <CheckCircle2 size={13} /> Receipt proof attached (downloadable by customer)
                                        </span>
                                    </div>
                                ) : (
                                    <label className="refund-image-dropzone">
                                        <Upload size={20} className="dropzone-icon" />
                                        <span className="dropzone-text">Upload receipt image (optional)</span>
                                        <span className="dropzone-subtext">PNG, JPG up to 5MB (User can download this receipt)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </>)}
                </div>

                {/* Footer */}
                <div className="cancel-reason-modal-footer">
                    {mode === "view" ? (<>
                        {onOpenRefundModal && (
                            <button
                                type="button"
                                className="btn-manage-refund-link"
                                onClick={() => {
                                    onClose();
                                    onOpenRefundModal(order);
                                }}
                            >
                                <Receipt size={14} />
                                <span>Edit Refund Details</span>
                            </button>
                        )}
                        <button className="btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </>) : (<>
                        <button className="btn-secondary" onClick={onClose} type="button">
                            Dismiss
                        </button>
                        <button className="btn-danger-confirm" onClick={handleConfirm} type="button">
                            Confirm Cancellation & Refund
                        </button>
                    </>)}
                </div>
            </div>
        </div>);
};

export default CancelReasonModal;

