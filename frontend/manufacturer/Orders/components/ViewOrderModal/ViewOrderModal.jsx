import React, { useState, useMemo } from "react";
import "./ViewOrderModal.css";
import { X, Package, ChevronDown, Layers, Download, IndianRupee, Sliders, Eye, Tag } from "lucide-react";
import { downloadHardcodedNeckLogo, HARDCODED_NECK_LOGOS, isLightGarmentColor, NECK_LOGO_BLACK, NECK_LOGO_WHITE } from "../../../../shared/constants/neckLogos";
const formatCancellationTimestamp = (timestamp) => {
    if (!timestamp)
        return "N/A";
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime()))
            return timestamp;
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }) + ", " + d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }
    catch {
        return timestamp;
    }
};
const ProductItemCard = ({ order, itemObj, index, isExpanded, onToggle, handleDownloadDesignFile, handleDownloadNeckLogo }) => {
    const details = itemObj.productDetails;
    const mfgProductName = itemObj.mfgItemName ||
        details?.mfgProductName ||
        `H&S ${itemObj.name} (Ref: MFG-${order.id}-${index + 1})`;

    // Track active color (allows inspecting any catalog color variation directly in View Order)
    const [selectedColorName, setSelectedColorName] = useState(itemObj.color || "Standard");

    React.useEffect(() => {
        setSelectedColorName(itemObj.color || "Standard");
    }, [itemObj.color]);

    const availableColorsList = details?.availableColors || [];
    const activeColorObj = useMemo(() => {
        if (!availableColorsList.length) return null;
        return availableColorsList.find(c => (c.name || "").toLowerCase() === (selectedColorName || "").toLowerCase()) || availableColorsList[0];
    }, [availableColorsList, selectedColorName]);

    const isOrderedColorSelected = (selectedColorName || "").toLowerCase() === (itemObj.color || "").toLowerCase();

    const activeColorCode = activeColorObj?.code || activeColorObj?.hexCode || activeColorObj?.colorCode || (isOrderedColorSelected ? details?.colorCode : null);
    const activeFrontView = (isOrderedColorSelected ? details?.frontViewUrl : null) || activeColorObj?.frontView || activeColorObj?.frontImage || activeColorObj?.modelPhoto1 || (Array.isArray(activeColorObj?.modelPhotos) && activeColorObj.modelPhotos[0]) || null;
    const activeBackView = (isOrderedColorSelected ? details?.backViewUrl : null) || activeColorObj?.backView || activeColorObj?.backImage || activeColorObj?.modelPhoto2 || (Array.isArray(activeColorObj?.modelPhotos) && activeColorObj.modelPhotos[1]) || null;
    const activePrintWeave = (isOrderedColorSelected ? details?.printWeaveUrl : null) || activeColorObj?.printWeave || null;
    const activeBackWeave = (isOrderedColorSelected ? details?.backWeaveUrl : null) || activeColorObj?.backWeave || null;

    const isLightGarment = isLightGarmentColor(selectedColorName, activeColorCode);
    const recommendedNeckLogo = isLightGarment ? "black" : "white";
    const recommendedNeckLogoFileName = isLightGarment ? NECK_LOGO_BLACK.fileName : NECK_LOGO_WHITE.fileName;

    const rawPrintType = details?.printType ||
        details?.printingDetails?.printType ||
        details?.printingDetails?.method;
    const printTypeDisplay = typeof rawPrintType === "string" ? rawPrintType : "DTF Print";

    const rawPrintPosition = details?.printPosition ||
        details?.printingDetails?.printPosition;
    const printPositionDisplay = typeof rawPrintPosition === "string" ? rawPrintPosition : "Front Center";

    const rawDesignFile = details?.designFile ||
        details?.printingDetails?.designFile;
    const designFileSource = typeof rawDesignFile === "string" ? rawDesignFile : null;

    const rawFrontSpec = details?.printingDetails?.frontPrintSpec ||
        details?.printSpecs;
    const frontPrintSpecDisplay = typeof rawFrontSpec === "string"
        ? rawFrontSpec
        : (rawFrontSpec && typeof rawFrontSpec === "object"
            ? (rawFrontSpec.printType ? `${rawFrontSpec.printType} on ${rawFrontSpec.printPosition || "front"}` : null)
            : null);

    const configuredPlacements = useMemo(() => {
        // If ordered color is selected and backend resolved placements
        if (isOrderedColorSelected && Array.isArray(details?.printPlacements) && details.printPlacements.length > 0) {
            return details.printPlacements.map((p, pIdx) => {
                const pos = p.printPosition || (pIdx === 0 ? printPositionDisplay : "Back Center");
                const fallbackMockup = pos.toLowerCase().includes("back") ? activeBackView : activeFrontView;
                return {
                    index: p.placementIndex || pIdx + 1,
                    name: p.name || `Print Placement ${pIdx + 1}`,
                    position: pos,
                    type: p.printType || printTypeDisplay,
                    specs: p.specs || (pIdx === 0 ? frontPrintSpecDisplay : null),
                    designFile: p.designFile || (pIdx === 0 ? designFileSource : null),
                    mockup: p.mockup || fallbackMockup
                };
            });
        }

        // If inspecting another color and it has printSpecs
        if (activeColorObj && Array.isArray(activeColorObj.printSpecs) && activeColorObj.printSpecs.length > 0) {
            return activeColorObj.printSpecs.map((spec, sIdx) => {
                const pos = spec.placement || spec.position || (sIdx === 0 ? "Front Center" : "Back Center");
                const fallbackMockup = pos.toLowerCase().includes("back") ? activeBackView : activeFrontView;
                return {
                    index: sIdx + 1,
                    name: spec.name || (spec.technique === "DTF Print" ? `DTF Design ${sIdx + 1}` : `Print Placement ${sIdx + 1}`),
                    position: pos,
                    type: spec.technique || "DTF Print",
                    specs: spec.dimensions || (typeof spec.specs === "string" ? spec.specs : null),
                    designFile: spec.designFile || activeColorObj.designFile || null,
                    mockup: spec.mockup || fallbackMockup
                };
            });
        }

        if (Array.isArray(details?.printPlacements) && details.printPlacements.length > 0) {
            return details.printPlacements.map((p, pIdx) => {
                const pos = p.printPosition || (pIdx === 0 ? printPositionDisplay : "Back Center");
                const fallbackMockup = pos.toLowerCase().includes("back") ? activeBackView : activeFrontView;
                return {
                    index: p.placementIndex || pIdx + 1,
                    name: p.name || `Print Placement ${pIdx + 1}`,
                    position: pos,
                    type: p.printType || printTypeDisplay,
                    specs: p.specs || (pIdx === 0 ? frontPrintSpecDisplay : null),
                    designFile: p.designFile || (pIdx === 0 ? designFileSource : null),
                    mockup: p.mockup || fallbackMockup
                };
            });
        }

        return [
            {
                index: 1,
                name: "Print Placement 1",
                position: printPositionDisplay,
                type: printTypeDisplay,
                specs: frontPrintSpecDisplay,
                designFile: designFileSource,
                mockup: activeFrontView
            }
        ];
    }, [isOrderedColorSelected, details, activeColorObj, activeFrontView, activeBackView, printPositionDisplay, printTypeDisplay, frontPrintSpecDisplay, designFileSource]);

    // Financial calculations per item (Zero hardcoded multipliers, strict catalog resolution)
    const baseCost = typeof details?.costBreakdown?.baseCost === "number"
        ? details.costBreakdown.baseCost
        : (typeof details?.baseCost === "number"
            ? details.baseCost
            : (typeof details?.mfgBasePrice === "number"
                ? details.mfgBasePrice
                : (typeof itemObj.costBreakdown?.baseCost === "number"
                    ? itemObj.costBreakdown.baseCost
                    : 0)));
    const printCost = typeof details?.costBreakdown?.printingCost === "number"
        ? details.costBreakdown.printingCost
        : (typeof details?.printingCost === "number"
            ? details.printingCost
            : (typeof itemObj.costBreakdown?.printingCost === "number"
                ? itemObj.costBreakdown.printingCost
                : 0));
    const shipCost = typeof details?.costBreakdown?.shippingCost === "number"
        ? details.costBreakdown.shippingCost
        : (typeof details?.shippingCost === "number"
            ? details.shippingCost
            : (typeof itemObj.costBreakdown?.shippingCost === "number"
                ? itemObj.costBreakdown.shippingCost
                : 0));
    const otherCost = typeof details?.costBreakdown?.otherCost === "number"
        ? details.costBreakdown.otherCost
        : (typeof details?.otherCost === "number"
            ? details.otherCost
            : (typeof itemObj.costBreakdown?.otherCost === "number"
                ? itemObj.costBreakdown.otherCost
                : 0));
    const unitCalculatedTotal = typeof itemObj.unitMfgPrice === "number" && itemObj.unitMfgPrice > 0
        ? itemObj.unitMfgPrice
        : (typeof details?.costBreakdown?.total === "number" && details.costBreakdown.total > 0
            ? details.costBreakdown.total
            : (baseCost + printCost + shipCost + otherCost));
    const itemQuantity = itemObj.quantity || 1;
    const totalItemCalculated = unitCalculatedTotal * itemQuantity;
    const formattedIndex = String(index + 1).padStart(2, "0");

    return (<div className="order-accordion-card">
            {/* Accordion Header */}
            <div className="order-accordion-header" onClick={onToggle}>
                <div className="accordion-header-left">
                    <span className="item-index-badge">{formattedIndex}</span>
                    <div className="item-header-meta">
                        <h3>{(mfgProductName || itemObj.name || "").toUpperCase()}</h3>
                        <p>
                            Product: <strong style={{ color: "#0F172A" }}>{itemObj.name}</strong> &bull; Qty: <strong>{itemQuantity}</strong> &bull; Size: <strong>{itemObj.size}</strong> &bull; Color: <strong>{itemObj.color}</strong> &bull; Total: <strong className="price-text">₹{totalItemCalculated.toFixed(2)}</strong>
                        </p>
                    </div>
                </div>

                <div className="accordion-header-right">
                    <span className="badge-configured">Configured</span>
                    <div className={`arrow-circle-btn ${isExpanded ? "open" : ""}`}>
                        <ChevronDown size={16}/>
                    </div>
                </div>
            </div>

            {/* Accordion Body */}
            {isExpanded && (<div className="order-accordion-body">
                    {/* Product Title Banner */}
                    <div className="product-banner-card">
                        <div className="product-banner-glow"></div>
                        <div className="product-banner-content">
                            <span className="banner-label-chip">MANUFACTURE PRODUCT SPECIFICATION</span>
                            <h2 className="banner-title">{mfgProductName}</h2>

                            <div className="banner-badges-row">
                                <span className="banner-badge-pill">
                                    Product Name: <strong>{itemObj.name}</strong>
                                </span>
                                <span className="banner-badge-pill">
                                    Quantity: <strong>{itemQuantity} unit{itemQuantity > 1 ? "s" : ""}</strong>
                                </span>
                                <span className="banner-badge-pill">
                                    Size: <strong>{itemObj.size}</strong>
                                </span>
                                <span className="banner-badge-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    {activeColorCode && (<span style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: activeColorCode,
                    border: "1px solid rgba(255,255,255,0.4)"
                }}/>)}
                                    Color: <strong>{selectedColorName}</strong>
                                    {selectedColorName.toLowerCase() !== (itemObj.color || "").toLowerCase() && (
                                        <span style={{ color: "#F59E0B", fontSize: "10px", marginLeft: "4px" }}>(Ordered: {itemObj.color})</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Color Variations Switcher (Inspect other catalog colors) */}
                    {availableColorsList.length > 1 && (
                        <div className="view-order-color-picker-row">
                            <span className="color-picker-label">Inspect Catalog Color:</span>
                            <div className="color-picker-chips">
                                {availableColorsList.map((col, cIdx) => {
                                    const colName = col.name || col.colorName || `Color ${cIdx + 1}`;
                                    const isSelected = (selectedColorName || "").toLowerCase() === colName.toLowerCase();
                                    const isOrderedColor = (itemObj.color || "").toLowerCase() === colName.toLowerCase();
                                    return (
                                        <button
                                            key={colName + cIdx}
                                            type="button"
                                            className={`btn-color-chip ${isSelected ? "active" : ""}`}
                                            onClick={() => setSelectedColorName(colName)}
                                            title={`View assets configured for ${colName}`}
                                        >
                                            {col.colorCode && (
                                                <span
                                                    className="chip-dot"
                                                    style={{ backgroundColor: col.colorCode }}
                                                />
                                            )}
                                            <span>{colName}</span>
                                            {isOrderedColor && (
                                                <span className="chip-ordered-badge">Ordered</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Front & Back Views Grid */}
                    <div className="views-card-grid">
                        {/* Front View Card */}
                        <div className="view-card-box">
                            <div className="view-card-header">
                                <h4>Front View</h4>
                                <span className="view-tag-pill front">Front</span>
                            </div>
                            <div className="mockup-preview-container">
                                <div className="mockup-dark-box">
                                    <span className="mockup-watermark-tag">Mockup Preview</span>
                                    {activeFrontView ? (
                                        <img
                                            src={activeFrontView}
                                            alt={`${itemObj.name} Front View`}
                                            className="mockup-preview-image"
                                        />
                                    ) : (
                                        <div className="mockup-empty-placeholder">
                                            <Package size={32} style={{ opacity: 0.4 }} />
                                            <p>No Front View Uploaded</p>
                                            <span>No front view mockup configured for {selectedColorName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Back View Card */}
                        <div className="view-card-box">
                            <div className="view-card-header">
                                <h4>Back View</h4>
                                <span className="view-tag-pill back">Back</span>
                            </div>
                            <div className="mockup-preview-container">
                                <div className="mockup-dark-box">
                                    <span className="mockup-watermark-tag">Mockup Preview</span>
                                    {activeBackView ? (
                                        <img
                                            src={activeBackView}
                                            alt={`${itemObj.name} Back View`}
                                            className="mockup-preview-image"
                                        />
                                    ) : (
                                        <div className="mockup-empty-placeholder">
                                            <Package size={32} style={{ opacity: 0.4 }} />
                                            <p>No Back View Uploaded</p>
                                            <span>No back view mockup configured for {selectedColorName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weave Specifications (Print Weave & Back Weave) */}
                    <div className="weave-section-card">
                        <div className="section-header-row">
                            <h3>
                                <Layers size={18} className="header-blue-icon" /> Weave Specifications
                            </h3>
                            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                                Manufacturer fabric weave assets for {selectedColorName}
                            </span>
                        </div>

                        <div className="weave-grid">
                            {/* Print Weave (Front) */}
                            <div className="weave-card">
                                <div className="weave-card-header">
                                    <h5>Print Weave (Front)</h5>
                                    {activePrintWeave && (
                                        <button
                                            type="button"
                                            className="btn-card-download"
                                            onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_PrintWeave`, activePrintWeave, selectedColorName)}
                                            title="Download Print Weave Asset"
                                        >
                                            <Download size={12} />
                                            <span>Download</span>
                                        </button>
                                    )}
                                </div>
                                <div className="weave-preview-box">
                                    {activePrintWeave ? (
                                        <img
                                            src={activePrintWeave}
                                            alt={`${itemObj.name} Print Weave`}
                                            className="weave-preview-image"
                                        />
                                    ) : (
                                        <div className="mockup-empty-placeholder" style={{ minHeight: "150px" }}>
                                            <Package size={24} style={{ opacity: 0.4 }} />
                                            <p style={{ fontSize: "12px" }}>No Print Weave Configured</p>
                                            <span>Not uploaded in product catalog</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Back Weave */}
                            <div className="weave-card">
                                <div className="weave-card-header">
                                    <h5>Back Weave</h5>
                                    {activeBackWeave && (
                                        <button
                                            type="button"
                                            className="btn-card-download"
                                            onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_BackWeave`, activeBackWeave, selectedColorName)}
                                            title="Download Back Weave Asset"
                                        >
                                            <Download size={12} />
                                            <span>Download</span>
                                        </button>
                                    )}
                                </div>
                                <div className="weave-preview-box">
                                    {activeBackWeave ? (
                                        <img
                                            src={activeBackWeave}
                                            alt={`${itemObj.name} Back Weave`}
                                            className="weave-preview-image"
                                        />
                                    ) : (
                                        <div className="mockup-empty-placeholder" style={{ minHeight: "150px" }}>
                                            <Package size={24} style={{ opacity: 0.4 }} />
                                            <p style={{ fontSize: "12px" }}>No Back Weave Configured</p>
                                            <span>Not uploaded in product catalog</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print Placements & Artwork */}
                    <div className="placements-section-card">
                        <div className="section-header-row">
                            <h3>
                                <Layers size={18} className="header-blue-icon"/> Print Placements &amp; Artwork ({configuredPlacements.length})
                            </h3>
                        </div>

                        {configuredPlacements.map((placement) => {
                const chipClass = `placement-${((placement.index - 1) % 4) + 1}`;
                const isArtworkFile = Boolean(placement.designFile);
                const mockupImg = placement.mockup;
                return (<div key={placement.index} className="placement-item-box">
                                    <div className="placement-top-info">
                                        <div className="placement-meta-details">
                                            <span className={`placement-chip ${chipClass}`}>
                                                {placement.name}
                                            </span>
                                            <p>Placement Position: <span>{placement.position}</span></p>
                                            <p>Type: <span>{placement.type}</span></p>
                                            {placement.specs && (<p>Specs: <span style={{ color: "#94A3B8" }}>{placement.specs}</span></p>)}
                                        </div>
                                        <div className="placement-actions-group">
                                            {isArtworkFile && (<button type="button" className="btn-download-design" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Artwork`, placement.designFile, selectedColorName)} title="Download High-Res Print Artwork File">
                                                    <Download size={13}/>
                                                    <span>Print Artwork File [Download]</span>
                                                </button>)}
                                            {mockupImg && (<button type="button" className="btn-download-mockup" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Mockup`, mockupImg, selectedColorName)} title="Download Placement Mockup Preview">
                                                <Download size={13}/>
                                                <span>Mockup Preview [Download]</span>
                                            </button>)}
                                        </div>
                                    </div>

                                    {/* Dual Previews: Print Artwork & Mockup Preview */}
                                    <div className={`placement-previews-grid ${isArtworkFile ? "has-both" : ""}`}>
                                        {/* 1. Print Artwork File Card */}
                                        {isArtworkFile && (<div className="placement-preview-card">
                                                <div className="placement-preview-card-header">
                                                    <span className="preview-card-title">
                                                        <Tag size={13} className="text-blue-600"/> Print Artwork File
                                                    </span>
                                                    <button type="button" className="btn-card-download" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Artwork`, placement.designFile, selectedColorName)} title="Download High-Res Print Artwork File">
                                                        <Download size={12}/>
                                                        <span>Download Artwork</span>
                                                    </button>
                                                </div>
                                                <div className="mockup-dark-box" style={{
                            height: "220px",
                            backgroundColor: isLightGarment ? "#F8FAFC" : undefined,
                            border: isLightGarment ? "1px solid #CBD5E1" : undefined
                        }}>
                                                    <span className="mockup-watermark-tag" style={isLightGarment ? { color: "#0F172A", backgroundColor: "rgba(0, 0, 0, 0.08)" } : undefined}>
                                                        {(selectedColorName || "Garment").toUpperCase()} ARTWORK
                                                    </span>
                                                    <img src={placement.designFile} alt={`${placement.name} Artwork`} className="mockup-preview-image" style={{ objectFit: "contain" }}/>
                                                </div>
                                            </div>)}

                                        {/* 2. Mockup Preview Card */}
                                        <div className="placement-preview-card">
                                            <div className="placement-preview-card-header">
                                                <span className="preview-card-title">
                                                    <Eye size={13} className="text-emerald-600"/> Mockup Preview ({placement.position})
                                                </span>
                                                {mockupImg && (<button type="button" className="btn-card-download mockup-type" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Mockup`, mockupImg, selectedColorName)} title="Download Placement Mockup Preview">
                                                    <Download size={12}/>
                                                    <span>Download Mockup</span>
                                                </button>)}
                                            </div>
                                            <div className="mockup-dark-box" style={{ height: "220px" }}>
                                                <span className="mockup-watermark-tag">
                                                    MOCKUP PREVIEW
                                                </span>
                                                {mockupImg ? (
                                                    <img src={mockupImg} alt={`${placement.name} Mockup Preview`} className="mockup-preview-image" style={{ objectFit: "contain" }}/>
                                                ) : (
                                                    <div className="mockup-empty-placeholder" style={{ minHeight: "180px" }}>
                                                        <Package size={24} style={{ opacity: 0.4 }} />
                                                        <p style={{ fontSize: "12px" }}>No Placement Mockup Configured</p>
                                                        <span>Not uploaded in product catalog</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>);
            })}
                    </div>

                    {/* Neck Logo Download Assets */}
                    <div className="neck-logo-banner-card">
                        <div className="neck-logo-info">
                            <h4>Download Neck Logo Assets</h4>
                            <p>
                                Brand assets for inner collar tag printing. &bull;{" "}
                                <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                                    {isLightGarment ? "Light Garment" : "Dark Garment"} ({selectedColorName || "Standard"}): {recommendedNeckLogo.toUpperCase()} LOGO ({recommendedNeckLogoFileName})
                                </span>
                            </p>
                        </div>
                        <div className="neck-logo-btn-group">
                            <button className={`btn-logo-black ${recommendedNeckLogo === "black" ? "active-recommended-logo" : ""}`} onClick={() => handleDownloadNeckLogo("black")} style={recommendedNeckLogo === "black" ? { outline: "2px solid #3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.5)" } : {}}>
                                <Download size={13}/>
                                <span>Black Logo {recommendedNeckLogo === "black" ? "★ Recommended" : ""}</span>
                            </button>
                            <button className={`btn-logo-white ${recommendedNeckLogo === "white" ? "active-recommended-logo" : ""}`} onClick={() => handleDownloadNeckLogo("white")} style={recommendedNeckLogo === "white" ? { outline: "2px solid #3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.5)" } : {}}>
                                <Download size={13}/>
                                <span>White Logo {recommendedNeckLogo === "white" ? "★ Recommended" : ""}</span>
                            </button>
                        </div>
                    </div>

                    {/* Amount to Manufacturer for THIS item */}
                    <div className="pricing-section-card">
                        <div className="section-header-row">
                            <h3>
                                <IndianRupee size={18} style={{ color: "#059669" }}/> Manufacturer Cost Breakdown (Per Unit)
                            </h3>
                        </div>

                        <div className="pricing-cards-grid">
                            <div className="pricing-cost-card">
                                <span>Base Product Cost</span>
                                <p>₹{baseCost.toFixed(2)}</p>
                            </div>
                            <div className="pricing-cost-card">
                                <span>Printing Cost</span>
                                <p>₹{printCost.toFixed(2)}</p>
                            </div>
                            <div className="pricing-cost-card">
                                <span>Shipping Cost</span>
                                <p>₹{shipCost.toFixed(2)}</p>
                            </div>
                            <div className="pricing-cost-card">
                                <span>Other Cost</span>
                                <p>₹{otherCost.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="total-calculated-banner">
                            <div>
                                <h5>Calculated Item Total ({itemQuantity} unit{itemQuantity > 1 ? "s" : ""})</h5>
                                <p>Unit cost: ₹{unitCalculatedTotal.toFixed(2)} &times; {itemQuantity} qty</p>
                            </div>
                            <span className="calculated-total-amount">₹{totalItemCalculated.toFixed(2)}</span>
                        </div>
                    </div>
                </div>)}
        </div>);
};
const ViewOrderModal = ({ open, order, onClose, onRequestPriceAdj }) => {
    const [expandedItemIndex, setExpandedItemIndex] = useState(0);
    if (!open || !order)
        return null;
    const itemsToDisplay = (Array.isArray(order.items) && order.items.length > 0)
        ? order.items
        : [{
                id: `item-0`,
                productId: null,
                name: order.itemName,
                mfgItemName: order.mfgItemName,
                size: order.size,
                color: order.color,
                quantity: 1,
                price: order.amountPaid,
                productDetails: order.productDetails
            }];
    const isMultiItem = itemsToDisplay.length > 1;
    const handleDownloadDesignFile = async (assetName, specificFile, colorName) => {
        const targetUrl = specificFile || order.productDetails?.designFile;
        if (!targetUrl) {
            alert(`No artwork or design file uploaded for ${assetName || "this placement"}. Please configure this asset in the Product Catalog.`);
            return;
        }
        const ext = targetUrl.startsWith("data:image/png") ? "png" :
            targetUrl.startsWith("data:image/jpeg") ? "jpg" :
                targetUrl.startsWith("data:image/webp") ? "webp" :
                    targetUrl.startsWith("data:image/svg") ? "svg" :
                        targetUrl.includes(".pdf") ? "pdf" :
                            targetUrl.includes(".svg") ? "svg" : "png";
        const filename = `${order.id}_${(colorName || order.color || "Garment").replace(/\s+/g, "_")}_${assetName.replace(/\s+/g, "_")}.${ext}`;
        // If data uri or blob, trigger download directly
        if (targetUrl.startsWith("data:") || targetUrl.startsWith("blob:")) {
            const link = document.createElement("a");
            link.href = targetUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        // Try fetching as Blob so cross-origin URLs actually download directly
        try {
            const res = await fetch(targetUrl, { mode: "cors" });
            if (res.ok) {
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2500);
                return;
            }
        }
        catch (e) {
            console.warn("Direct blob download failed, falling back to anchor:", e);
        }
        // Fallback for cross-origin or restricted URLs
        const link = document.createElement("a");
        link.href = targetUrl;
        link.download = filename;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleDownloadNeckLogo = async (fontColor, _customUrl) => {
        await downloadHardcodedNeckLogo(fontColor);
    };
    const toggleItemAccordion = (index) => {
        if (expandedItemIndex === index) {
            setExpandedItemIndex(isMultiItem ? -2 : -1);
        }
        else {
            setExpandedItemIndex(index);
        }
    };
    const totalCalculatedMfgPayment = typeof order.mfgPayment === "number" && !isNaN(order.mfgPayment)
        ? order.mfgPayment
        : 0;
    return (<div className="view-order-modal-overlay" onClick={onClose}>
            <div className="view-order-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Global Order Header */}
                <div className="view-order-header">
                    <div className="header-brand-info">
                        <div className="header-icon-badge">
                            <Package size={20}/>
                        </div>
                        <div className="header-title-box">
                            <h1>Order #{order.id}</h1>
                            <p>
                                Customer ID: <span className="highlight-customer">{order.orderedBy || "Customer"}</span> &bull;{" "}
                                <span className="highlight-count">
                                    {isMultiItem ? `${itemsToDisplay.length} Products in Order` : "1 Item in Order"}
                                </span>
                                {(order.status === "Completed" || order.status === "Delivered") && (<> &bull; Delivered Date: <span style={{ color: "#10B981", fontWeight: 700 }}>{order.completedDate || order.orderedDate}</span></>)}
                            </p>
                        </div>
                    </div>
                    <button className="modal-close-icon-btn" onClick={onClose} title="Close Order Specifications">
                        <X size={18}/>
                    </button>
                </div>

                {/* Modal Body / Items Container */}
                <div className="view-order-body">
                    {/* Cancellation Alert Banner if order is cancelled */}
                    {(order.status === "Cancelled" || order.status?.toUpperCase() === "CANCELED") && (<div className="order-cancelled-alert-banner" style={{
                background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                border: "1px solid #f87171",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.08)"
            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "20px" }}>⚠️</span>
                                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#991b1b", letterSpacing: "0.5px" }}>
                                    ORDER CANCELLED
                                </h3>
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "#7f1d1d", fontWeight: 500 }}>
                                This order has been cancelled.
                            </p>
                            <div style={{ background: "#ffffff", borderRadius: "8px", padding: "10px 14px", border: "1px solid #fca5a5" }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", marginBottom: "4px", textTransform: "uppercase" }}>
                                    Reason
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937" }}>
                                    {order.cancelReason || "Cancellation reason not provided."}
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "2px" }}>
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", display: "block" }}>
                                        Cancelled By
                                    </span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                                        {order.cancelledByRole ? (order.cancelledByRole.toUpperCase() === "ADMIN" ? "Admin" : "Manufacturer") : "Admin"}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", display: "block" }}>
                                        Cancelled At
                                    </span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                                        {formatCancellationTimestamp(order.cancelledAt || order.orderedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>)}

                    {/* Multi-Item Quick Navigation Tabs Bar */}
                    {isMultiItem && (<div className="order-products-tabs-bar">
                            <div className="tabs-bar-label">
                                <Layers size={14}/>
                                <span>Select Product ({itemsToDisplay.length}):</span>
                            </div>
                            <div className="products-tabs-list">
                                {itemsToDisplay.map((itemObj, idx) => {
                const isActive = expandedItemIndex === idx;
                return (<button key={itemObj.id || idx} type="button" className={`product-tab-btn ${isActive ? "active" : ""}`} onClick={() => setExpandedItemIndex(idx)}>
                                            <span className="tab-idx">0{idx + 1}</span>
                                            <span className="tab-name">{itemObj.name}</span>
                                            <span className="tab-badge">{itemObj.size} &bull; {itemObj.color}</span>
                                            {itemObj.quantity > 1 && <span className="tab-qty">x{itemObj.quantity}</span>}
                                        </button>);
            })}
                                <button type="button" className={`product-tab-btn all-tab ${expandedItemIndex === -1 ? "active" : ""}`} onClick={() => setExpandedItemIndex(expandedItemIndex === -1 ? 0 : -1)} title="View all products at once">
                                    <span>{expandedItemIndex === -1 ? "View Single" : "Expand All"}</span>
                                </button>
                            </div>
                        </div>)}

                    {/* Multi-Item Summary Table Card */}
                    {isMultiItem && (<div className="order-items-summary-card">
                            <div className="summary-card-header">
                                <h4><Package size={15}/> All Products in this Order</h4>
                                <span className="summary-count-badge">{itemsToDisplay.length} Line Items</span>
                            </div>
                            <div className="summary-table-wrapper">
                                <table className="summary-items-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product Name</th>
                                            <th>Mfg Item Spec</th>
                                            <th>Size</th>
                                            <th>Color</th>
                                            <th>Qty</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsToDisplay.map((it, i) => (<tr key={it.id || i} className={expandedItemIndex === i ? "highlighted-row" : ""}>
                                                <td className="item-num">0{i + 1}</td>
                                                <td className="item-title font-semibold">{it.name}</td>
                                                <td className="item-mfg">{it.mfgItemName || it.productDetails?.mfgProductName || "—"}</td>
                                                <td><span className="table-pill size">{it.size}</span></td>
                                                <td>
                                                    <span className="table-pill color">
                                                        {it.productDetails?.colorCode && (<span className="color-dot" style={{ backgroundColor: it.productDetails.colorCode }}/>)}
                                                        {it.color}
                                                    </span>
                                                </td>
                                                <td className="font-bold">{it.quantity || 1}</td>
                                                <td>
                                                    <button type="button" className="btn-view-item-spec" onClick={() => setExpandedItemIndex(i)}>
                                                        <Eye size={12}/>
                                                        <span>{expandedItemIndex === i ? "Viewing" : "View"}</span>
                                                    </button>
                                                </td>
                                            </tr>))}
                                    </tbody>
                                </table>
                            </div>
                        </div>)}

                    {/* Render Each Product Card */}
                    {itemsToDisplay.map((itemObj, index) => (<ProductItemCard key={itemObj.id || index} order={order} itemObj={itemObj} index={index} isExpanded={expandedItemIndex === index || expandedItemIndex === -1} onToggle={() => toggleItemAccordion(index)} handleDownloadDesignFile={handleDownloadDesignFile} handleDownloadNeckLogo={handleDownloadNeckLogo}/>))}

                    {/* Total Amount to Manufacturer Card */}
                    <div className="pricing-section-card" style={{ marginTop: "24px" }}>
                        <div className="section-header-row">
                            <h3>
                                <IndianRupee size={18} style={{ color: "#059669" }}/> Total Order Payment to Manufacturer
                            </h3>
                        </div>

                        <div className="total-calculated-banner">
                            <div>
                                <h5>Total Approved Payment</h5>
                                <p>Aggregated manufacturer payment across all items in this order.</p>
                            </div>
                            <span className="calculated-total-amount">₹{totalCalculatedMfgPayment.toFixed(2)}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px" }}>
                            <button type="button" className="btn-price-adj-modal-action" onClick={() => {
            onClose();
            if (onRequestPriceAdj) {
                onRequestPriceAdj(order);
            }
        }}>
                                <Sliders size={14}/>
                                <span>Price Adjustment Request</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Action */}
                <div className="view-order-footer">
                    <button className="btn-close-specifications" onClick={onClose}>
                        Close Order Specifications
                    </button>
                </div>
            </div>
        </div>);
};
export default ViewOrderModal;
