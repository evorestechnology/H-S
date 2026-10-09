import React from "react";
import { Landmark, Truck, Layers } from "lucide-react";
import "./SettingsHeader.css";
export const SettingsHeader = ({ activeTab, setActiveTab }) => {
    return (<div className="settings-header-wrapper">
            <div className="settings-header-top">
                <div>
                    <h1>System &amp; Business Settings</h1>
                    <p>Configure GST tax rules, product categories, and international freight slabs.</p>
                </div>
            </div>

            <div className="settings-tabs-row">
                <button className={`settings-tab-btn ${activeTab === "gst" ? "active-tab" : ""}`} onClick={() => setActiveTab("gst")}>
                    <Landmark size={16}/>
                    <span>GST &amp; Tax Configuration</span>
                </button>

                <button className={`settings-tab-btn ${activeTab === "categories" ? "active-tab" : ""}`} onClick={() => setActiveTab("categories")}>
                    <Layers size={16}/>
                    <span>Product Categories</span>
                </button>

                <button className={`settings-tab-btn ${activeTab === "shipping" ? "active-tab" : ""}`} onClick={() => setActiveTab("shipping")}>
                    <Truck size={16}/>
                    <span>Shipping &amp; Freight Rules</span>
                </button>
            </div>
        </div>);
};
