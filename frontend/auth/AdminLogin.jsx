import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Shield, Factory, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { axiosInstance } from "../shared/lib/axios";
import { setPortalSession } from "../shared/services/authStorage";
const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useParams();
    const activeRole = role === "manufacturer" || location.pathname.toLowerCase().includes("manufacturer") ? "manufacturer" : "admin";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
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
    return (<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-none shadow-2xl">
                {/* Unified Role Switcher */}
                <div className="flex border-b border-neutral-800 mb-6 font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="flex-1 py-3 text-center uppercase tracking-wider font-bold text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login/admin')}
                        className={`flex-1 py-3 text-center uppercase tracking-wider font-bold transition-colors ${
                            activeRole === 'admin' ? 'text-white border-b-2 border-white bg-neutral-950' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login/manufacturer')}
                        className={`flex-1 py-3 text-center uppercase tracking-wider font-bold transition-colors ${
                            activeRole === 'manufacturer' ? 'text-white border-b-2 border-white bg-neutral-950' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        Manufacturer
                    </button>
                </div>

                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 text-xs font-mono tracking-widest text-neutral-300 uppercase mb-3">
                        {activeRole === "admin" ? (<>
                                <Shield size={14} className="text-red-500"/>
                                <span>Admin Portal</span>
                            </>) : (<>
                                <Factory size={14} className="text-blue-400"/>
                                <span>Manufacturer Portal</span>
                            </>)}
                    </div>
                    <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">
                        {activeRole === "admin" ? "Admin Sign In" : "Manufacturer Sign In"}
                    </h1>
                </div>

                {/* Quick Autofill Helper */}
                <div className="mb-6 p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between font-mono">
                    <div>
                        <strong>Demo {activeRole === "admin" ? "Admin" : "Mfg"}:</strong>{" "}
                        <span>{activeRole === "admin" ? "admin@hiandshi.shop" : "manufacturer@hiandshi.shop"}</span>
                    </div>
                    <button type="button" onClick={() => {
            if (activeRole === "admin") {
                setEmail("admin@hiandshi.shop");
                setPassword("Admin@123456");
            }
            else {
                setEmail("manufacturer@hiandshi.shop");
                setPassword("Mfg@123456");
            }
        }} className="px-2 py-1 bg-white text-black font-bold uppercase hover:bg-neutral-200 transition-colors text-[10px]">
                        Auto Fill
                    </button>
                </div>

                {errorMessage && (<div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs flex items-center gap-2 font-mono">
                        <AlertCircle size={16}/>
                        <span>{errorMessage}</span>
                    </div>)}

                {successMessage && (<div className="mb-4 p-3 bg-green-950/50 border border-green-800 text-green-400 text-xs flex items-center gap-2 font-mono">
                        <CheckCircle2 size={16}/>
                        <span>{successMessage}</span>
                    </div>)}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"/>
                            <input type="email" className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500" placeholder={activeRole === "admin" ? "admin@hiandshi.shop" : "manufacturer@hiandshi.shop"} value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"/>
                            <input type={showPassword ? "text" : "password"} className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                        {isLoading ? (<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>) : (<>
                                <LogIn size={16}/>
                                <span>Sign In to {activeRole === "admin" ? "Admin" : "Manufacturer"}</span>
                            </>)}
                    </button>
                </form>
            </div>
        </div>);
};
export default AdminLogin;
