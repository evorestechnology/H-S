import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SettingsHeader } from "./components/SettingsHeader/SettingsHeader";
import { GstSettingsCard } from "./components/GstSettingsCard/GstSettingsCard";
import { GstSimulatorCard } from "./components/GstSimulatorCard/GstSimulatorCard";
import { CategorySettingsCard } from "./components/CategorySettingsCard/CategorySettingsCard";
import { ShippingSettingsCard } from "./components/ShippingSettingsCard/ShippingSettingsCard";
import { ShippingSimulatorCard } from "./components/ShippingSimulatorCard/ShippingSimulatorCard";
import { getSettings, updateTaxSettings, updateShippingSettings } from "./api";
import "./Settings.css";
const Settings = () => {
    const [activeTab, setActiveTab] = useState("gst");
    const [blockStepKg, setBlockStepKg] = useState(0);
    const [ratePerBlock, setRatePerBlock] = useState(0);
    const [taxSettings, setTaxSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const loadSettings = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const data = await getSettings();
            if (data.taxSettings) {
                setTaxSettings(data.taxSettings);
            }
            if (data.shippingSettings) {
                setBlockStepKg(data.shippingSettings.blockStepKg);
                setRatePerBlock(data.shippingSettings.ratePerBlock);
            }
        }
        catch (err) {
            console.error("Failed to load settings from server:", err);
            setLoadError(err?.message || "Failed to load settings from database. Please check your backend connection.");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadSettings();
    }, []);
    const handleSaveTax = async (e) => {
        e.preventDefault();
        if (!taxSettings)
            return;
        try {
            setSaveError(null);
            await updateTaxSettings(taxSettings);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }
        catch (err) {
            setSaveError(err?.message || "Failed to save tax settings to database.");
            setTimeout(() => setSaveError(null), 4000);
        }
    };
    const handleSaveShipping = async (e) => {
        e.preventDefault();
        try {
            setSaveError(null);
            await updateShippingSettings({ blockStepKg, ratePerBlock });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }
        catch (err) {
            setSaveError(err?.message || "Failed to save shipping settings to database.");
            setTimeout(() => setSaveError(null), 4000);
        }
    };
    return (<div className="settings-page">
            <SettingsHeader activeTab={activeTab} setActiveTab={setActiveTab}/>

            {savedSuccess && (<div className="success-alert-banner">
                    <CheckCircle2 size={16}/>
                    <span>Settings successfully updated and saved to database!</span>
                </div>)}

            {saveError && (<div className="success-alert-banner" style={{ background: "#FEE2E2", color: "#DC2626", borderColor: "#FCA5A5" }}>
                    <AlertCircle size={16}/>
                    <span>{saveError}</span>
                </div>)}

            {loadError && (<div className="success-alert-banner" style={{ background: "#FEE2E2", color: "#DC2626", borderColor: "#FCA5A5" }}>
                    <AlertCircle size={16}/>
                    <span>{loadError}</span>
                    <button onClick={loadSettings} style={{ marginLeft: "12px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold" }}>
                        Retry
                    </button>
                </div>)}

            {isLoading ? (<div style={{ padding: "48px", textAlign: "center", color: "#64748B", fontSize: "15px" }}>
                    Loading configuration from PostgreSQL database...
                </div>) : (<>
                    {activeTab === "gst" && taxSettings && (<div className="settings-content-grid">
                            <GstSettingsCard taxSettings={taxSettings} setTaxSettings={setTaxSettings} onSave={handleSaveTax}/>
                            <GstSimulatorCard taxSettings={taxSettings}/>
                        </div>)}

                    {activeTab === "categories" && (<CategorySettingsCard />)}

                    {activeTab === "shipping" && (<div className="settings-content-grid">
                            <ShippingSettingsCard blockStepKg={blockStepKg} setBlockStepKg={setBlockStepKg} ratePerBlock={ratePerBlock} setRatePerBlock={setRatePerBlock} onSave={handleSaveShipping}/>
                            <ShippingSimulatorCard blockStepKg={blockStepKg} ratePerBlock={ratePerBlock}/>
                        </div>)}
                </>)}
        </div>);
};
export default Settings;
