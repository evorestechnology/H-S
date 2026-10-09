import { useState } from "react";
import { Eye, Edit2, Pencil, Check, X, Loader2 } from "lucide-react";
import "./ProductCard.css";
import { getImageUrl } from "../../utils/imageUrl";
import ProductPreviewModal from "../ProductPreviewModal/ProductPreviewModal";
const ProductCard = ({ product, onEdit, onUpdatePrice }) => {
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [priceInput, setPriceInput] = useState("");
    const [isSavingPrice, setIsSavingPrice] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const mainImageUrl = getImageUrl(product.coverPhoto || product.images?.[0]);
    // Calculate effective user price
    const validUserPrices = (product.colors || [])
        .map(c => c.userPrice ?? c.sellingPrice)
        .filter((p) => typeof p === "number" && p > 0);
    const minUserP = validUserPrices.length > 0 ? Math.min(...validUserPrices) : (product.userPrice || product.price || 0);
    const maxUserP = validUserPrices.length > 0 ? Math.max(...validUserPrices) : (product.userPrice || product.price || 0);
    const userPriceStr = minUserP !== maxUserP
        ? `₹${minUserP.toLocaleString("en-IN")} - ₹${maxUserP.toLocaleString("en-IN")}`
        : `₹${(minUserP || 0).toLocaleString("en-IN")}`;
    const handleStartEditPrice = (e) => {
        e.stopPropagation();
        setPriceInput(String(minUserP || 0));
        setIsEditingPrice(true);
    };
    const handleSaveInlinePrice = async (e) => {
        if (e)
            e.stopPropagation();
        const num = Number(priceInput);
        if (isNaN(num) || num < 0)
            return;
        if (!onUpdatePrice)
            return;
        try {
            setIsSavingPrice(true);
            await onUpdatePrice(product.id, num);
            setIsEditingPrice(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        }
        catch (err) {
            console.error("Failed to update user price:", err);
        }
        finally {
            setIsSavingPrice(false);
        }
    };
    const handleCancelEditPrice = (e) => {
        e.stopPropagation();
        setIsEditingPrice(false);
    };
    return (<>
            <div className="product-card">
                <div className="product-image-wrapper" onClick={() => setShowPreviewModal(true)} style={{ cursor: "pointer" }}>
                    {mainImageUrl ? (<img src={mainImageUrl} alt={product.name} className="product-image"/>) : (<div className="product-image-placeholder">No Cover Photo</div>)}
                    <div className={`product-badge ${product.inStock ? "badge-success" : "badge-danger"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                </div>
                
                <div className="product-info">
                    <div className="product-header">
                        <span className="product-category">{product.category}</span>
                        <div className="product-card-prices-stack">
                            {(() => {
            const validMfrPrices = (product.colors || [])
                .map(c => c.manufacturePrice)
                .filter((p) => typeof p === "number" && p > 0);
            const minMfrP = validMfrPrices.length > 0 ? Math.min(...validMfrPrices) : product.manufacturePrice;
            const maxMfrP = validMfrPrices.length > 0 ? Math.max(...validMfrPrices) : product.manufacturePrice;
            const mfrPriceStr = minMfrP && maxMfrP
                ? (minMfrP !== maxMfrP
                    ? `₹${minMfrP.toLocaleString("en-IN")} - ₹${maxMfrP.toLocaleString("en-IN")}`
                    : `₹${minMfrP.toLocaleString("en-IN")}`)
                : null;
            return (<div className="product-dual-prices">
                                        {isEditingPrice ? (<div className="product-price-inline-editor" onClick={(e) => e.stopPropagation()}>
                                                <div className="inline-price-input-wrapper">
                                                    <span className="inline-currency-symbol">₹</span>
                                                    <input type="number" className="inline-price-input" value={priceInput} min="0" step="1" autoFocus disabled={isSavingPrice} onChange={(e) => setPriceInput(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveInlinePrice();
                        }
                        else if (e.key === "Escape") {
                            e.preventDefault();
                            setIsEditingPrice(false);
                        }
                    }}/>
                                                </div>
                                                <div className="inline-price-actions">
                                                    <button type="button" className="btn-inline-price-save" title="Save Price" disabled={isSavingPrice || !priceInput || Number(priceInput) < 0} onClick={handleSaveInlinePrice}>
                                                        {isSavingPrice ? <Loader2 size={12} className="spin-icon"/> : <Check size={12}/>}
                                                    </button>
                                                    <button type="button" className="btn-inline-price-cancel" title="Cancel" disabled={isSavingPrice} onClick={handleCancelEditPrice}>
                                                        <X size={12}/>
                                                    </button>
                                                </div>
                                            </div>) : (<div className="product-user-price-row">
                                                <span className={`product-price user-price-badge ${onUpdatePrice ? "clickable-price" : ""}`} title={onUpdatePrice ? "Click to edit Storefront User Price" : "User Price (Storefront)"} onClick={onUpdatePrice ? handleStartEditPrice : undefined}>
                                                    {userPriceStr}
                                                </span>
                                                {onUpdatePrice && (<button type="button" className="btn-edit-user-price" title="Edit User Price" onClick={handleStartEditPrice}>
                                                        <Pencil size={11}/>
                                                    </button>)}
                                                {saveSuccess && (<span className="price-save-success-tag">✓ Saved</span>)}
                                            </div>)}
                                        {mfrPriceStr && (<span className="product-mfr-price-badge" title="Manufacture Price (Internal)">
                                                Mfr: {mfrPriceStr}
                                            </span>)}
                                    </div>);
        })()}
                        </div>
                    </div>
                    
                    <h4 className="product-name" onClick={() => setShowPreviewModal(true)} style={{ cursor: "pointer" }}>
                        {product.name}
                    </h4>
                    
                    <div className="product-variants">
                        <div className="product-colors">
                            {(product.colors || []).map((color, idx) => {
            const isAvail = color.isAvailable !== false;
            return (<div key={idx} className={`color-swatch ${isAvail ? "" : "swatch-unavailable"}`} style={{ backgroundColor: color.code }} title={isAvail ? color.name : `${color.name} (Not Available)`}/>);
        })}
                        </div>
                        <div className="product-sizes">
                            {(product.sizes || []).slice(0, 3).map((item, idx) => {
            const sizeLabel = typeof item === "string" ? item : item.size;
            const isAvail = typeof item === "string" ? true : item.isAvailable;
            return (<span key={idx} className={`size-pill ${isAvail ? "" : "size-unavailable"}`} title={isAvail ? sizeLabel : `${sizeLabel} (Not Available)`}>
                                        {sizeLabel}
                                    </span>);
        })}
                            {(product.sizes || []).length > 3 && (<span className="size-pill">+{(product.sizes || []).length - 3}</span>)}
                        </div>
                    </div>
                    
                    <div className="product-actions">
                        <button className="btn btn-secondary product-btn" onClick={() => setShowPreviewModal(true)}>
                            <Eye size={16}/>
                            Preview
                        </button>
                        <button className="btn btn-secondary product-btn" onClick={() => onEdit(product)}>
                            <Edit2 size={16}/>
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Lightbox / High-Res Interactive Preview Modal */}
            <ProductPreviewModal product={product} open={showPreviewModal} onClose={() => setShowPreviewModal(false)}/>
        </>);
};
export default ProductCard;
