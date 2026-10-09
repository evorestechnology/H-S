import React, { useState, useMemo } from "react";
import "./ViewOrderModal.css";
import { X, Package, ChevronDown, Layers, Download, IndianRupee, Sliders, Eye, Tag } from "lucide-react";
import { downloadHardcodedNeckLogo, HARDCODED_NECK_LOGOS } from "../../../../shared/constants/neckLogos";
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
/**
 * Dynamic SVG Generator for Front View, Back View, and Neck Tag assets
 */
const generateSvgDataUri = (type, itemName, colorName, sizeName, colorCode) => {
    let garmentColor = "#0A0A0C"; // Default deep black/dark
    const lowerColor = (colorName || "").toLowerCase().trim();
    if (colorCode && colorCode.startsWith("#")) {
        garmentColor = colorCode;
    }
    else if (lowerColor.includes("white") || lowerColor.includes("snow") || lowerColor.includes("ivory") || lowerColor.includes("cream")) {
        garmentColor = "#F8FAFC";
    }
    else if (lowerColor.includes("black") || lowerColor.includes("noir") || lowerColor.includes("pitch")) {
        garmentColor = "#0A0A0C";
    }
    else if (lowerColor.includes("gray") || lowerColor.includes("grey") || lowerColor.includes("charcoal") || lowerColor.includes("ash")) {
        garmentColor = "#334155";
    }
    else if (lowerColor.includes("navy") || lowerColor.includes("blue") || lowerColor.includes("cobalt")) {
        garmentColor = "#1E3A8A";
    }
    else if (lowerColor.includes("green") || lowerColor.includes("olive") || lowerColor.includes("forest")) {
        garmentColor = "#14532D";
    }
    else if (lowerColor.includes("lime") || lowerColor.includes("neon")) {
        garmentColor = "#65A30D";
    }
    else if (lowerColor.includes("red") || lowerColor.includes("crimson") || lowerColor.includes("maroon") || lowerColor.includes("burgundy")) {
        garmentColor = "#881337";
    }
    else if (lowerColor.includes("beige") || lowerColor.includes("sand") || lowerColor.includes("tan")) {
        garmentColor = "#D4B996";
    }
    else if (lowerColor.includes("brown") || lowerColor.includes("coffee")) {
        garmentColor = "#451A03";
    }
    else if (lowerColor.includes("yellow") || lowerColor.includes("gold")) {
        garmentColor = "#CA8A04";
    }
    else if (lowerColor.includes("pink") || lowerColor.includes("rose")) {
        garmentColor = "#BE185D";
    }
    else if (lowerColor.includes("purple") || lowerColor.includes("violet")) {
        garmentColor = "#581C87";
    }
    else if (lowerColor.includes("orange")) {
        garmentColor = "#C2410C";
    }
    const isLightBg = garmentColor.toLowerCase() === "#f8fafc" ||
        garmentColor.toLowerCase() === "#ffffff" ||
        garmentColor.toLowerCase() === "#d4b996" ||
        lowerColor.includes("white") ||
        lowerColor.includes("cream") ||
        lowerColor.includes("light") ||
        lowerColor.includes("beige") ||
        lowerColor.includes("yellow");
    const strokeColor = isLightBg ? "#334155" : "#475569";
    const textColor = isLightBg ? "#0F172A" : "#FFFFFF";
    const printAccent = isLightBg ? "#1D4ED8" : "#38BDF8";
    let svgString = "";
    if (type === "front") {
        svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
            <rect width="500" height="500" fill="#0B1320" rx="16"/>
            <g transform="translate(100, 60)">
                <path d="M 60 40 Q 150 70 240 40 L 290 90 L 245 130 L 230 340 L 70 340 L 55 130 L 10 90 Z" fill="${garmentColor}" stroke="${strokeColor}" stroke-width="3"/>
                <path d="M 110 42 Q 150 90 190 42" fill="none" stroke="${strokeColor}" stroke-width="3"/>
                <rect x="100" y="120" width="100" height="110" fill="none" stroke="${printAccent}" stroke-width="2" stroke-dasharray="4"/>
                <text x="150" y="112" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="${printAccent}" text-anchor="middle">FRONT CHEST (12" x 14")</text>
                <circle cx="150" cy="160" r="22" fill="${printAccent}" opacity="0.8"/>
                <text x="150" y="165" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="${isLightBg ? "#FFFFFF" : "#0F172A"}" text-anchor="middle">H&amp;S</text>
                <text x="150" y="200" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="${textColor}" text-anchor="middle">ATHLETICS</text>
            </g>
            <text x="250" y="445" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" text-anchor="middle">FRONT VIEW MOCKUP - ${itemName.toUpperCase()}</text>
            <text x="250" y="468" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="${printAccent}" text-anchor="middle">COLOR: ${(colorName || "STANDARD").toUpperCase()}</text>
        </svg>
        `.trim();
    }
    else if (type === "back") {
        svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
            <rect width="500" height="500" fill="#0B1320" rx="16"/>
            <g transform="translate(100, 60)">
                <path d="M 60 40 Q 150 55 240 40 L 290 90 L 245 130 L 230 340 L 70 340 L 55 130 L 10 90 Z" fill="${garmentColor}" stroke="${strokeColor}" stroke-width="3"/>
                <path d="M 110 42 Q 150 55 190 42" fill="none" stroke="${strokeColor}" stroke-width="3"/>
                <rect x="80" y="100" width="140" height="170" fill="none" stroke="#10B981" stroke-width="2" stroke-dasharray="4"/>
                <text x="150" y="92" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#10B981" text-anchor="middle">BACK CENTER (14" x 16")</text>
                <text x="150" y="150" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="${textColor}" text-anchor="middle" letter-spacing="2">EVORES</text>
                <text x="150" y="180" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#10B981" text-anchor="middle">PERFORMANCE</text>
                <text x="150" y="230" font-family="Inter, sans-serif" font-size="42" font-weight="900" fill="${textColor}" text-anchor="middle" opacity="0.9">01</text>
            </g>
            <text x="250" y="445" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" text-anchor="middle">BACK VIEW MOCKUP - ${(colorName || "STANDARD").toUpperCase()}</text>
            <text x="250" y="468" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#10B981" text-anchor="middle">BACK PRINT SPECIFICATION</text>
        </svg>
        `.trim();
    }
    else {
        const logoFileName = isLightBg ? "neck logo black.png" : "neck logo white.png";
        const fontColorLabel = isLightBg ? "Black Font" : "White Font";
        const fontHexColor = isLightBg ? "#000000" : "#FFFFFF";
        const labelBgColor = isLightBg ? "#F8FAFC" : "#1E293B";
        const strokeBorderColor = isLightBg ? "#94A3B8" : "#F59E0B";
        const neckLogoUri = isLightBg ? HARDCODED_NECK_LOGOS.black.dataUri : HARDCODED_NECK_LOGOS.white.dataUri;
        svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
            <rect width="500" height="500" fill="#0B1320" rx="16"/>
            <g transform="translate(100, 60)">
                <rect x="20" y="20" width="260" height="340" rx="12" fill="${labelBgColor}" stroke="${strokeBorderColor}" stroke-width="3"/>
                <path d="M 120 40 Q 150 15 180 40" fill="none" stroke="${strokeBorderColor}" stroke-dasharray="3" stroke-width="2"/>
                <image href="${neckLogoUri}" x="40" y="55" width="220" height="75" preserveAspectRatio="xMidYMid meet"/>
                <line x1="50" y1="145" x2="250" y2="145" stroke="${isLightBg ? "#CBD5E1" : "#334155"}" stroke-width="2"/>
                <rect x="35" y="155" width="230" height="32" rx="6" fill="${isLightBg ? "#E2E8F0" : "#0F172A"}" stroke="${strokeBorderColor}" stroke-width="1.5"/>
                <text x="150" y="175" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="${fontHexColor}" text-anchor="middle">FILE: ${logoFileName}</text>
                <text x="150" y="225" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="${isLightBg ? "#0F172A" : "#F59E0B"}" text-anchor="middle">${sizeName}</text>
                <text x="150" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#94A3B8" text-anchor="middle">380 GSM HEAVYWEIGHT COTTON</text>
                <text x="150" y="280" font-family="Inter, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">MACHINE WASH COLD • DO NOT BLEACH</text>
            </g>
            <text x="250" y="465" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#64748B" text-anchor="middle">NECK TAG PREVIEW (${logoFileName} - ${fontColorLabel})</text>
        </svg>
        `.trim();
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};
const ProductItemCard = ({ order, itemObj, index, isExpanded, onToggle, handleDownloadDesignFile, handleDownloadNeckLogo }) => {
    const details = itemObj.productDetails;
    const mfgProductName = itemObj.mfgItemName ||
        details?.mfgProductName ||
        `H&S ${itemObj.name} (Ref: MFG-${order.id}-${index + 1})`;
    const frontSvg = generateSvgDataUri("front", itemObj.name, itemObj.color, itemObj.size, details?.colorCode);
    const backSvg = generateSvgDataUri("back", itemObj.name, itemObj.color, itemObj.size, details?.colorCode);
    const lowerColor = (itemObj.color || "").toLowerCase().trim();
    const isLightGarment = lowerColor.includes("white") ||
        lowerColor.includes("cream") ||
        lowerColor.includes("light") ||
        lowerColor.includes("yellow") ||
        lowerColor.includes("beige") ||
        lowerColor.includes("sand");
    const recommendedNeckLogo = isLightGarment ? "black" : "white";
    const recommendedNeckLogoFileName = isLightGarment ? "neck logo black.png" : "neck logo white.png";
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
    const rawBackSpec = details?.printingDetails?.backPrintSpec;
    const backPrintSpecDisplay = typeof rawBackSpec === "string" ? rawBackSpec : null;
    const configuredPlacements = useMemo(() => {
        if (Array.isArray(details?.printPlacements) && details.printPlacements.length > 0) {
            return details.printPlacements.map((p, pIdx) => {
                const pos = p.printPosition || (pIdx === 0 ? printPositionDisplay : "Back Center");
                const fallbackMockup = pos.toLowerCase().includes("back")
                    ? (details?.backViewUrl || backSvg)
                    : (details?.frontViewUrl || frontSvg);
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
        const list = [
            {
                index: 1,
                name: "Print Placement 1",
                position: printPositionDisplay,
                type: printTypeDisplay,
                specs: frontPrintSpecDisplay,
                designFile: designFileSource,
                mockup: details?.frontViewUrl || frontSvg
            }
        ];
        if (backPrintSpecDisplay && backPrintSpecDisplay !== "Full graphic artwork back print (14 in x 18 in)") {
            list.push({
                index: 2,
                name: "Print Placement 2",
                position: "Upper Back Center",
                type: printTypeDisplay === "DTG" ? "DTG Back" : "Screen Print",
                specs: backPrintSpecDisplay,
                designFile: null,
                mockup: details?.backViewUrl || backSvg
            });
        }
        return list;
    }, [details, printPositionDisplay, printTypeDisplay, frontPrintSpecDisplay, designFileSource, backPrintSpecDisplay, frontSvg, backSvg]);
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
                                    {details?.colorCode && (<span style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: details.colorCode,
                    border: "1px solid rgba(255,255,255,0.4)"
                }}/>)}
                                    Color: <strong>{itemObj.color}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

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
                                    <img src={details?.frontViewUrl || frontSvg} alt={`${itemObj.name} Front View`} className="mockup-preview-image" onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = frontSvg;
            }}/>
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
                                    <img src={details?.backViewUrl || backSvg} alt={`${itemObj.name} Back View`} className="mockup-preview-image" onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = backSvg;
            }}/>
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
                const mockupImg = placement.mockup || (placement.position.toLowerCase().includes("back") ? (details?.backViewUrl || backSvg) : (details?.frontViewUrl || frontSvg));
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
                                            {isArtworkFile && (<button type="button" className="btn-download-design" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Artwork`, placement.designFile, itemObj.color)} title="Download High-Res Print Artwork File">
                                                    <Download size={13}/>
                                                    <span>Print Artwork File [Download]</span>
                                                </button>)}
                                            <button type="button" className="btn-download-mockup" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Mockup`, mockupImg, itemObj.color)} title="Download Placement Mockup Preview">
                                                <Download size={13}/>
                                                <span>Mockup Preview [Download]</span>
                                            </button>
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
                                                    <button type="button" className="btn-card-download" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Artwork`, placement.designFile, itemObj.color)} title="Download High-Res Print Artwork File">
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
                                                        {(itemObj.color || "Garment").toUpperCase()} ARTWORK
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
                                                <button type="button" className="btn-card-download mockup-type" onClick={() => handleDownloadDesignFile(`Item${formattedIndex}_${placement.name}_Mockup`, mockupImg, itemObj.color)} title="Download Placement Mockup Preview">
                                                    <Download size={12}/>
                                                    <span>Download Mockup</span>
                                                </button>
                                            </div>
                                            <div className="mockup-dark-box" style={{ height: "220px" }}>
                                                <span className="mockup-watermark-tag">
                                                    MOCKUP PREVIEW
                                                </span>
                                                <img src={mockupImg} alt={`${placement.name} Mockup Preview`} className="mockup-preview-image" style={{ objectFit: "contain" }} onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = placement.position.toLowerCase().includes("back") ? backSvg : frontSvg;
                    }}/>
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
                                High-resolution brand assets for inner collar tag printing. &bull;{" "}
                                <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                                    Recommended for {itemObj.color} garment: {recommendedNeckLogo.toUpperCase()} LOGO ({recommendedNeckLogoFileName})
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
            const fallbackSvg = generateSvgDataUri("front", order.itemName, order.color, order.size, order.productDetails?.colorCode);
            const link = document.createElement("a");
            link.href = fallbackSvg;
            link.download = `${order.id}_${assetName.replace(/\s+/g, "_")}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
