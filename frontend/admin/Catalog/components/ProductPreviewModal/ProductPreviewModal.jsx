import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Tag, CheckCircle, AlertCircle, Sparkles, Layers, Image as ImageIcon, IndianRupee } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import "./ProductPreviewModal.css";
const ProductPreviewModal = ({ product, open, onClose }) => {
    if (!open || !product)
        return null;
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [activeImageOverride, setActiveImageOverride] = useState(null);
    // Reset image override when color variant changes
    useEffect(() => {
        setActiveImageOverride(null);
    }, [selectedColorIndex, product]);
    const selectedColor = product.colors?.[selectedColorIndex];
    // Determine candidate photos
    const colorFront = selectedColor?.frontView || "";
    const colorBack = selectedColor?.backView || "";
    const colorModel1 = selectedColor?.modelPhoto1 || "";
    const colorModel2 = selectedColor?.modelPhoto2 || "";
    const colorMockup = selectedColor?.mockup || "";
    const colorDesign = selectedColor?.designFile || "";
    const coverImg = product.coverPhoto || product.images?.[0] || "";
    // Active Display Image
    const activeImage = activeImageOverride || colorFront || colorMockup || coverImg || "";
    // Build unique list of thumbnails for current color variant & product
    const thumbnails = [];
    if (coverImg)
        thumbnails.push({ label: "Cover", url: coverImg });
    if (colorFront && colorFront !== coverImg)
        thumbnails.push({ label: "Front", url: colorFront });
    if (colorBack)
        thumbnails.push({ label: "Back", url: colorBack });
    if (colorModel1)
        thumbnails.push({ label: "Model 1", url: colorModel1 });
    if (colorModel2)
        thumbnails.push({ label: "Model 2", url: colorModel2 });
    if (colorMockup && colorMockup !== colorFront && colorMockup !== coverImg)
        thumbnails.push({ label: "Mockup", url: colorMockup });
    if (colorDesign)
        thumbnails.push({ label: "Design", url: colorDesign });
    // Deduplicate thumbnails by URL
    const uniqueThumbnails = thumbnails.filter((thumb, idx, self) => idx === self.findIndex(t => t.url === thumb.url));
    const userPrice = selectedColor?.userPrice || selectedColor?.sellingPrice || product.userPrice || product.price || 0;
    const manufacturePrice = selectedColor?.manufacturePrice || product.manufacturePrice;
    return createPortal(<div className="preview-modal-backdrop" onClick={onClose}>
            <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="preview-modal-header">
                    <div className="preview-modal-title-box">
                        <div className="preview-category-badge-group">
                            <span className="preview-category-badge">{product.category}</span>
                            {product.isNew && <span className="preview-pill-tag tag-new"><Sparkles size={11}/> NEW</span>}
                            {product.isBestSeller && <span className="preview-pill-tag tag-bestseller">BESTSELLER</span>}
                        </div>
                        <h3 className="preview-product-title">{product.name}</h3>
                        {product.manufactureName && (<span className="preview-mfr-name">Internal Mfr: {product.manufactureName}</span>)}
                    </div>
                    <button className="preview-close-btn" onClick={onClose} aria-label="Close Preview">
                        <X size={18}/>
                    </button>
                </div>

                {/* Body Layout */}
                <div className="preview-modal-body">
                    {/* Left Column: Gallery */}
                    <div className="preview-gallery-col">
                        <div className="preview-main-img-box">
                            {activeImage ? (<img src={getImageUrl(activeImage)} alt={product.name} className="preview-main-img"/>) : (<div className="preview-img-placeholder">
                                    <ImageIcon size={40}/>
                                    <span>No Image Preview Available</span>
                                </div>)}
                            {activeImage && (<button className="preview-open-tab-btn" onClick={() => window.open(getImageUrl(activeImage), "_blank")} title="Open Full Resolution Image in New Tab">
                                    <ExternalLink size={13}/>
                                    Full Resolution
                                </button>)}
                        </div>

                        {/* Thumbnails Row */}
                        {uniqueThumbnails.length > 1 && (<div className="preview-thumbnails-section">
                                <span className="preview-sub-label">Image Views ({uniqueThumbnails.length}):</span>
                                <div className="preview-thumbnails-row">
                                    {uniqueThumbnails.map((thumb, idx) => {
                const isSelected = getImageUrl(activeImage) === getImageUrl(thumb.url);
                return (<button key={idx} className={`preview-thumb-btn ${isSelected ? "selected" : ""}`} onClick={() => setActiveImageOverride(thumb.url)} title={`View ${thumb.label}`}>
                                                <img src={getImageUrl(thumb.url)} alt={thumb.label}/>
                                                <span className="preview-thumb-caption">{thumb.label}</span>
                                            </button>);
            })}
                                </div>
                            </div>)}
                    </div>

                    {/* Right Column: Meta Details */}
                    <div className="preview-details-col">
                        {/* Price Breakdown Cards */}
                        <div className="preview-price-cards-grid">
                            <div className="preview-price-card user-price-card">
                                <div className="preview-card-header">
                                    <IndianRupee size={14} className="icon-emerald"/>
                                    <span>Storefront Price</span>
                                </div>
                                <span className="preview-card-val user-val">₹{userPrice.toLocaleString("en-IN")}</span>
                            </div>
                            {manufacturePrice !== undefined && manufacturePrice !== null && manufacturePrice > 0 && (<div className="preview-price-card mfr-price-card">
                                    <div className="preview-card-header">
                                        <Layers size={14} className="icon-amber"/>
                                        <span>Manufacture Cost</span>
                                    </div>
                                    <span className="preview-card-val mfr-val">₹{manufacturePrice.toLocaleString("en-IN")}</span>
                                </div>)}
                        </div>

                        {/* Badges Row */}
                        <div className="preview-badges-row">
                            <span className={`preview-badge ${product.inStock ? "badge-in-stock" : "badge-out-of-stock"}`}>
                                {product.inStock ? <CheckCircle size={13}/> : <AlertCircle size={13}/>}
                                {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                            <span className="preview-badge badge-gender">
                                <Tag size={13}/>
                                {product.gender || "Unisex"}
                            </span>
                            {product.fit && (<span className="preview-badge badge-fit">
                                    <Layers size={13}/>
                                    {product.fit}
                                </span>)}
                        </div>

                        {/* Color Variants Picker */}
                        {product.colors && product.colors.length > 0 && (<div className="preview-section">
                                <div className="preview-section-header">
                                    <label className="preview-section-label">Color Variants</label>
                                    <span className="preview-section-count">{product.colors.length} selected</span>
                                </div>
                                <div className="preview-color-swatches">
                                    {product.colors.map((c, idx) => (<button key={idx} className={`preview-color-btn ${selectedColorIndex === idx ? "selected" : ""}`} onClick={() => setSelectedColorIndex(idx)} title={c.name}>
                                            <span className="preview-swatch-dot" style={{ backgroundColor: c.code || "#000" }}/>
                                            <span className="preview-color-name">{c.name}</span>
                                        </button>))}
                                </div>
                            </div>)}

                        {/* Available Sizes */}
                        {product.sizes && product.sizes.length > 0 && (<div className="preview-section">
                                <label className="preview-section-label">Available Sizes</label>
                                <div className="preview-sizes-list">
                                    {product.sizes.map((s, idx) => {
                const label = typeof s === "string" ? s : s.size;
                const isAvail = typeof s === "string" ? true : s.isAvailable !== false;
                return (<span key={idx} className={`preview-size-tag ${isAvail ? "avail" : "unavail"}`}>
                                                {label}
                                            </span>);
            })}
                                </div>
                            </div>)}

                        {/* Description */}
                        {product.description && (<div className="preview-section">
                                <label className="preview-section-label">Product Overview</label>
                                <p className="preview-description">{product.description}</p>
                            </div>)}

                        {/* Designer Note */}
                        {product.designerNote && (<div className="preview-section">
                                <label className="preview-section-label">Designer's Note</label>
                                <p className="preview-subtext-info">{product.designerNote}</p>
                            </div>)}

                        {/* Care Instructions */}
                        {product.washCare && (<div className="preview-section">
                                <label className="preview-section-label">Wash & Care Instructions</label>
                                <p className="preview-subtext-info">{product.washCare}</p>
                            </div>)}

                        {/* Shipping Note */}
                        {product.shippingNote && (<div className="preview-section">
                                <label className="preview-section-label">Shipping & Delivery Note</label>
                                <p className="preview-subtext-info">{product.shippingNote}</p>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>, document.body);
};
export default ProductPreviewModal;
