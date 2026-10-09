import "./WalletStats.css";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
const WalletStats = ({ metrics }) => {
    if (!metrics)
        return null;
    return (<div className="wallet-stats">
            <div className="wallet-card">
                <div>
                    <span className="card-title">TOTAL EARNINGS</span>
                    <h2>₹{metrics.lifetimeEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="card-icon lifetime">
                    <TrendingUp size={22}/>
                </div>
            </div>

            <div className="wallet-card highlight-mfg-card">
                <div>
                    <span className="card-title">PAID AMOUNT BY ADMIN</span>
                    <h2>₹{metrics.paidPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="card-icon balance-emerald">
                    <CheckCircle2 size={22}/>
                </div>
            </div>

            <div className="wallet-card">
                <div>
                    <span className="card-title">UNPAID AMOUNT</span>
                    <h2>₹{metrics.pendingPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="card-icon unpaid">
                    <Clock size={22}/>
                </div>
            </div>
        </div>);
};
export default WalletStats;
