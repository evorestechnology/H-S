import { useState } from "react";
import { Edit, Trash2, ChevronDown, ChevronUp, Calendar, Package, Plus } from "lucide-react";
import "./DropCard.css";
import ProductGrid from "../ProductGrid/ProductGrid";
import { DropStatus } from "../../types";
const DropCard = ({ drop, onEdit, onDelete, onAddProduct, onEditProduct, onUpdateStatus, onUpdateProductPrice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(!isOpen);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };
    const currentStatus = drop.status || DropStatus.DRAFT;
    return (<div className={`drop-card ${isOpen ? "expanded" : ""}`}>
            <div className="drop-card-header">
                <div className="drop-info-main">
                    <h3 className="drop-name">{drop.dropName}</h3>
                    
                    {/* Interactive Drop Status Dropdown */}
                    <div className="drop-status-badge-container" onClick={(e) => e.stopPropagation()}>
                        <select className={`drop-status-badge-select status-${currentStatus.toLowerCase()}`} value={currentStatus} onChange={(e) => onUpdateStatus?.(drop.id, e.target.value)} title="Click to change drop status (Live / Draft / Archived)">
                            <option value={DropStatus.DRAFT}>Draft</option>
                            <option value={DropStatus.LIVE}>Live</option>
                            <option value={DropStatus.ARCHIVED}>Archived</option>
                        </select>
                    </div>
                </div>
                
                <div className="drop-meta">
                    <div className="meta-item">
                        <Calendar size={14}/>
                        <span>Created: {formatDate(drop.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                        <Package size={14}/>
                        <span>{drop.products?.length || 0} Products</span>
                    </div>
                </div>

                <div className="drop-actions">
                    <button className="btn btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 hover:border-zinc-400 transition-all cursor-pointer" onClick={() => onAddProduct(drop.id)} title="Add Product to this Drop">
                        <Plus size={15} />
                        <span>Add Product</span>
                    </button>
                    <button className={`btn ${isOpen ? 'btn-primary' : 'btn-secondary'} btn-open`} onClick={toggleOpen}>
                        {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {isOpen ? "Close" : "Open"}
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={() => onEdit(drop.id)} title="Edit Drop">
                        <Edit size={16}/>
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => onDelete(drop.id)} title="Delete Drop">
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>

            {isOpen && (<div className="drop-content">
                    <div className="drop-content-header" style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
                        <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => onAddProduct(drop.id)}>
                            <Plus size={16}/>
                            Add Product
                        </button>
                    </div>
                    <ProductGrid products={drop.products || []} onEditProduct={(p) => onEditProduct(drop.id, p)} onUpdateProductPrice={onUpdateProductPrice ? (productId, newPrice) => onUpdateProductPrice(drop.id, productId, newPrice) : undefined}/>
                </div>)}
        </div>);
};
export default DropCard;
