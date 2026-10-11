import { useState, useEffect } from "react";
import "./AdminRefundModal.css";
import { X, Receipt, Upload, Trash2, Download } from "lucide-react";

const AdminRefundModal = ({ open, order, onClose, onSubmit }) => {
    const [refundStatus, setRefundStatus] = useState("Refunded");
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundNote, setRefundNote] = useState("");
    const [refundImage, setRefundImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && order) {
            setRefundStatus(order.refundStatus && order.refundStatus !== "None" ? order.refundStatus : "Refunded");
            setRefundAmount(typeof order.refundAmount === "number" ? order.refundAmount : (order.amountPaid || order.totalPrice || 0));
            setRefundNote(order.refundNote || "");
            setRefundImage(order.refundImage || null);
            setImagePreview(order.refundImage || null);
        }
    }, [open, order]);

    if (!open || !order) return null;

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure file is an image
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (PNG, JPG, JPEG, WEBP)");
            return;
        }

        // Limit size to 5MB
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
        if (!imagePreview) return;
        const link = document.createElement("a");
        link.href = imagePreview;
        link.download = `Refund-Receipt-Order-${order.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(order.id, {
                refundStatus,
                refundAmount: Number(refundAmount) || 0,
                refundNote: refundNote.trim(),
                refundImage: refundImage || null
            });
            onClose();
        } catch (err) {
            console.error("Failed to update refund:", err);
            alert(`Error updating refund: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-refund-modal-overlay">
            <div className="admin-refund-modal">
                {/* Header */}
                <div className="admin-refund-modal-header">
                    <div className="header-title-group">
                        <div className="modal-icon-badge refund-badge">
                            <Receipt size={18} />
                        </div>
                        <div>
                            <h2>Process Order Refund</h2>
                            <p className="header-subtitle font-mono">Order #{order.id}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} type="button">
                        <X size={18} />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="admin-refund-modal-body">
                    {/* Order summary card */}
                    <div className="order-summary-card">
                        <div className="summary-row">
                            <span className="summary-label">Customer:</span>
                            <span className="summary-val">{order.fullName} ({order.orderedBy || "User"})</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Order Total:</span>
                            <span className="summary-val font-bold">₹{(order.amountPaid || order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Cancel Reason:</span>
                            <span className="summary-val text-red-600 font-medium">{order.cancelReason || "Cancelled by Admin/Manufacturer"}</span>
                        </div>
                    </div>

                    {/* Refund Status */}
                    <div className="form-field-group">
                        <label className="field-label">
                            REFUND STATUS <span className="required-star">*</span>
                        </label>
                        <select
                            className="field-select"
                            value={refundStatus}
                            onChange={(e) => setRefundStatus(e.target.value)}
                            required
                        >
                            <option value="Refunded">Refunded (Settled)</option>
                            <option value="Processing">Processing (Initiated)</option>
                            <option value="Refund Pending">Refund Pending</option>
                        </select>
                        <span className="field-helper">
                            Select "Refunded" once the amount has been credited back to customer.
                        </span>
                    </div>

                    {/* Refund Amount */}
                    <div className="form-field-group">
                        <label className="field-label">
                            REFUND AMOUNT (₹) <span className="required-star">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="field-input"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Optional Refund Note */}
                    <div className="form-field-group">
                        <label className="field-label">
                            REFUND NOTES / TXN REF (OPTIONAL)
                        </label>
                        <input
                            type="text"
                            className="field-input"
                            value={refundNote}
                            onChange={(e) => setRefundNote(e.target.value)}
                            placeholder="e.g. UPI Ref #893710294 or Bank Payout"
                        />
                    </div>

                    {/* Image Section (Optional) */}
                    <div className="form-field-group image-section-group">
                        <div className="image-section-header">
                            <label className="field-label">
                                REFUND PROOF / RECEIPT IMAGE (OPTIONAL)
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="btn-remove-image"
                                    title="Remove refund proof image"
                                >
                                    <Trash2 size={13} />
                                    <span>Remove</span>
                                </button>
                            )}
                        </div>

                        {imagePreview ? (
                            <div className="refund-image-preview-card">
                                <div className="preview-img-wrapper">
                                    <img src={imagePreview} alt="Refund Receipt Preview" />
                                </div>
                                <div className="preview-actions">
                                    <button
                                        type="button"
                                        onClick={handleDownloadReceipt}
                                        className="btn-preview-download"
                                    >
                                        <Download size={13} />
                                        <span>Download Proof</span>
                                    </button>
                                    <label className="btn-preview-replace">
                                        <Upload size={13} />
                                        <span>Replace</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="refund-image-dropzone">
                                <Upload size={22} className="dropzone-icon" />
                                <span className="dropzone-text">Click to upload refund receipt image</span>
                                <span className="dropzone-subtext">PNG, JPG, JPEG up to 5MB (User can download this receipt)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="admin-refund-modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary-refund"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Save Refund Details"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRefundModal;
