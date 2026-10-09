import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { calculateGst } from "../../api";
import "./GstSimulatorCard.css";
export const GstSimulatorCard = ({ taxSettings }) => {
    const [simPrice, setSimPrice] = useState(2999);
    const [simCountry, setSimCountry] = useState("India");
    const simResult = calculateGst(simPrice, simCountry, taxSettings);
    return (<div className="simulator-card">
            <div className="simulator-header">
                <div className="flex-items-center gap-8">
                    <Calculator size={18} className="text-primary"/>
                    <h3>Live GST Calculator &amp; Simulator</h3>
                </div>
                <p>Test real-time GST calculation for any product price &amp; customer location</p>
            </div>

            <div className="sim-input-group">
                <label>Product Unit Price (₹)</label>
                <input type="number" value={simPrice} onChange={(e) => setSimPrice(Number(e.target.value) || 0)} min="0" step="50"/>
            </div>

            <div className="sim-input-group">
                <label>Customer Shipping Country</label>
                <select value={simCountry} onChange={(e) => setSimCountry(e.target.value)}>
                    <option value="India">🇮🇳 India (Domestic Buyer)</option>
                    <option value="United States">🇺🇸 United States (International)</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom (International)</option>
                    <option value="Canada">🇨🇦 Canada (International)</option>
                    <option value="Australia">🇦🇺 Australia (International)</option>
                    <option value="Germany">🇩🇪 Germany (International)</option>
                    <option value="UAE">🇦🇪 United Arab Emirates (International)</option>
                </select>
            </div>

            {/* Calculation Results Card */}
            <div className="sim-result-box">
                <div className="sim-result-row">
                    <span>Buyer Destination:</span>
                    <strong>{simResult.isIndian ? "Domestic (India)" : "International (Non-Indian)"}</strong>
                </div>

                <div className="sim-result-row">
                    <span>Applied GST Slab:</span>
                    <span className={`sim-slab-badge sim-slab-${simResult.appliedRate}`}>
                        {simResult.appliedRate}% GST
                    </span>
                </div>

                <div className="sim-result-row">
                    <span>Base Price:</span>
                    <span>₹{simResult.productPrice.toLocaleString("en-IN")}</span>
                </div>

                <div className="sim-result-row">
                    <span>Calculated Tax ({simResult.appliedRate}%):</span>
                    <span style={{ color: simResult.appliedRate > 0 ? "#F59E0B" : "#10B981" }}>
                        + ₹{simResult.gstAmount.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="sim-result-row total-row">
                    <span>Total Payable Price:</span>
                    <span style={{ color: "#38BDF8" }}>₹{simResult.totalPrice.toLocaleString("en-IN")}</span>
                </div>
            </div>

            <p className="text-xs text-muted" style={{ fontStyle: "italic", margin: 0 }}>
                {simResult.slabDescription}
            </p>
        </div>);
};
