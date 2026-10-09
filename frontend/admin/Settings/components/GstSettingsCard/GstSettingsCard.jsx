import React from "react";
import { Percent, Globe, Landmark, Save, ShieldCheck } from "lucide-react";
import "./GstSettingsCard.css";
export const GstSettingsCard = ({ taxSettings, setTaxSettings, onSave }) => {
    return (<div className="gst-settings-card">
            <div className="card-title-row">
                <div className="card-title-left">
                    <div className="card-title-icon">
                        <Percent size={20}/>
                    </div>
                    <div>
                        <h2>GST / IGST Tax Rules Configuration</h2>
                        <p>Configured domestic and international tax rate calculation rules</p>
                    </div>
                </div>
                <span className="rule-badge badge-active">
                    <ShieldCheck size={13}/>
                    Active Engine
                </span>
            </div>

            <form onSubmit={onSave} className="settings-form">
                {/* Rule 3.1: Non-Indian / International Tax Rule */}
                <div className="gst-rule-box">
                    <div className="rule-box-header">
                        <span className="rule-title">
                            <Globe size={16} className="text-primary"/>
                            3.1 International / Non-Indian Buyer Rule
                        </span>
                        <span className="rule-badge badge-intl">0% GST / IGST</span>
                    </div>
                    <p className="rule-description">
                        Orders placed by buyers outside India (Non-Indians / International destinations) are zero-rated for GST (Export of Goods).
                    </p>
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label>International Tax Rate (%)</label>
                            <input type="number" className="form-input" value={taxSettings.nonIndianRate} onChange={(e) => setTaxSettings({ ...taxSettings, nonIndianRate: Number(e.target.value) })} min="0" max="100" step="0.1"/>
                            <span className="field-hint">Fixed at 0% for non-Indian buyers</span>
                        </div>
                    </div>
                </div>

                {/* Rule 3.2: Indian Domestic Tiered Tax Rule */}
                <div className="gst-rule-box">
                    <div className="rule-box-header">
                        <span className="rule-title">
                            <Landmark size={16} className="text-primary"/>
                            3.2 Indian Domestic Buyer Tiered Rule
                        </span>
                        <span className="rule-badge badge-domestic">Tiered 5% / 18%</span>
                    </div>
                    <p className="rule-description">
                        Domestic orders within India are taxed based on product unit price threshold:
                        <br />
                        • Products up to <strong>₹2,500</strong>: <strong>5% GST</strong>
                        <br />
                        • Products above <strong>₹2,500</strong>: <strong>18% GST</strong>
                    </p>

                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label>Price Threshold (₹)</label>
                            <input type="number" className="form-input" value={taxSettings.indianThreshold} onChange={(e) => setTaxSettings({ ...taxSettings, indianThreshold: Number(e.target.value) })} placeholder="2500"/>
                        </div>
                        <div className="form-group">
                            <label>Rate for Price &le; Threshold (%)</label>
                            <input type="number" className="form-input" value={taxSettings.indianLowRate} onChange={(e) => setTaxSettings({ ...taxSettings, indianLowRate: Number(e.target.value) })} placeholder="5"/>
                        </div>
                        <div className="form-group form-group-full">
                            <label>Rate for Price &gt; Threshold (%)</label>
                            <input type="number" className="form-input" value={taxSettings.indianHighRate} onChange={(e) => setTaxSettings({ ...taxSettings, indianHighRate: Number(e.target.value) })} placeholder="18"/>
                        </div>
                    </div>

                    {/* Visual Slabs Cards */}
                    <div className="slabs-subgrid">
                        <div className="slab-card slab-low">
                            <span className="slab-rate-title">{taxSettings.indianLowRate}% GST</span>
                            <span className="slab-condition">&le; ₹{taxSettings.indianThreshold.toLocaleString("en-IN")}</span>
                            <span className="slab-note">Lower apparel GST slab</span>
                        </div>
                        <div className="slab-card slab-high">
                            <span className="slab-rate-title">{taxSettings.indianHighRate}% GST</span>
                            <span className="slab-condition">&gt; ₹{taxSettings.indianThreshold.toLocaleString("en-IN")}</span>
                            <span className="slab-note">Standard apparel GST slab</span>
                        </div>
                    </div>
                </div>

                <button type="submit" className="save-settings-btn">
                    <Save size={16}/>
                    <span>Save GST &amp; Tax Settings</span>
                </button>
            </form>
        </div>);
};
