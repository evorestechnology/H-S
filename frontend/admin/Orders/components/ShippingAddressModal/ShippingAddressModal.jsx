import React, { useState, useEffect } from "react";
import "./ShippingAddressModal.css";
import { X, MapPin, Copy, Check, User, Phone, Globe } from "lucide-react";
/**
 * Resilient copy-to-clipboard function with fallback for non-secure contexts
 */
export const copyToClipboard = async (text) => {
    if (!text)
        return false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);
            return successful;
        }
    }
    catch (err) {
        console.error("Failed to copy text:", err);
        return false;
    }
};
export const ShippingAddressModal = ({ open, order, onClose }) => {
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [copiedAll, setCopiedAll] = useState(false);
    useEffect(() => {
        if (!open) {
            setCopiedAddress(false);
            setCopiedAll(false);
        }
    }, [open]);
    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && open) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);
    if (!open || !order)
        return null;
    const addressText = order.shippingAddress && order.shippingAddress !== "N/A"
        ? order.shippingAddress
        : "No shipping address provided";
    const handleCopyAddress = async () => {
        const success = await copyToClipboard(addressText);
        if (success) {
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        }
    };
    const handleCopyAll = async () => {
        const fullDetails = [
            order.fullName ? `Name: ${order.fullName}` : "",
            order.phone ? `Phone: ${order.phone}` : "",
            order.country ? `Country: ${order.country}` : "",
            `Address: ${addressText}`
        ].filter(Boolean).join("\n");
        const success = await copyToClipboard(fullDetails);
        if (success) {
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        }
    };
    return (<div className="shipping-address-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="shipping-address-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="shipping-address-modal-header">
                    <div className="shipping-address-header-title">
                        <div className="shipping-address-icon-badge">
                            <MapPin size={18}/>
                        </div>
                        <div>
                            <h3>Shipping Address</h3>
                            <span className="order-id-subtext">Order #{order.id}</span>
                        </div>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose} title="Close popup" aria-label="Close">
                        <X size={18}/>
                    </button>
                </div>

                {/* Body */}
                <div className="shipping-address-modal-body">
                    {/* Recipient Quick Summary */}
                    <div className="shipping-recipient-card">
                        {order.fullName && (<div className="recipient-row">
                                <User size={14} className="recipient-icon"/>
                                <span className="recipient-label">Recipient:</span>
                                <span className="recipient-val font-semibold">{order.fullName}</span>
                            </div>)}
                        {order.phone && (<div className="recipient-row">
                                <Phone size={14} className="recipient-icon"/>
                                <span className="recipient-label">Phone:</span>
                                <span className="recipient-val">{order.phone}</span>
                            </div>)}
                        {order.country && (<div className="recipient-row">
                                <Globe size={14} className="recipient-icon"/>
                                <span className="recipient-label">Country:</span>
                                <span className="recipient-val">{order.country}</span>
                            </div>)}
                    </div>

                    {/* Address Box */}
                    <div className="shipping-address-box-wrapper">
                        <div className="shipping-address-box-label">
                            <span>Delivery Address</span>
                            <span className="address-status-tag">Full View</span>
                        </div>
                        <div className="shipping-address-box">
                            <p className="shipping-address-full-text">{addressText}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="shipping-address-modal-footer">
                    <button type="button" className={`btn-copy-address-main ${copiedAddress ? "copied" : ""}`} onClick={handleCopyAddress}>
                        {copiedAddress ? (<>
                                <Check size={16}/>
                                <span>Address Copied!</span>
                            </>) : (<>
                                <Copy size={16}/>
                                <span>Copy Address</span>
                            </>)}
                    </button>

                    <button type="button" className={`btn-copy-all-secondary ${copiedAll ? "copied" : ""}`} onClick={handleCopyAll} title="Copy full recipient contact & delivery address">
                        {copiedAll ? <Check size={14}/> : <Copy size={14}/>}
                        <span>{copiedAll ? "All Copied!" : "Copy Full Info"}</span>
                    </button>
                </div>
            </div>
        </div>);
};
export default ShippingAddressModal;
