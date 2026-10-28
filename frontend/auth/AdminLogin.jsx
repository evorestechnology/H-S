import React, { useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { Shield, Factory, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { axiosInstance } from "../shared/lib/axios";
import { setPortalSession } from "../shared/services/authStorage";
import brandLogoWhite from "../assets/logo.png";
import "./AdminLogin.css";

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useParams();
    const activeRole = role === "manufacturer" || location.pathname.toLowerCase().includes("manufacturer") ? "manufacturer" : "admin";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        if (!email.trim()) {
            setErrorMessage("Please enter your email address.");
            return;
        }
        if (!password) {
            setErrorMessage("Please enter your password.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password,
                role: activeRole
            });
            const data = res.data;
            if (data.success && data.user) {
                setSuccessMessage(data.message || "Logged in successfully.");
                setPortalSession(activeRole, data.token || data.user.token, data.user);
                setTimeout(() => {
                    const userRole = (data.user?.role || "").toUpperCase();
                    if (userRole === "ADMIN" || userRole === "ADMINISTRATOR") {
                        navigate("/master");
                    }
                    else if (userRole === "MANUFACTURER") {
                        navigate("/manufacturer");
                    }
                    else {
                        navigate("/");
                    }
                }, 800);
            }
            else {
                setErrorMessage(data.message || "Invalid credentials.");
            }
        }
        catch (err) {
            setErrorMessage(err.response?.data?.message || "An unexpected error occurred. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6">
                    <img 
                        src={brandLogoWhite} 
                        alt="H&S Collective" 
                        className="h-10 w-auto object-contain mb-3 drop-shadow-sm"
                    />
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium tracking-wider text-neutral-300 uppercase">
                        {activeRole === "admin" ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span>Master Administrator Portal</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span>Manufacturer Portal</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Portal Role Switcher Tabs */}
                <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-800/80 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/login/admin')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeRole === 'admin' 
                                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60' 
                                : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <Shield size={14} className={activeRole === 'admin' ? 'text-red-400' : 'text-neutral-500'} />
                        <span>Admin</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login/manufacturer')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeRole === 'manufacturer' 
                                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60' 
                                : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <Factory size={14} className={activeRole === 'manufacturer' ? 'text-blue-400' : 'text-neutral-500'} />
                        <span>Manufacturer</span>
                    </button>
                </div>

                {/* Title */}
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">
                        {activeRole === "admin" ? "Admin Sign In" : "Manufacturer Sign In"}
                    </h1>
                    <p className="text-xs text-neutral-400">
                        {activeRole === "admin" 
                            ? "Sign in to manage catalog, orders, and system settings" 
                            : "Sign in to view assigned batch orders and manufacturing jobs"}
                    </p>
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                    <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/70 text-red-300 text-xs rounded-xl flex items-center gap-2.5">
                        <AlertCircle size={16} className="text-red-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-800/70 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                            <input 
                                type="email" 
                                className="admin-login-input w-full pl-11 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20 transition-all" 
                                placeholder={activeRole === "admin" ? "admin@hiandshi.shop" : "manufacturer@hiandshi.shop"} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="admin-login-input w-full pl-11 pr-11 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20 transition-all" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                            />
                            <button 
                                type="button" 
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer" 
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full mt-2 py-3 px-4 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={15} />
                                <span>Sign In to {activeRole === "admin" ? "Admin Portal" : "Manufacturer Portal"}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Return to Store Link */}
                <div className="mt-6 pt-5 border-t border-neutral-800/80 text-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={13} />
                        <span>Return to H&S Store</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
