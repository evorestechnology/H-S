import { RefreshCw, Search, Clock } from "lucide-react";
import "./DashboardHeader.css";
const DashboardHeader = ({ search, onSearchChange, onRefresh, isRefreshing = false, refreshInterval, onRefreshIntervalChange, lastUpdated }) => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const formatLastUpdated = (date) => {
        if (!date)
            return "--:--";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    return (<div className="dashboard-header">
            <div className="header-titles">
                <h1>Dashboard</h1>
                <p>Monitor your clothing brand's overall performance and recent business activities.</p>
            </div>
            
            <div className="header-actions">
                <div className="dashboard-search">
                    <Search size={18} className="search-icon"/>
                    <input type="text" placeholder="Search orders, users, products..." value={search} onChange={(e) => onSearchChange(e.target.value)}/>
                </div>
                
                <div className="header-date">
                    <span>{today}</span>
                </div>

                <div className="dashboard-refresh-controls">
                    <div className="refresh-interval-wrapper" title="Configure dashboard auto-refresh interval">
                        <Clock size={15} className="refresh-clock-icon"/>
                        <span className="refresh-label">Auto-refresh:</span>
                        <select className="refresh-interval-select" value={refreshInterval} onChange={(e) => onRefreshIntervalChange(Number(e.target.value))} aria-label="Auto-refresh interval">
                            <option value={60000}>Every 1m</option>
                            <option value={120000}>Every 2m</option>
                            <option value={300000}>Every 5m (Default)</option>
                            <option value={600000}>Every 10m</option>
                            <option value={900000}>Every 15m</option>
                            <option value={0}>Off (Manual)</option>
                        </select>
                    </div>

                    {lastUpdated && (<div className="last-sync-tag" title={`Last synchronized at ${formatLastUpdated(lastUpdated)}`}>
                            <span className="sync-dot"></span>
                            <span>{formatLastUpdated(lastUpdated)}</span>
                        </div>)}

                    <button className={`btn btn-secondary btn-icon btn-refresh ${isRefreshing ? 'refreshing' : ''}`} onClick={onRefresh} disabled={isRefreshing} title={isRefreshing ? "Refreshing..." : "Refresh Dashboard Now"}>
                        <RefreshCw size={17} className={isRefreshing ? "spin-icon" : ""}/>
                    </button>
                </div>
            </div>
        </div>);
};
export default DashboardHeader;
