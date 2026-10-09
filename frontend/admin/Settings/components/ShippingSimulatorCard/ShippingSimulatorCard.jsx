import React, { useState } from "react";
import { Truck, Scale } from "lucide-react";
import { calculateOrderShipping } from "../../../utils/shipping";
import { useCategoryWeightRules } from "../../../../shared/services/categoryService";
import "./ShippingSimulatorCard.css";
export const ShippingSimulatorCard = ({ blockStepKg, ratePerBlock }) => {
    const activeRules = useCategoryWeightRules();
    const [hoodies, setHoodies] = useState(2);
    const [tshirts, setTshirts] = useState(2);
    const [sps, setSps] = useState(5);
    const [shorts, setShorts] = useState(1);
    const [cropTops, setCropTops] = useState(0);
    const [tankTops, setTankTops] = useState(0);
    const [country, setCountry] = useState("United States");
    const simResult = calculateOrderShipping([
        { type: "hoodies", quantity: hoodies },
        { type: "t-shirts", quantity: tshirts },
        { type: "pants", quantity: sps },
        { type: "shorts", quantity: shorts },
        { type: "accessories", quantity: cropTops },
        { type: "tanktop", quantity: tankTops }
    ], country, blockStepKg, ratePerBlock, activeRules);
    return (<div className="shipping-sim-card">
            <div className="shipping-sim-header">
                <div className="flex-items-center gap-8">
                    <Truck size={18} className="text-primary"/>
                    <h3>Live Shipping Weight &amp; Cost Simulator</h3>
                </div>
                <p>Test real-time parcel weight &amp; international shipping calculation</p>
            </div>

            <div className="sim-input-group">
                <label>Customer Destination Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="United States">🇺🇸 United States (International)</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom (International)</option>
                    <option value="Canada">🇨🇦 Canada (International)</option>
                    <option value="Australia">🇦🇺 Australia (International)</option>
                    <option value="Germany">🇩🇪 Germany (International)</option>
                    <option value="UAE">🇦🇪 United Arab Emirates (International)</option>
                    <option value="India">🇮🇳 India (Domestic)</option>
                </select>
            </div>

            {/* Garment Quantity Inputs Grid */}
            <div className="sim-quantities-grid">
                <div className="sim-qty-item">
                    <label>Hoodies (1kg)</label>
                    <input type="number" min="0" value={hoodies} onChange={(e) => setHoodies(Number(e.target.value) || 0)}/>
                </div>

                <div className="sim-qty-item">
                    <label>SP / Sweatpants (1kg)</label>
                    <input type="number" min="0" value={sps} onChange={(e) => setSps(Number(e.target.value) || 0)}/>
                </div>

                <div className="sim-qty-item">
                    <label>T-Shirts (0.5kg)</label>
                    <input type="number" min="0" value={tshirts} onChange={(e) => setTshirts(Number(e.target.value) || 0)}/>
                </div>

                <div className="sim-qty-item">
                    <label>SH / Shorts (0.33kg)</label>
                    <input type="number" min="0" value={shorts} onChange={(e) => setShorts(Number(e.target.value) || 0)}/>
                </div>

                <div className="sim-qty-item">
                    <label>Crop Tops (0.33kg)</label>
                    <input type="number" min="0" value={cropTops} onChange={(e) => setCropTops(Number(e.target.value) || 0)}/>
                </div>

                <div className="sim-qty-item">
                    <label>Tank Tops (0.33kg)</label>
                    <input type="number" min="0" value={tankTops} onChange={(e) => setTankTops(Number(e.target.value) || 0)}/>
                </div>
            </div>

            {/* Breakdown List */}
            <div className="sim-breakdown-box">
                <div className="breakdown-header">
                    <Scale size={14}/>
                    <span>Weight Breakdown:</span>
                </div>
                {simResult.breakdown.length === 0 ? (<span className="text-xs text-muted">No items in order</span>) : (simResult.breakdown.map((b, idx) => (<div key={idx} className="breakdown-row">
                            <span>{b.quantity}x {b.name}</span>
                            <span>{b.totalWeightKg.toFixed(2)} kg</span>
                        </div>)))}
            </div>

            {/* Final Calculation Result Box */}
            <div className="sim-result-box">
                <div className="sim-result-row">
                    <span>Total Calculated Weight:</span>
                    <strong style={{ fontSize: "15px", color: "#F8FAFC" }}>
                        {simResult.totalWeightKg.toFixed(2)} kg
                    </strong>
                </div>

                <div className="sim-result-row">
                    <span>Shipping Type:</span>
                    <strong>{simResult.isInternational ? "International Freight" : "Domestic (India)"}</strong>
                </div>

                <div className="sim-result-row">
                    <span>Slabs Charged ({blockStepKg}kg step):</span>
                    <span className="sim-slab-badge sim-slab-5">
                        {simResult.blocksCharged} Block{simResult.blocksCharged === 1 ? "" : "s"} ({simResult.blocksCharged * blockStepKg}kg max)
                    </span>
                </div>

                <div className="sim-result-row total-row">
                    <span>Total Shipping Fee Added:</span>
                    <span style={{ color: "#38BDF8", fontSize: "18px" }}>
                        ₹{simResult.totalShippingCost.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>
        </div>);
};
