import "./WalletStats.css";
import { TrendingUp, Factory, CheckCircle2, Clock, Sparkles, Receipt } from "lucide-react";
const WalletStats = ({ metrics }) => {
    if (!metrics)
        return null;
    const totalGst = metrics.totalGstAmount ?? metrics.totalGst ?? 0;
    return (<div className="wallet-stats-grid">
            {/* 1. Gross Revenue (Total Sale Value) */}
            <div className="wallet-stat-card card-gross-revenue">
                <div className="stat-info">
                    <span className="stat-label">GROSS REVENUE (TOTAL SALE VALUE)</span>
                    <h2 className="stat-value">₹{metrics.grossRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Total Order Sales</span>
                </div>
                <div className="stat-icon-wrapper icon-gross">
                    <TrendingUp size={24}/>
                </div>
            </div>

            {/* 2. Manufacture Earnings */}
            <div className="wallet-stat-card card-mfg-earnings">
                <div className="stat-info">
                    <span className="stat-label">MANUFACTURE EARNINGS</span>
                    <h2 className="stat-value">₹{metrics.manufactureEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Total Production Cost</span>
                </div>
                <div className="stat-icon-wrapper icon-mfg">
                    <Factory size={24}/>
                </div>
            </div>

            {/* 3. Paid to Manufacture */}
            <div className="wallet-stat-card card-paid-mfg">
                <div className="stat-info">
                    <span className="stat-label">PAID TO MANUFACTURE</span>
                    <h2 className="stat-value text-emerald">₹{metrics.paidToManufacture.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Settled Disbursals</span>
                </div>
                <div className="stat-icon-wrapper icon-paid">
                    <CheckCircle2 size={24}/>
                </div>
            </div>

            {/* 4. Pending Payout to Manufacture */}
            <div className="wallet-stat-card card-pending-mfg">
                <div className="stat-info">
                    <span className="stat-label">PENDING PAYOUT TO MANUFACTURE</span>
                    <h2 className="stat-value text-amber">₹{metrics.pendingPayoutToManufacture.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Outstanding Balance</span>
                </div>
                <div className="stat-icon-wrapper icon-pending">
                    <Clock size={24}/>
                </div>
            </div>

            {/* 5. Total GST Amount (Collected) */}
            <div className="wallet-stat-card card-total-gst">
                <div className="stat-info">
                    <span className="stat-label">TOTAL GST AMOUNT (COLLECTED)</span>
                    <h2 className="stat-value text-cyan">₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Tax Collected from Orders</span>
                </div>
                <div className="stat-icon-wrapper icon-gst">
                    <Receipt size={24}/>
                </div>
            </div>

            {/* 6. Our Earnings */}
            <div className="wallet-stat-card card-our-earnings highlight-card">
                <div className="stat-info">
                    <span className="stat-label">OUR EARNINGS</span>
                    <h2 className="stat-value text-gradient">₹{metrics.ourEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    <span className="stat-subtext">Net Platform Profit</span>
                </div>
                <div className="stat-icon-wrapper icon-earnings">
                    <Sparkles size={24}/>
                </div>
            </div>
        </div>);
};
export default WalletStats;
