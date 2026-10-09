import { useState, useRef, useEffect } from "react";
import "./UserActions.css";
import { Edit2, RefreshCw, ChevronDown } from "lucide-react";
const statusOptions = ["Active", "Live", "Inactive", "Blocked"];
const UserActions = ({ user, onEdit, onChangeStatus }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelectStatus = (newStatus) => {
        onChangeStatus?.(user.id, newStatus);
        setDropdownOpen(false);
    };
    return (<div className="user-action-buttons" ref={dropdownRef}>
            <div className="change-status-wrapper">
                <button className="change-status-btn" title="Change Status" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <RefreshCw size={13} className="spin-icon-hover"/>
                    <span>Change Status</span>
                    <ChevronDown size={13}/>
                </button>

                {dropdownOpen && (<div className="status-dropdown-menu">
                        <div className="dropdown-title">Select New Status</div>
                        {statusOptions.map((option) => (<button key={option} className={`dropdown-item ${user.status === option ? "selected" : ""}`} onClick={() => handleSelectStatus(option)}>
                                <span className={`status-dot-mini ${option.toLowerCase()}`}></span>
                                {option}
                            </button>))}
                    </div>)}
            </div>

            <button className="action-btn edit-btn" title="Edit User Details" onClick={() => onEdit?.(user)}>
                <Edit2 size={15}/>
            </button>
        </div>);
};
export default UserActions;
