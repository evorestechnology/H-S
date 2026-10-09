import { useState, useEffect, useCallback, useRef } from "react";
import "./Dashboard.css";
import { getDashboardData } from "./api";
import DashboardHeader from "./components/DashboardHeader/DashboardHeader";
import SummaryMetrics from "./components/SummaryMetrics/SummaryMetrics";
import SalesOverviewChart from "./components/SalesOverviewChart/SalesOverviewChart";
import OrderAnalyticsChart from "./components/OrderAnalyticsChart/OrderAnalyticsChart";
import RecentOrdersTable from "./components/RecentOrdersTable/RecentOrdersTable";
import { LatestDropsWidget, TopProductsWidget, RecentUsersWidget } from "./components/DashboardWidgets/DashboardWidgets";
import { QuickActionsWidget, RecentActivityWidget } from "./components/SidebarWidgets/SidebarWidgets";
const DEFAULT_REFRESH_INTERVAL_MS = 300000; // 5 minutes default
const Dashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState("7d");
    const hasMountedRef = useRef(false);
    // Read saved refresh interval preference (default to 5 mins / 300000ms)
    const [refreshInterval, setRefreshInterval] = useState(() => {
        try {
            const saved = localStorage.getItem("hs_admin_dashboard_refresh_interval");
            if (saved !== null) {
                const parsed = Number(saved);
                if (!isNaN(parsed))
                    return parsed;
            }
        }
        catch (e) {
            // LocalStorage unavailable fallback
        }
        return DEFAULT_REFRESH_INTERVAL_MS;
    });
    const fetchData = useCallback(async (isInitial = false, activePeriod = period) => {
        if (isInitial) {
            setIsLoading(true);
        }
        else {
            setIsRefreshing(true);
        }
        try {
            const result = await getDashboardData(activePeriod);
            setData(result);
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
        finally {
            if (isInitial) {
                setIsLoading(false);
            }
            setIsRefreshing(false);
        }
    }, [period]);
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        fetchData(false, newPeriod);
    };
    const handleRefreshIntervalChange = (newInterval) => {
        setRefreshInterval(newInterval);
        try {
            localStorage.setItem("hs_admin_dashboard_refresh_interval", String(newInterval));
        }
        catch (e) {
            // LocalStorage write fallback
        }
    };
    // Initial mount and cross-tab event listeners
    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            fetchData(true, period);
        }
        const handleFocus = () => {
            fetchData(false, period);
        };
        const handleStorageEvent = (event) => {
            if (event.key === "hs_orders_sync_event") {
                fetchData(false, period);
            }
        };
        window.addEventListener("focus", handleFocus);
        window.addEventListener("storage", handleStorageEvent);
        // Real-time synchronization across browser tabs (MFG updates -> Admin Dashboard)
        let channel = null;
        try {
            channel = new BroadcastChannel("hs_orders_sync_channel");
            channel.onmessage = (event) => {
                if (event.data?.type === "ORDER_CREATED" ||
                    event.data?.type === "ORDER_UPDATED" ||
                    event.data?.type === "TRACKING_UPDATED") {
                    fetchData(false, period);
                }
            };
        }
        catch (e) {
            // BroadcastChannel unsupported fallback
        }
        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("storage", handleStorageEvent);
            if (channel) {
                channel.close();
            }
        };
    }, [fetchData, period]);
    // Configurable auto-refresh interval (defaults to 5 minutes)
    useEffect(() => {
        if (refreshInterval <= 0)
            return;
        const pollTimer = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchData(false, period);
            }
        }, refreshInterval);
        return () => {
            clearInterval(pollTimer);
        };
    }, [refreshInterval, fetchData, period]);
    return (<div className="dashboard-page">
            <DashboardHeader search={search} onSearchChange={setSearch} onRefresh={() => fetchData(false, period)} isRefreshing={isRefreshing} refreshInterval={refreshInterval} onRefreshIntervalChange={handleRefreshIntervalChange} lastUpdated={lastUpdated}/>

            <SummaryMetrics summary={data?.summary || null} isLoading={isLoading}/>

            <div className="dashboard-main-layout">
                <div className="dashboard-main-content">
                    <div className="charts-grid">
                        <div className="chart-span-2">
                            <SalesOverviewChart data={data?.revenueAnalytics || []} isLoading={isLoading} period={period} onPeriodChange={handlePeriodChange}/>
                        </div>
                        <div className="chart-span-1">
                            <OrderAnalyticsChart data={data?.orderAnalytics || []} isLoading={isLoading}/>
                        </div>
                    </div>

                    <div className="widgets-grid">
                        <LatestDropsWidget drops={data?.latestDrops || []} isLoading={isLoading}/>
                        <TopProductsWidget products={data?.topSellingProducts || []} isLoading={isLoading}/>
                    </div>

                    <RecentOrdersTable orders={data?.recentOrders || []} isLoading={isLoading}/>
                </div>

                <div className="dashboard-sidebar">
                    <QuickActionsWidget />
                    <RecentUsersWidget users={data?.recentUsers || []} isLoading={isLoading}/>
                    <RecentActivityWidget activities={data?.activityFeed || []} isLoading={isLoading}/>
                </div>
            </div>
        </div>);
};
export default Dashboard;
