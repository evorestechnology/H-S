import React, { useState, useEffect } from "react";
import { Truck, Scale, ShieldCheck, Save, Globe } from "lucide-react";
import "./ShippingSettingsCard.css";
import { useCategoryWeightRules, updateCategoryWeightRules } from "../../../../shared/services/categoryService";
export const ShippingSettingsCard = ({ blockStepKg, setBlockStepKg, ratePerBlock, setRatePerBlock, onSave }) => {
    const activeWeightRules = useCategoryWeightRules();
    const [localRules, setLocalRules] = useState(activeWeightRules);
    useEffect(() => {
        setLocalRules(activeWeightRules);
    }, [activeWeightRules]);
    const handleRuleChange = (index, field, value) => {
        const updated = [...localRules];
        updated[index] = { ...updated[index], [field]: value };
        setLocalRules(updated);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCategoryWeightRules(localRules);
        }
        catch (err) {
            console.error("Failed to save category weight rules to database:", err);
        }
        onSave(e);
    };
    return (<div className="shipping-settings-card">
            <div className="card-title-row">
                <div className="card-title-left">
                    <div className="card-title-icon">
                        <Truck size={20}/>
                    </div>
                    <div>
                        <h2>International Freight &amp; Weight Shipping Rules</h2>
                        <p>Weight-based slab calculation for international shipments outside India</p>
                    </div>
                </div>
                <span className="rule-badge badge-active">
                    <ShieldCheck size={13}/>
                    Active Freight Engine
                </span>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
                {/* 5kg Block Rule Box */}
                <div className="gst-rule-box">
                    <div className="rule-box-header">
                        <span className="rule-title">
                            <Globe size={16} className="text-primary"/>
                            International Slab Step Freight Rule
                        </span>
                        <span className="rule-badge badge-intl">₹{ratePerBlock.toLocaleString("en-IN")} per {blockStepKg}kg</span>
                    </div>
                    <p className="rule-description">
                        International orders are charged in incremental <strong>{blockStepKg}kg slabs</strong>.
                        Every {blockStepKg}kg (or fraction thereof) adds <strong>₹{ratePerBlock.toLocaleString("en-IN")}</strong> to the total customer shipping fee.
                        <br />
                        <em>Example: 6.5 kg or 8.25 kg falls in the 5.1kg–10kg slab (2 blocks) = ₹10,000 shipping.</em>
                    </p>

                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label>Slab Weight Block Step (kg)</label>
                            <input type="number" className="form-input" value={blockStepKg} onChange={(e) => setBlockStepKg(Number(e.target.value) || 5)} min="1" step="1"/>
                        </div>
                        <div className="form-group">
                            <label>Rate Per {blockStepKg}kg Block (₹)</label>
                            <input type="number" className="form-input" value={ratePerBlock} onChange={(e) => setRatePerBlock(Number(e.target.value) || 5000)} min="500" step="500"/>
                        </div>
                    </div>
                </div>

                {/* Garment Weight Conversion Matrix */}
                <div className="gst-rule-box">
                    <div className="rule-box-header">
                        <span className="rule-title">
                            <Scale size={16} className="text-primary"/>
                            Garment Weight Conversion Matrix (1 kg Standards)
                        </span>
                    </div>
                    <p className="rule-description">
                        Standard weights used to auto-calculate order parcel total weight. Categories added in Category Settings appear here automatically:
                    </p>

                    <div className="weight-matrix-table-container">
                        <table className="weight-matrix-table">
                            <thead>
                                <tr>
                                    <th>GARMENT CATEGORY</th>
                                    <th>CONVERSION RULE</th>
                                    <th>WEIGHT PER PIECE (KG)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localRules.map((rule, idx) => (<tr key={rule.categoryName}>
                                        <td>
                                            <strong style={{ color: "#0F172A", fontSize: "13px" }}>{rule.categoryName}</strong>
                                        </td>
                                        <td>
                                            <input type="text" className="table-inline-input" value={rule.conversionRule} onChange={(e) => handleRuleChange(idx, "conversionRule", e.target.value)} placeholder={`1 kg = 2 ${rule.categoryName}`}/>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <input type="number" className="table-inline-input weight-input" value={rule.weightPerPiece} onChange={(e) => handleRuleChange(idx, "weightPerPiece", Number(e.target.value) || 0)} step="0.001" min="0.001"/>
                                                <span className="weight-pill">kg</span>
                                            </div>
                                        </td>
                                    </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button type="submit" className="save-settings-btn">
                    <Save size={16}/>
                    <span>Save Shipping &amp; Freight Rules</span>
                </button>
            </form>
        </div>);
};
