import { useState, useEffect } from "react";
import "./CouponModal.css";
import { X, Lock, Eye, Sparkles, Infinity as InfinityIcon, Hash } from "lucide-react";
const CouponModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
    const [type, setType] = useState("Public");
    const [code, setCode] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const [discountType, setDiscountType] = useState("Percentage");
    const [minSpend, setMinSpend] = useState("0");
    const [expiryDate, setExpiryDate] = useState("");
    const [isLimited, setIsLimited] = useState(false);
    const [limitValue, setLimitValue] = useState("100");
    useEffect(() => {
        if (open) {
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            const defaultDateStr = nextMonth.toISOString().split("T")[0];
            setType("Public");
            setCode("");
            setDiscountValue("");
            setDiscountType("Percentage");
            setMinSpend("0");
            setExpiryDate(defaultDateStr);
            setIsLimited(false);
            setLimitValue("100");
        }
    }, [open]);
    if (!open)
        return null;
    const handleGenerateCode = () => {
        const prefix = type === "Private" ? "PRIV" : "FITX";
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        setCode(`${prefix}${randomStr}`);
    };
    const handleSubmit = async () => {
        if (!code.trim()) {
            alert("Please enter or generate a Coupon Name / Code");
            return;
        }
        if (!discountValue || Number(discountValue) <= 0) {
            alert("Please enter a valid Coupon Discount value");
            return;
        }
        if (isLimited && (!limitValue || Number(limitValue) <= 0)) {
            alert("Please enter a valid usage limit number");
            return;
        }
        await onSubmit({
            code: code.trim().toUpperCase(),
            type,
            discountValue: Number(discountValue),
            discountType,
            minSpend: Number(minSpend) || 0,
            usageLimit: isLimited ? Number(limitValue) : 0,
            expiryDate: expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
        });
    };
    return (<div className="coupon-modal-overlay">
            <div className="coupon-modal">
                <div className="coupon-modal-header">
                    <h2>Create a New Coupon</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="coupon-modal-body">
                    {/* Step 1: Select Coupon Type (Public or Private) */}
                    <div className="form-group">
                        <label className="section-label">Select Coupon Type</label>
                        <div className="type-selector-grid">
                            <div className={`type-card ${type === "Public" ? "active" : ""}`} onClick={() => setType("Public")}>
                                <div className="type-icon public-icon">
                                    <Eye size={20}/>
                                </div>
                                <div>
                                    <h4>Public Coupon</h4>
                                    <p>Visible to all customers at checkout</p>
                                </div>
                            </div>

                            <div className={`type-card ${type === "Private" ? "active" : ""}`} onClick={() => setType("Private")}>
                                <div className="type-icon private-icon">
                                    <Lock size={20}/>
                                </div>
                                <div>
                                    <h4>Private Coupon</h4>
                                    <p>Exclusive promo for specific users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Coupon Name */}
                    <div className="form-group">
                        <div className="label-with-action">
                            <label>Coupon Name / Code</label>
                            <button type="button" className="gen-code-btn" onClick={handleGenerateCode}>
                                <Sparkles size={12}/> Auto-Generate Code
                            </button>
                        </div>
                        <input type="text" placeholder="e.g. FESTIVE25 or VIPSECRET50" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}/>
                    </div>

                    {/* Step 3: Coupon Discount & Type */}
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Coupon Discount Value</label>
                            <input type="number" placeholder="e.g. 20 or 500" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}/>
                        </div>

                        <div className="form-group">
                            <label>Discount Unit</label>
                            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed Amount">Fixed Amount (₹)</option>
                            </select>
                        </div>
                    </div>

                    {/* Step 4: Minimum Spend & Expiry Date */}
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Minimum Order Spend (₹)</label>
                            <input type="number" placeholder="0 for no minimum" value={minSpend} onChange={(e) => setMinSpend(e.target.value)}/>
                        </div>

                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}/>
                        </div>
                    </div>

                    {/* Step 5: Usage Limit Selection (Unlimited vs Limited) */}
                    <div className="form-group">
                        <label className="section-label">Usage Limit</label>
                        <div className="usage-mode-selector">
                            <div className={`usage-mode-card ${!isLimited ? "active" : ""}`} onClick={() => setIsLimited(false)}>
                                <div className="usage-mode-icon unlimited">
                                    <InfinityIcon size={18}/>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Unlimited</h4>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748B" }}>No usage limits</p>
                                </div>
                            </div>

                            <div className={`usage-mode-card ${isLimited ? "active" : ""}`} onClick={() => setIsLimited(true)}>
                                <div className="usage-mode-icon limited">
                                    <Hash size={18}/>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Limited</h4>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748B" }}>Set max usage count</p>
                                </div>
                            </div>
                        </div>

                        {isLimited && (<div className="limit-input-box" style={{ marginTop: "10px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>MAXIMUM USAGE COUNT</label>
                                <input type="number" min="1" placeholder="e.g. 50, 100, 500" value={limitValue} onChange={(e) => setLimitValue(e.target.value)}/>
                            </div>)}
                    </div>
                </div>

                <div className="coupon-modal-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating Coupon..." : `Create ${type} Coupon`}
                    </button>
                </div>
            </div>
        </div>);
};
export default CouponModal;
