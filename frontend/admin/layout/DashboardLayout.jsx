import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import "./DashboardLayout.css";
const RouteLoadingFallback = () => (<div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        width: "100%",
        gap: "0.75rem",
        color: "#64748B"
    }}>
        <div style={{
        width: "32px",
        height: "32px",
        border: "3px solid #E2E8F0",
        borderTopColor: "#3B82F6",
        borderRadius: "50%",
        animation: "hs-spin 0.8s linear infinite"
    }}/>
        <style>{`@keyframes hs-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Loading view...</span>
    </div>);
const DashboardLayout = () => {
    return (<div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-content">
                <main className="dashboard-main">
                    <Suspense fallback={<RouteLoadingFallback />}>
                        <Outlet />
                    </Suspense>
                </main>
                <Footer />
            </div>
        </div>);
};
export default DashboardLayout;
