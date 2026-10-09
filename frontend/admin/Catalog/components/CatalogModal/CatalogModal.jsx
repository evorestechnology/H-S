import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./CatalogModal.css";
import { DropStatus } from "../../types";
const CatalogModal = ({ open, drop, onClose, onSubmit }) => {
    const [dropName, setDropName] = useState("");
    const [status, setStatus] = useState(DropStatus.DRAFT);
    const [error, setError] = useState("");
    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            if (drop) {
                setDropName(drop.dropName);
                setStatus(drop.status || DropStatus.DRAFT);
            }
            else {
                setDropName("");
                setStatus(DropStatus.DRAFT);
            }
            setError("");
        }
    }, [open, drop]);
    if (!open)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dropName.trim()) {
            setError("Drop Name is required.");
            return;
        }
        setError("");
        onSubmit(dropName, status);
    };
    return (<div className="modal-overlay">
            <div className="modal-content catalog-modal">
                <div className="modal-header">
                    <h2>{drop ? "Edit Drop" : "Add New Drop"}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="modal-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Drop Name</label>
                            <input type="text" className="input" placeholder="e.g. Summer Collection '26" value={dropName} onChange={(e) => setDropName(e.target.value)}/>
                        </div>

                        <div className="form-group" style={{ marginTop: "16px" }}>
                            <label>Drop Status</label>
                            <select className="input select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value={DropStatus.DRAFT}>Draft (Hidden from storefront)</option>
                                <option value={DropStatus.LIVE}>Live (Published on storefront)</option>
                                <option value={DropStatus.ARCHIVED}>Archived</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {drop ? "Save Changes" : "Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>);
};
export default CatalogModal;
