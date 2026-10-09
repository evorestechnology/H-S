import { useState, useEffect } from "react";
import "./ShippingModal.css";
import { X, Truck, CheckCircle2 } from "lucide-react";
const defaultShippers = [
    "FedEx Express",
    "DHL Express",
    "UPS Standard",
    "Blue Dart",
    "Delhivery",
    "DTDC",
    "India Post",
    "Amazon Logistics",
    "USPS Priority",
    "Other"
];
// Helper to construct tracking URLs for known carriers
const getCarrierTrackingUrl = (carrierName, trkId) => {
    if (!trkId.trim() || trkId === "None")
        return "";
    const cleanId = encodeURIComponent(trkId.trim());
    const lower = carrierName.toLowerCase();
    if (lower.includes("dhl"))
        return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanId}`;
    if (lower.includes("ups"))
        return `https://www.ups.com/track?tracknum=${cleanId}`;
    if (lower.includes("fedex"))
        return `https://www.fedex.com/fedextrack/?trknbr=${cleanId}`;
    if (lower.includes("blue dart"))
        return `https://track.bluedart.com/track/${cleanId}`;
    if (lower.includes("delhivery"))
        return `https://www.delhivery.com/track/package/${cleanId}`;
    if (lower.includes("dtdc"))
        return `https://www.dtdc.in/tracking/shipment-tracking.asp?awb=${cleanId}`;
    if (lower.includes("amazon"))
        return `https://track.amazon.com/tracking/${cleanId}`;
    if (lower.includes("usps"))
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanId}`;
    if (lower.includes("india post"))
        return `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`;
    return "";
};
const ShippingModal = ({ open, mode = "shipping", order, onClose, onSubmit }) => {
    const [selectedShipper, setSelectedShipper] = useState(defaultShippers[0]);
    const [customShipperName, setCustomShipperName] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [trackingLink, setTrackingLink] = useState("");
    const [isLinkManuallyEdited, setIsLinkManuallyEdited] = useState(false);
    useEffect(() => {
        if (order && open) {
            const rawShipper = order.shipperName && order.shipperName !== "None" ? order.shipperName.trim() : "";
            if (!rawShipper) {
                setSelectedShipper(defaultShippers[0]);
                setCustomShipperName("");
            }
            else if (defaultShippers.includes(rawShipper) && rawShipper !== "Other") {
                setSelectedShipper(rawShipper);
                setCustomShipperName("");
            }
            else {
                setSelectedShipper("Other");
                setCustomShipperName(rawShipper === "Other" ? "" : rawShipper);
            }
            setTrackingId(order.trackingId && order.trackingId !== "None"
                ? order.trackingId
                : "");
            setTrackingLink(order.trackingLink && order.trackingLink !== "None"
                ? order.trackingLink
                : "");
            setIsLinkManuallyEdited(Boolean(order.trackingLink && order.trackingLink !== "None"));
        }
    }, [order, open]);
    if (!open || !order)
        return null;
    const isCompleteMode = mode === "complete";
    const isUpdateMode = mode === "update";
    const handleShipperChange = (val) => {
        setSelectedShipper(val);
        if (val === "Other") {
            // Retain whatever link user has entered; do not auto-generate
            return;
        }
        // Auto-populate carrier URL if user hasn't explicitly customized the link
        if (!isLinkManuallyEdited && trackingId.trim() && trackingId !== "None") {
            const autoUrl = getCarrierTrackingUrl(val, trackingId);
            if (autoUrl) {
                setTrackingLink(autoUrl);
            }
        }
    };
    const handleTrackingIdChange = (val) => {
        setTrackingId(val);
        if (selectedShipper === "Other") {
            // When 'Other' is chosen, user provides any link they want; never overwrite
            return;
        }
        if (val.trim()) {
            if (!isLinkManuallyEdited) {
                const autoUrl = getCarrierTrackingUrl(selectedShipper, val);
                if (autoUrl) {
                    setTrackingLink(autoUrl);
                }
            }
        }
        else {
            if (!isLinkManuallyEdited) {
                setTrackingLink("");
            }
        }
    };
    const handleTrackingLinkChange = (val) => {
        setTrackingLink(val);
        setIsLinkManuallyEdited(true);
    };
    const handleSubmit = () => {
        const finalShipperName = selectedShipper === "Other"
            ? customShipperName.trim() || "Other"
            : selectedShipper.trim();
        // Shipper Name is ALWAYS mandatory
        if (!finalShipperName || finalShipperName === "None") {
            alert("Shipper Name is required.");
            return;
        }
        if (isCompleteMode) {
            // When moving to Delivered, Tracking ID & Tracking Link are MANDATORY
            if (!trackingId.trim() || trackingId === "None") {
                alert("Tracking ID is mandatory when moving an order from Shipping to Delivered.");
                return;
            }
            if (!trackingLink.trim() || trackingLink === "None") {
                alert("Tracking Link is mandatory when moving an order from Shipping to Delivered.");
                return;
            }
        }
        const finalTrkId = trackingId.trim() ? trackingId.trim() : "None";
        let finalTrkLink = trackingLink.trim();
        if (finalTrkLink && finalTrkLink !== "None") {
            // Ensure link starts with http:// or https:// for external navigation
            if (!/^https?:\/\//i.test(finalTrkLink)) {
                finalTrkLink = `https://${finalTrkLink}`;
            }
        }
        else {
            finalTrkLink = "None";
        }
        onSubmit(order.id, finalShipperName, finalTrkId, finalTrkLink);
        onClose();
    };
    return (<div className="shipping-modal-overlay">
            <div className="shipping-modal">
                <div className="shipping-modal-header">
                    <div className="header-title">
                        {isCompleteMode ? (<CheckCircle2 size={22} className="header-icon text-emerald-600"/>) : (<Truck size={22} className="header-icon"/>)}
                        <div>
                            <h2>
                                {isCompleteMode
            ? "Deliver Order — Tracking Required"
            : isUpdateMode
                ? "Update Tracking Details (Shipping)"
                : "Move Order to Shipping"}
                            </h2>
                            <p>Order ID: {order.id} • {order.mfgItemName || order.productDetails?.mfgProductName || `H&S ${order.itemName} (Ref: MFG-${order.id})`}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="shipping-modal-body">
                    {isCompleteMode && (<div className="completion-info-banner">
                            <p>
                                <strong>Notice:</strong> Tracking ID and Tracking Link are mandatory to deliver this order.
                            </p>
                        </div>)}

                    {isUpdateMode && (<div className="completion-info-banner" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                            <p style={{ color: "#1E40AF" }}>
                                <strong>Note:</strong> Updating tracking info will keep the order in <strong>Shipping</strong> status.
                            </p>
                        </div>)}

                    <div className="form-group">
                        <label>
                            Shipper / Courier Name <span className="required-star">*</span>
                        </label>
                        <select value={selectedShipper} onChange={(e) => handleShipperChange(e.target.value)}>
                            {defaultShippers.map((s) => (<option key={s} value={s}>
                                    {s}
                                </option>))}
                        </select>
                    </div>

                    {selectedShipper === "Other" && (<div className="form-group custom-shipper-group">
                            <label>
                                Custom Courier / Carrier Name <span className="required-star">*</span>
                            </label>
                            <input type="text" placeholder="e.g. Delhivery, DTDC, Shadowfax, Local Courier..." value={customShipperName} onChange={(e) => setCustomShipperName(e.target.value)} autoFocus/>
                            <span className="field-hint">Specify your courier or shipping partner name</span>
                        </div>)}

                    <div className="form-group">
                        <label>
                            Tracking ID{" "}
                            {isCompleteMode ? (<span className="required-star">*</span>) : (<span className="optional-tag">(Optional)</span>)}
                        </label>
                        <input type="text" placeholder="Enter Tracking ID / AWB Number" value={trackingId} onChange={(e) => handleTrackingIdChange(e.target.value)}/>
                    </div>

                    <div className="form-group">
                        <div className="field-label-row">
                            <label>
                                Tracking Link URL{" "}
                                {isCompleteMode ? (<span className="required-star">*</span>) : (<span className="optional-tag">(Optional)</span>)}
                            </label>
                            {selectedShipper !== "Other" && trackingId.trim() && (<button type="button" className="btn-autofill-link" onClick={() => {
                const autoUrl = getCarrierTrackingUrl(selectedShipper, trackingId);
                if (autoUrl) {
                    setTrackingLink(autoUrl);
                    setIsLinkManuallyEdited(false);
                }
            }} title="Auto-generate tracking link from carrier and Tracking ID">
                                    Auto-fill Carrier Link
                                </button>)}
                        </div>
                        <input type="text" placeholder={selectedShipper === "Other"
            ? "Paste any tracking link URL (e.g. https://...)"
            : "Enter Tracking Link URL"} value={trackingLink} onChange={(e) => handleTrackingLinkChange(e.target.value)}/>
                        <span className="field-hint">
                            {selectedShipper === "Other"
            ? "You can paste any courier tracking link or website URL here."
            : "Direct web link for customer to track parcel."}
                        </span>
                    </div>
                </div>

                <div className="shipping-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`submit-btn ${isCompleteMode ? "complete-mode-btn" : ""}`} onClick={handleSubmit}>
                        {isCompleteMode
            ? "Confirm & Deliver Order"
            : isUpdateMode
                ? "Save Tracking Details"
                : "Confirm & Move to Shipping"}
                    </button>
                </div>
            </div>
        </div>);
};
export default ShippingModal;
