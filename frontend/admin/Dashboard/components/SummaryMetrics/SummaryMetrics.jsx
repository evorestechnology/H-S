import { IndianRupee, TrendingUp, ShoppingBag, Clock, CheckCircle2, Users, PackageOpen, Tag, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "./SummaryMetrics.css";
const SummaryMetrics = ({ summary, isLoading }) => {
    if (isLoading || !summary) {
        return (<div className="metrics-grid">
                {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="metric-card skeleton-card">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-line short"></div>
                            <div className="skeleton-line large"></div>
                            <div className="skeleton-line tiny"></div>
                        </div>
                    </div>))}
            </div>);
    }
    const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (value) => (value || 0).toLocaleString("en-IN");
    const renderTrend = (growth) => {
        if (growth === 0)
            return <span className="metric-change neutral">— 0% from last month</span>;
        const isPositive = growth > 0;
        return (<span className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                {Math.abs(growth)}% 
                <span className="metric-change-text"> from last month</span>
            </span>);
    };
    const metrics = [
        {
            title: "Total Revenue",
            value: formatCurrency(summary.totalRevenue),
            growth: summary.totalRevenueGrowth,
            icon: <IndianRupee size={24}/>,
            color: "primary"
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(summary.todaysRevenue),
            growth: summary.todaysRevenueGrowth,
            icon: <TrendingUp size={24}/>,
            color: "primary"
        },
        {
            title: "Total Orders",
            value: formatNumber(summary.totalOrders),
            growth: summary.totalOrdersGrowth,
            icon: <ShoppingBag size={24}/>,
            color: "secondary"
        },
        {
            title: "Pending Orders",
            value: formatNumber(summary.pendingOrders),
            growth: summary.pendingOrdersGrowth,
            icon: <Clock size={24}/>,
            color: "warning"
        },
        {
            title: "Delivered Orders",
            value: formatNumber(summary.completedOrders),
            growth: summary.completedOrdersGrowth,
            icon: <CheckCircle2 size={24}/>,
            color: "success"
        },
        {
            title: "Total Users",
            value: formatNumber(summary.totalUsers),
            growth: summary.totalUsersGrowth,
            icon: <Users size={24}/>,
            color: "info"
        },
        {
            title: "Active Drops",
            value: formatNumber(summary.activeDrops),
            growth: summary.activeDropsGrowth,
            icon: <PackageOpen size={24}/>,
            color: "purple"
        },
        {
            title: "Products Sold",
            value: formatNumber(summary.productsSold),
            growth: summary.productsSoldGrowth,
            icon: <Tag size={24}/>,
            color: "primary"
        },
        {
            title: "Wallet Balance",
            value: formatCurrency(summary.walletBalance),
            growth: summary.walletBalanceGrowth,
            icon: <Wallet size={24}/>,
            color: "success"
        }
    ];
    return (<div className="metrics-grid">
            {metrics.map((metric, index) => (<div key={index} className="metric-card">
                    <div className="metric-content">
                        <h3>{metric.title}</h3>
                        <p className="metric-value">{metric.value}</p>
                        {renderTrend(metric.growth)}
                    </div>
                    <div className={`metric-icon icon-${metric.color}`}>
                        {metric.icon}
                    </div>
                </div>))}
        </div>);
};
export default SummaryMetrics;
