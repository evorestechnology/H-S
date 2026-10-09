import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Edit3, LogOut, ChevronDown, X, Check } from "lucide-react";
import "./ManufacturerHeader.css";
import apiClient from "../../shared/services/apiClient";
import { getPortalUser, setPortalSession, clearPortalSession, getPortalToken } from "../../shared/services/authStorage";
const ManufacturerHeader = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Edit form states
    const [editName, setEditName] = useState("");
    const [editCompany, setEditCompany] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    useEffect(() => {
        loadUserSession();
        // Authoritative Database Sync for Profile
        apiClient.get("/users/profile")
            .then(profile => {
            if (profile) {
                const dbUser = {
                    id: profile.id,
                    name: profile.fullName || "",
                    email: profile.email || "",
                    role: profile.role || "MANUFACTURER",
                    companyName: profile.companyName,
                    phone: profile.mobile,
                    avatar: profile.avatar
                };
                setUser(prev => ({ ...(prev || {}), ...dbUser }));
                setEditName(dbUser.name);
                setEditEmail(dbUser.email);
                if (dbUser.companyName)
                    setEditCompany(dbUser.companyName);
                if (dbUser.phone)
                    setEditPhone(dbUser.phone);
                if (dbUser.avatar)
                    setEditAvatar(dbUser.avatar);
                // Update cached manufacturer session
                const token = getPortalToken("manufacturer");
                if (token) {
                    setPortalSession("manufacturer", token, dbUser, true);
                }
            }
        })
            .catch(() => {
            // Session cached fallback handled by loadUserSession
        });
    }, []);
    const loadUserSession = () => {
        const parsed = getPortalUser("manufacturer");
        if (parsed) {
            setUser(parsed);
            setEditName(parsed.name || "");
            setEditCompany(parsed.companyName || "");
            setEditEmail(parsed.email || "");
            setEditPhone(parsed.phone || "");
            setEditAvatar(parsed.avatar || "");
        }
        else {
            setUser(null);
        }
    };
    const handleLogout = () => {
        clearPortalSession("manufacturer");
        navigate("/login/manufacturer");
    };
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        const updatedUser = {
            ...user,
            name: editName.trim(),
            companyName: editCompany.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim(),
            avatar: editAvatar.trim()
        };
        // Persist authoritatively to backend database
        try {
            await apiClient.put("/users/profile", {
                fullName: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.phone
            });
        }
        catch (err) {
            console.error("Failed to persist profile update to database", err);
        }
        setUser(updatedUser);
        // Sync portal session cache
        const token = getPortalToken("manufacturer");
        setPortalSession("manufacturer", token, updatedUser, true);
        setIsEditModalOpen(false);
        setIsDropdownOpen(false);
    };
    if (!user)
        return null;
    return (<>
            <header className="manufacturer-header">
                {/* Header Left Brand Tag */}
                <div className="header-left">
                    <div className="manufacturer-badge-tag">
                        <Factory size={15}/>
                        <span>Manufacturer Portal</span>
                    </div>
                    <span className="header-title-text">
                        {user.companyName || "Supply Chain Dashboard"}
                    </span>
                </div>

                {/* Header Right Profile Menu */}
                <div className="header-right">
                    <button className="profile-pill-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <img src={user.avatar ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} alt={user.name} className="profile-avatar-img"/>
                        <div className="profile-info-mini">
                            <span className="profile-name">{user.name}</span>
                            <span className="profile-company">
                                {user.companyName || "Manufacturer"}
                            </span>
                        </div>
                        <ChevronDown size={16} color="#64748b"/>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (<div className="profile-dropdown-menu">
                            <div className="dropdown-header-card">
                                <img src={user.avatar ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} alt={user.name} className="dropdown-avatar"/>
                                <div className="dropdown-user-details">
                                    <span className="dropdown-name">{user.name}</span>
                                    <span className="dropdown-email">{user.email}</span>
                                    <span className="dropdown-role-badge">
                                        {user.role} Portal
                                    </span>
                                </div>
                            </div>

                            <div className="dropdown-divider"/>

                            <button className="dropdown-item-btn" onClick={() => {
                setIsEditModalOpen(true);
                setIsDropdownOpen(false);
            }}>
                                <Edit3 size={16}/>
                                <span>Edit Profile</span>
                            </button>

                            <button className="dropdown-item-btn logout" onClick={handleLogout}>
                                <LogOut size={16}/>
                                <span>Logout</span>
                            </button>
                        </div>)}
                </div>
            </header>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (<div className="modal-backdrop">
                    <div className="edit-profile-modal">
                        <div className="modal-header-bar">
                            <h3>Edit Manufacturer Profile</h3>
                            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="modal-body-content">
                            <div className="modal-field">
                                <label className="modal-label">Full Name</label>
                                <div className="input-wrapper">
                                    <input type="text" className="modal-input" value={editName} onChange={(e) => setEditName(e.target.value)} required/>
                                </div>
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Company / Brand Name</label>
                                <div className="input-wrapper">
                                    <input type="text" className="modal-input" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} required/>
                                </div>
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Email Address</label>
                                <div className="input-wrapper">
                                    <input type="email" className="modal-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required/>
                                </div>
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <input type="text" className="modal-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}/>
                                </div>
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Avatar Image URL</label>
                                <div className="input-wrapper">
                                    <input type="url" className="modal-input" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)}/>
                                </div>
                            </div>

                            <div className="modal-footer-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    <Check size={16}/>
                                    <span>Save Profile</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>)}
        </>);
};
export default ManufacturerHeader;
