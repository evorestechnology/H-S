import React from "react";
import { Building2, Save } from "lucide-react";
import "./StoreProfileCard.css";
export const StoreProfileCard = ({ storeSettings, setStoreSettings, onSave }) => {
    return (<div className="store-profile-card">
            <div className="card-title-row">
                <div className="card-title-left">
                    <div className="card-title-icon">
                        <Building2 size={20}/>
                    </div>
                    <div>
                        <h2>Store &amp; Business Profile</h2>
                        <p>Basic store contact details, currency, and business address</p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSave} className="settings-form">
                <div className="settings-form-grid">
                    <div className="form-group">
                        <label>Store Name</label>
                        <input type="text" className="form-input" value={storeSettings.storeName} onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label>Support Email</label>
                        <input type="email" className="form-input" value={storeSettings.storeEmail} onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label>Default Currency</label>
                        <input type="text" className="form-input" value={storeSettings.currency} onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label>Business Phone</label>
                        <input type="text" className="form-input" value={storeSettings.phone} onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}/>
                    </div>
                    <div className="form-group form-group-full">
                        <label>Registered Address</label>
                        <input type="text" className="form-input" value={storeSettings.address} onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}/>
                    </div>
                </div>

                <button type="submit" className="save-settings-btn mt-16">
                    <Save size={16}/>
                    <span>Save Store Profile</span>
                </button>
            </form>
        </div>);
};
