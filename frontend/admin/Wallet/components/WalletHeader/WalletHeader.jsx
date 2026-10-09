import "./WalletHeader.css";
import { Download, RefreshCw } from "lucide-react";
const WalletHeader = ({ onRefresh, onExport }) => {
    return (<div className="wallet-header">
            <div className="wallet-header-left">
                <h1>Wallet &amp; Treasury</h1>
                <p>Manage admin earnings, manufacturer payouts, and financial transaction ledger.</p>
            </div>

            <div className="wallet-header-actions">
                <button className="btn-wallet-secondary" onClick={onRefresh}>
                    <RefreshCw size={16}/>
                    <span>Refresh</span>
                </button>
                <button className="btn-wallet-primary" onClick={onExport}>
                    <Download size={16}/>
                    <span>Export Ledger</span>
                </button>
            </div>
        </div>);
};
export default WalletHeader;
