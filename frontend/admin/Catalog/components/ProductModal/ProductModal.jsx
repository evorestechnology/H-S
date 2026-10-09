import { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, Lock, CheckCircle, AlertCircle, ChevronUp, ChevronDown, Info, Eye, Loader2 } from "lucide-react";
import "./ProductModal.css";
import { ProductGender, PrintType } from "../../types";
import ImageDropZone from "./ImageDropZone";
import { useCategories } from "../../../../shared/services/categoryService";

const PRESET_COLORS = [
    { code: "#000000", name: "Jet Black" },
    { code: "#FFFFFF", name: "Optic White" },
    { code: "#6B7280", name: "Heather Grey" },
    { code: "#1E3A8A", name: "Navy Blue" },
    { code: "#DC2626", name: "Crimson Red" },
    { code: "#3F6212", name: "Olive Green" },
    { code: "#F59E0B", name: "Mustard Yellow" },
    { code: "#EC4899", name: "Rose Pink" },
    { code: "#8B5CF6", name: "Deep Purple" },
    { code: "#78350F", name: "Chestnut Brown" }
];

const ProductModal = ({ open, product, onClose, onSubmit, onDelete }) => {
    const availableCategories = useCategories();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // ─── Basic Info ──────────────────────────────────────────────────────────
    const [name, setName] = useState("");
    const [manufactureName, setManufactureName] = useState("");
    const [gender, setGender] = useState(ProductGender.UNISEX);
    const [category, setCategory] = useState("T-Shirts");
    const [baseUserPrice, setBaseUserPrice] = useState("");
    const [coverPhoto, setCoverPhoto] = useState("");
    const [inStock, setInStock] = useState(true);
    // ─── Colors ───────────────────────────────────────────────────────────────
    const [colors, setColors] = useState([]);
    const [expandedColorIndexes, setExpandedColorIndexes] = useState({ 0: true });
    const [expandedMfrIndexes, setExpandedMfrIndexes] = useState({});
    // ─── Sizes ────────────────────────────────────────────────────────────────
    const [formSizes, setFormSizes] = useState([]);
    const [newSizeInput, setNewSizeInput] = useState("");
    // ─── Additional Details ───────────────────────────────────────────────────
    const [sizeChart, setSizeChart] = useState("");
    const [description, setDescription] = useState("");
    const [designerNote, setDesignerNote] = useState("");
    const [washCare, setWashCare] = useState("");
    const [shippingNote, setShippingNote] = useState("");
    // ─── For Manufacture ──────────────────────────────────────────────────────
    const [showManufacture, setShowManufacture] = useState(false);
    // ─── Error ────────────────────────────────────────────────────────────────
    const [error, setError] = useState("");
    // ─── Init / Reset ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            setExpandedColorIndexes({ 0: true });
            setExpandedMfrIndexes({});
            if (product) {
                setName(product.name);
                setManufactureName(product.manufactureName || "");
                setGender(product.gender);
                setCategory(product.category);
                setCoverPhoto(product.coverPhoto);
                setInStock(product.inStock !== false);
                const initialPrice = product.userPrice ?? product.price ?? (product.colors && product.colors.length > 0
                    ? (product.colors[0].userPrice ?? product.colors[0].sellingPrice ?? "")
                    : "");
                setBaseUserPrice(typeof initialPrice === "number" && initialPrice > 0 ? initialPrice : "");
                // Colors
                if (product.colors && product.colors.length > 0) {
                    let hasAnyMfr = false;
                    setColors(product.colors.map(c => {
                        const pType = c.printType || c.manufactureSpec?.printType || product.manufactureSpec?.printType || "";
                        const pPos = c.printPosition || c.manufactureSpec?.printPosition || product.manufactureSpec?.printPosition || "";
                        const dFile = c.designFile || c.manufactureSpec?.designFile || product.manufactureSpec?.designFile || "";
                        const mup = c.mockup || c.manufactureSpec?.mockup || product.manufactureSpec?.mockup || "";
                        const mPrice = c.manufacturePrice ?? "";
                        if (pType || pPos || dFile || mup || mPrice !== "") {
                            hasAnyMfr = true;
                        }
                        const specs = (c.printSpecs && c.printSpecs.length > 0)
                            ? c.printSpecs.map(ps => ({
                                printType: ps.printType || "",
                                printPosition: String(ps.printPosition || ""),
                                designFile: ps.designFile || "",
                                mockup: ps.mockup || ""
                            }))
                            : [{
                                    printType: pType,
                                    printPosition: pPos,
                                    designFile: dFile,
                                    mockup: mup
                                }];
                        const colorBaseCost = c.baseCost ?? c.priceBreakdown?.baseCost ?? "";
                        const colorPrintCost = c.printingCost ?? c.priceBreakdown?.printingCost ?? "";
                        const colorShipCost = c.shippingCost ?? c.priceBreakdown?.shippingCost ?? "";
                        const colorAddCost = c.additionalCost ?? c.priceBreakdown?.additionalCost ?? "";
                        const colorUserPrice = c.userPrice ?? c.sellingPrice ?? product.userPrice ?? product.price ?? "";
                        return {
                            code: c.code || "#000000",
                            name: c.name || "",
                            isAvailable: c.isAvailable !== false,
                            isExisting: true,
                            frontView: c.frontView || c.modelPhotos?.[0] || "",
                            backView: c.backView || c.modelPhotos?.[1] || "",
                            modelPhoto1: c.modelPhoto1 || c.modelPhotos?.[2] || "",
                            modelPhoto2: c.modelPhoto2 || c.modelPhotos?.[3] || "",
                            manufacturePrice: mPrice,
                            userPrice: colorUserPrice,
                            printType: specs[0]?.printType || pType,
                            printPosition: specs[0]?.printPosition || pPos,
                            designFile: specs[0]?.designFile || dFile,
                            mockup: specs[0]?.mockup || mup,
                            printSpecs: specs,
                            baseCost: colorBaseCost,
                            printingCost: colorPrintCost,
                            shippingCost: colorShipCost,
                            additionalCost: colorAddCost,
                            sellingPrice: colorUserPrice
                        };
                    }));
                    setShowManufacture(hasAnyMfr || !!product.manufactureSpec);
                }
                else {
                    setColors([defaultColor()]);
                    setShowManufacture(!!product.manufactureSpec);
                }
                // Sizes
                if (product.sizes && product.sizes.length > 0) {
                    setFormSizes(product.sizes.map(s => {
                        if (typeof s === "string") {
                            return { size: s, isAvailable: true, isExisting: true };
                        }
                        else {
                            return { size: s.size, isAvailable: s.isAvailable !== false, isExisting: true };
                        }
                    }));
                }
                else {
                    setFormSizes(defaultSizes());
                }
                setSizeChart(product.sizeChart || "");
                setDescription(product.description || "");
                setDesignerNote(product.designerNote || "");
                setWashCare(product.washCare || "");
                setShippingNote(product.shippingNote || "");
            }
            else {
                // Reset all
                setName("");
                setManufactureName("");
                setGender(ProductGender.UNISEX);
                setCategory(availableCategories[0] || "T-Shirts");
                setCoverPhoto("");
                setInStock(true);
                setBaseUserPrice("");
                setColors([defaultColor()]);
                setFormSizes(defaultSizes());
                setNewSizeInput("");
                setSizeChart("");
                setDescription("");
                setDesignerNote("");
                setWashCare("");
                setShippingNote("");
                setShowManufacture(false);
            }
            setError("");
        }
    }, [open, product]);
    if (!open)
        return null;
    // ─── Helpers ──────────────────────────────────────────────────────────────
    function defaultColor(defPrice = baseUserPrice) {
        return {
            code: "#000000",
            name: "",
            isAvailable: true,
            isExisting: false,
            frontView: "",
            backView: "",
            modelPhoto1: "",
            modelPhoto2: "",
            manufacturePrice: "",
            userPrice: defPrice,
            printType: "",
            printPosition: "",
            designFile: "",
            mockup: "",
            printSpecs: [{ printType: "", printPosition: "", designFile: "", mockup: "" }],
            baseCost: "",
            printingCost: "",
            shippingCost: "",
            additionalCost: "",
            sellingPrice: defPrice
        };
    }
    function defaultSizes() {
        return [
            { size: "XS", isAvailable: true },
            { size: "S", isAvailable: true },
            { size: "M", isAvailable: true },
            { size: "L", isAvailable: true },
            { size: "XL", isAvailable: true }
        ];
    }
    // ─── Color Handlers ───────────────────────────────────────────────────────
    const handleAddColor = () => {
        const newIdx = colors.length;
        setColors([...colors, defaultColor(baseUserPrice)]);
        setExpandedColorIndexes(prev => ({ ...prev, [newIdx]: true }));
    };
    const handleToggleColorExpand = (index) => {
        setExpandedColorIndexes(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
    const handleToggleMfrExpand = (index) => {
        setExpandedMfrIndexes(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
    const handleRemoveColor = (index) => {
        if (colors[index].isExisting)
            return;
        const newColors = [...colors];
        newColors.splice(index, 1);
        setColors(newColors);
    };
    const handleToggleColorAvailability = (index) => {
        const newColors = [...colors];
        newColors[index].isAvailable = !newColors[index].isAvailable;
        setColors(newColors);
    };
    const HEX_TO_NAME_MAP = {
        "#000000": "Jet Black",
        "#FFFFFF": "Optic White",
        "#6B7280": "Heather Grey",
        "#808080": "Grey",
        "#1E3A8A": "Navy Blue",
        "#0000FF": "Blue",
        "#DC2626": "Crimson Red",
        "#FF0000": "Red",
        "#3F6212": "Olive Green",
        "#008000": "Green",
        "#F59E0B": "Mustard Yellow",
        "#FFFF00": "Yellow",
        "#EC4899": "Rose Pink",
        "#FFC0CB": "Pink",
        "#8B5CF6": "Deep Purple",
        "#800080": "Purple",
        "#78350F": "Chestnut Brown",
        "#A52A2A": "Brown",
        "#FFA500": "Orange",
        "#374151": "Charcoal"
    };
    const handleColorChange = (index, field, value) => {
        const newColors = [...colors];
        let updatedColor = { ...newColors[index], [field]: value };
        if (field === "code") {
            const hex = String(value).trim().toUpperCase();
            const preset = PRESET_COLORS.find(p => p.code.toUpperCase() === hex);
            const nameMatch = preset?.name || HEX_TO_NAME_MAP[hex];
            updatedColor = {
                ...updatedColor,
                code: value,
                ...(nameMatch ? { name: nameMatch } : {})
            };
        }
        else if (field === "manufacturePrice") {
            const newMfg = value !== "" ? Number(value) : "";
            updatedColor.manufacturePrice = newMfg;
            if (typeof newMfg === "number" && newMfg > 0) {
                const cPrint = Number(updatedColor.printingCost) || 0;
                const cShip = Number(updatedColor.shippingCost) || 0;
                const cAdd = Number(updatedColor.additionalCost) || 0;
                const otherTotal = cPrint + cShip + cAdd;
                if (updatedColor.baseCost === "" || (Number(updatedColor.baseCost) + otherTotal !== newMfg)) {
                    updatedColor.baseCost = Math.max(0, newMfg - otherTotal);
                }
            }
        }
        else if (["baseCost", "printingCost", "shippingCost", "additionalCost"].includes(field)) {
            const cBase = Number(field === "baseCost" ? value : updatedColor.baseCost) || 0;
            const cPrint = Number(field === "printingCost" ? value : updatedColor.printingCost) || 0;
            const cShip = Number(field === "shippingCost" ? value : updatedColor.shippingCost) || 0;
            const cAdd = Number(field === "additionalCost" ? value : updatedColor.additionalCost) || 0;
            const computedTotalMfrCost = cBase + cPrint + cShip + cAdd;
            if (computedTotalMfrCost > 0) {
                updatedColor.manufacturePrice = computedTotalMfrCost;
            }
        }
        newColors[index] = updatedColor;
        setColors(newColors);
    };
    const handleAddPrintSpec = (colorIdx) => {
        const newColors = [...colors];
        const currentSpecs = newColors[colorIdx].printSpecs || [];
        newColors[colorIdx].printSpecs = [
            ...currentSpecs,
            { printType: "", printPosition: "", designFile: "", mockup: "" }
        ];
        setColors(newColors);
    };
    const handleRemovePrintSpec = (colorIdx, specIdx) => {
        const newColors = [...colors];
        const currentSpecs = [...(newColors[colorIdx].printSpecs || [])];
        if (currentSpecs.length <= 1)
            return;
        currentSpecs.splice(specIdx, 1);
        newColors[colorIdx].printSpecs = currentSpecs;
        newColors[colorIdx].printType = currentSpecs[0]?.printType || "";
        newColors[colorIdx].printPosition = currentSpecs[0]?.printPosition || "";
        newColors[colorIdx].designFile = currentSpecs[0]?.designFile || "";
        newColors[colorIdx].mockup = currentSpecs[0]?.mockup || "";
        setColors(newColors);
    };
    const handlePrintSpecChange = (colorIdx, specIdx, field, value) => {
        const newColors = [...colors];
        const currentSpecs = [...(newColors[colorIdx].printSpecs || [])];
        currentSpecs[specIdx] = {
            ...currentSpecs[specIdx],
            [field]: value
        };
        newColors[colorIdx].printSpecs = currentSpecs;
        if (specIdx === 0) {
            if (field === "printType")
                newColors[colorIdx].printType = value;
            if (field === "printPosition")
                newColors[colorIdx].printPosition = value;
            if (field === "designFile")
                newColors[colorIdx].designFile = value;
            if (field === "mockup")
                newColors[colorIdx].mockup = value;
        }
        setColors(newColors);
    };
    // ─── Size Handlers ────────────────────────────────────────────────────────
    const handleAddSize = () => {
        const trimmed = newSizeInput.trim().toUpperCase();
        if (!trimmed)
            return;
        if (formSizes.some(s => s.size.toUpperCase() === trimmed)) {
            setError(`Size "${trimmed}" is already present.`);
            return;
        }
        setFormSizes([...formSizes, { size: trimmed, isAvailable: true, isExisting: false }]);
        setNewSizeInput("");
        setError("");
    };
    const handleToggleSizeAvailability = (index) => {
        const updated = [...formSizes];
        updated[index].isAvailable = !updated[index].isAvailable;
        setFormSizes(updated);
    };
    const handleRemoveSize = (index) => {
        if (formSizes[index].isExisting)
            return;
        const updated = [...formSizes];
        updated.splice(index, 1);
        setFormSizes(updated);
    };
    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return setError("Product Name (for Customer) is required.");
        if (formSizes.length === 0)
            return setError("At least one size is required.");
        if (colors.length === 0)
            return setError("At least one color is required.");
        for (let i = 0; i < colors.length; i++) {
            if (!colors[i].code.trim() || !colors[i].name.trim()) {
                return setError("All colors must have a valid hex code and name.");
            }
        }
        const finalCoverPhoto = coverPhoto.trim() || colors[0]?.frontView || colors[0]?.modelPhoto1 || "";
        if (!finalCoverPhoto) {
            return setError("Please upload a Cover Photo or Front View image for the product.");
        }
        const submittedColors = colors.map(c => {
            const photos = [c.frontView, c.backView, c.modelPhoto1, c.modelPhoto2].filter(Boolean);
            const colorSpec = showManufacture ? {
                printType: c.printType || undefined,
                printPosition: c.printPosition || undefined,
                designFile: c.designFile || undefined,
                mockup: c.mockup || undefined
            } : undefined;
            const cBase = Number(c.baseCost) || 0;
            const cPrint = Number(c.printingCost) || 0;
            const cShip = Number(c.shippingCost) || 0;
            const cAdd = Number(c.additionalCost) || 0;
            const otherTotal = cPrint + cShip + cAdd;
            const computedColorTotal = cBase + otherTotal;
            const finalMfrPrice = c.manufacturePrice !== ""
                ? Number(c.manufacturePrice)
                : (computedColorTotal > 0 ? computedColorTotal : undefined);
            let resolvedBaseCost = undefined;
            if (c.baseCost !== "") {
                resolvedBaseCost = Number(c.baseCost);
                if (finalMfrPrice !== undefined && (resolvedBaseCost + otherTotal !== finalMfrPrice)) {
                    resolvedBaseCost = Math.max(0, finalMfrPrice - otherTotal);
                }
            }
            else if (finalMfrPrice !== undefined) {
                resolvedBaseCost = Math.max(0, finalMfrPrice - otherTotal);
            }
            const finalUserPrice = c.userPrice !== "" ? Number(c.userPrice) : (c.sellingPrice !== "" ? Number(c.sellingPrice) : (finalMfrPrice || computedColorTotal));
            const colorPriceBreakdown = (resolvedBaseCost !== undefined || cPrint > 0 || cShip > 0 || cAdd > 0) ? {
                baseCost: resolvedBaseCost ?? 0,
                printingCost: cPrint,
                shippingCost: cShip,
                additionalCost: cAdd,
                total: finalMfrPrice ?? ((resolvedBaseCost ?? 0) + otherTotal)
            } : undefined;
            return {
                code: c.code,
                name: c.name,
                isAvailable: c.isAvailable,
                frontView: c.frontView,
                backView: c.backView,
                modelPhoto1: c.modelPhoto1,
                modelPhoto2: c.modelPhoto2,
                modelPhotos: photos,
                manufacturePrice: finalMfrPrice,
                userPrice: finalUserPrice,
                printType: c.printType || undefined,
                printPosition: c.printPosition || undefined,
                designFile: c.designFile || undefined,
                mockup: c.mockup || undefined,
                manufactureSpec: colorSpec,
                printSpecs: c.printSpecs?.map(ps => ({
                    printType: ps.printType || undefined,
                    printPosition: ps.printPosition || undefined,
                    designFile: ps.designFile || undefined,
                    mockup: ps.mockup || undefined
                })),
                baseCost: resolvedBaseCost,
                printingCost: c.printingCost !== "" ? Number(c.printingCost) : undefined,
                shippingCost: c.shippingCost !== "" ? Number(c.shippingCost) : undefined,
                additionalCost: c.additionalCost !== "" ? Number(c.additionalCost) : undefined,
                priceBreakdown: colorPriceBreakdown,
                sellingPrice: finalUserPrice
            };
        });
        const colorUserPrices = submittedColors.map(c => c.userPrice ?? c.sellingPrice).filter((p) => typeof p === "number" && p > 0);
        const minProductPrice = colorUserPrices.length > 0 ? Math.min(...colorUserPrices) : (baseUserPrice !== "" ? Number(baseUserPrice) : 0);
        const colorMfrPrices = submittedColors.map(c => c.manufacturePrice).filter((p) => typeof p === "number" && p > 0);
        const minMfrPrice = colorMfrPrices.length > 0 ? Math.min(...colorMfrPrices) : undefined;
        const submittedSizes = formSizes.map(s => ({
            size: s.size,
            isAvailable: s.isAvailable
        }));
        const allImages = Array.from(new Set(colors.flatMap(c => [c.frontView, c.backView, c.modelPhoto1, c.modelPhoto2]).filter(Boolean)));
        const priceBreakdown = (submittedColors[0]?.baseCost || submittedColors[0]?.printingCost) ? {
            baseCost: submittedColors[0]?.baseCost || 0,
            printingCost: submittedColors[0]?.printingCost || 0,
            shippingCost: submittedColors[0]?.shippingCost || 0,
            additionalCost: submittedColors[0]?.additionalCost
        } : undefined;
        const manufactureSpec = showManufacture && colors[0] ? {
            printType: colors[0].printType || undefined,
            printPosition: colors[0].printPosition || undefined,
            designFile: colors[0].designFile || undefined,
            mockup: colors[0].mockup || undefined
        } : undefined;
        setError("");
        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                manufactureName: manufactureName.trim() || undefined,
                gender,
                category,
                price: minProductPrice,
                userPrice: minProductPrice,
                manufacturePrice: minMfrPrice,
                coverPhoto: finalCoverPhoto,
                images: allImages.length > 0 ? allImages : [finalCoverPhoto],
                colors: submittedColors,
                sizes: submittedSizes,
                sizeChart,
                description,
                designerNote,
                washCare,
                shippingNote,
                inStock,
                priceBreakdown,
                manufactureSpec
            });
        } catch (err) {
            setError(err?.message || "Failed to save product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async () => {
        if (!onDelete || isDeleting || isSubmitting) return;
        setIsDeleting(true);
        try {
            await onDelete();
        } catch (err) {
            setError(err?.message || "Failed to delete product.");
        } finally {
            setIsDeleting(false);
        }
    };
    const isEditing = !!product;
    return (<div className="modal-overlay">
            <div className="modal-content product-modal large-modal">
                <div className="modal-header sticky-header">
                    <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="product-form-container">
                    <div className="modal-body">
                        {error && <div className="modal-error">{error}</div>}

                        {/* ── 1. Basic Information ─────────────────────────── */}
                        <div className="form-section">
                            <h3 className="section-title">1. Basic Information</h3>
                            <div className="product-form-grid">
                                {/* Customer-facing name */}
                                <div className="form-group product-form-full">
                                    <label>
                                        Product Name <span className="name-audience-tag name-tag-customer">for Customer</span>
                                    </label>
                                    <input type="text" className="input" placeholder="e.g. Oversized Heavyweight T-Shirt" value={name} onChange={(e) => setName(e.target.value)}/>
                                    <p className="field-hint mt-4">This name is displayed to buyers on the storefront.</p>
                                </div>

                                {/* Manufacture-facing name */}
                                <div className="form-group product-form-full">
                                    <label>
                                        Product Name <span className="name-audience-tag name-tag-manufacture">for Manufacture</span>
                                    </label>
                                    <input type="text" className="input" placeholder="e.g. 180 gsm regular fit tshirt" value={manufactureName} onChange={(e) => setManufactureName(e.target.value)}/>
                                    <p className="field-hint mt-4">Internal spec name used by the manufacturer. Not shown to customers.</p>
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        {Object.values(ProductGender).map((g) => (<option key={g} value={g}>{g}</option>))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {availableCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                                    </select>
                                </div>

                                {/* Storefront User Price */}
                                <div className="form-group product-form-full">
                                    <label className="font-semibold text-xs text-primary flex-items-center gap-6">
                                        Storefront User Price <span className="name-audience-tag name-tag-customer">for Customer</span>
                                    </label>
                                    <div className="mfr-input-wrapper color-selling-input-wrapper" style={{ maxWidth: "280px" }}>
                                        <span className="mfr-currency-prefix">₹</span>
                                        <input type="number" className="input mfr-price-input color-selling-price-input" placeholder="0.00" min="0" step="0.01" value={baseUserPrice} onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : "";
            setBaseUserPrice(val);
            if (typeof val === "number" && val >= 0) {
                setColors(prev => prev.map(c => ({
                    ...c,
                    userPrice: (c.userPrice === "" || c.userPrice === baseUserPrice) ? val : c.userPrice,
                    sellingPrice: (c.sellingPrice === "" || c.sellingPrice === baseUserPrice) ? val : c.sellingPrice
                })));
            }
        }}/>
                                    </div>
                                    <p className="field-hint text-xs mt-4">Selling price displayed to buyers on the storefront. Applies to all color variants.</p>
                                </div>

                                {/* Product In Stock Toggle */}
                                <div className="form-group product-form-full">
                                    <div className="stock-toggle-box">
                                        <div className="flex-center-between mb-8">
                                            <div>
                                                <span className="font-semibold text-sm block-title">Product Stock Status</span>
                                                <span className="text-xs text-muted">Control whether new customers can view & purchase this product</span>
                                            </div>
                                            <button type="button" className={`stock-status-badge-btn ${inStock ? "status-in-stock" : "status-out-of-stock"}`} onClick={() => setInStock(!inStock)}>
                                                {inStock ? (<>
                                                        <CheckCircle size={15}/>
                                                        In Stock
                                                    </>) : (<>
                                                        <AlertCircle size={15}/>
                                                        Product Out of Stock
                                                    </>)}
                                            </button>
                                        </div>
                                        <p className="field-hint">
                                            {inStock ? ("Product is active and visible for new store purchases.") : ("Out of Stock: Existing customers with active orders can track their purchases without disruption, but new customers cannot buy this product.")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="section-divider"/>

                        {/* ── 2. Cover Photo ───────────────────────────────── */}
                        <div className="form-section">
                            <h3 className="section-title">2. Cover Photo (Main Thumbnail)</h3>
                            <ImageDropZone label="Product Cover Photo" value={coverPhoto} onChange={setCoverPhoto} placeholder="Drag & drop main cover photo here (or defaults to 1st color Front View)"/>
                        </div>

                        <hr className="section-divider"/>

                        {/* ── 3. Color Variants, Manufacture Specs & Pricing ─────────────────── */}
                        <div className="form-section">
                            <div className="section-header-row">
                                <div>
                                    <h3 className="section-title">3. Color Variants, Manufacture Specs &amp; Pricing</h3>
                                    <p className="field-hint">Add color variants, upload views &amp; model photos, specify manufacturing details, and set price breakdown.</p>
                                </div>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddColor}>
                                    <Plus size={16}/> Add Color
                                </button>
                            </div>

                            <div className="colors-list mt-16">
                                {colors.map((color, idx) => {
            const isExpanded = expandedColorIndexes[idx] ?? (idx === 0);
            const isMfrExpanded = !!expandedMfrIndexes[idx];
            return (<div key={idx} className={`color-entry-card ${!color.isAvailable ? "card-unavailable" : ""} ${!isExpanded ? "card-collapsed" : ""}`}>
                                            <div className="color-entry-header" onClick={() => handleToggleColorExpand(idx)} style={{ cursor: 'pointer' }}>
                                                <div className="color-entry-title">
                                                    <div className="mfr-color-swatch" style={{ backgroundColor: color.code }}/>
                                                    <h4>Color {idx + 1}: {color.name || "Unnamed"}</h4>
                                                    <button type="button" className={`color-availability-toggle ${color.isAvailable ? "avail-active" : "avail-inactive"}`} onClick={(e) => {
                    e.stopPropagation();
                    handleToggleColorAvailability(idx);
                }}>
                                                        {color.isAvailable ? "Available" : "Not Available"}
                                                    </button>
                                                </div>

                                                <div className="color-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {(() => {
                    const uPrice = color.userPrice !== "" ? Number(color.userPrice) : (color.sellingPrice !== "" ? Number(color.sellingPrice) : 0);
                    const mPrice = color.manufacturePrice !== "" ? Number(color.manufacturePrice) : 0;
                    return (<>
                                                                {mPrice > 0 && (<span className="color-price-header-tag mfr-tag" title="Manufacture Price for this color">
                                                                        Mfr: ₹{mPrice.toLocaleString("en-IN")}
                                                                    </span>)}
                                                                {uPrice > 0 && (<span className="color-price-header-tag user-tag" title="User Price for this color">
                                                                        User: ₹{uPrice.toLocaleString("en-IN")}
                                                                    </span>)}
                                                            </>);
                })()}
                                                    {color.isExisting ? (<span className="color-locked-tag" title="Existing color cannot be deleted. Toggle status to Not Available instead.">
                                                            <Lock size={13}/> Saved Color
                                                        </span>) : (<button type="button" className="btn-icon text-danger" onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(idx);
                    }} title="Remove unsaved draft color">
                                                            <Minus size={16}/>
                                                        </button>)}
                                                    <button type="button" className="btn-icon" title={isExpanded ? "Collapse Color" : "Expand Color"}>
                                                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (<div className="color-card-body mt-16">
                                                    {/* Color Selection & Name */}
                                                    <div className="product-form-grid mb-16">
                                                        <div className="form-group">
                                                            <label>Color Code (Hex)</label>
                                                            <div className="color-hex-input-group">
                                                                <div className="color-swatch-picker-btn" style={{ backgroundColor: color.code }} title="Click to pick color">
                                                                    <input type="color" className="color-picker-hidden" value={color.code.startsWith("#") && color.code.length === 7 ? color.code : "#000000"} onChange={(e) => handleColorChange(idx, "code", e.target.value)}/>
                                                                </div>
                                                                <input type="text" className="input color-hex-text-input flex-1" placeholder="#000000" value={color.code} onChange={(e) => handleColorChange(idx, "code", e.target.value)}/>
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Color Name</label>
                                                            <input type="text" className="input" placeholder="e.g. Jet Black" value={color.name} onChange={(e) => handleColorChange(idx, "name", e.target.value)}/>
                                                        </div>

                                                        {/* Quick Presets */}
                                                        <div className="form-group product-form-full">
                                                            <div className="preset-colors-row">
                                                                <span className="preset-label">Quick Presets:</span>
                                                                {PRESET_COLORS.map(p => (<button key={p.code} type="button" className="preset-swatch" style={{ backgroundColor: p.code }} title={`${p.name} (${p.code})`} onClick={() => {
                            handleColorChange(idx, "code", p.code);
                            if (!color.name || color.name === "Black" || color.name === "White") {
                                handleColorChange(idx, "name", p.name);
                            }
                        }}/>))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Product Views */}
                                                    <div className="views-section-label">
                                                        <span className="views-label-text">Product Views</span>
                                                        <span className="views-audience-badge badge-both">
                                                            Visible to Users &amp; Manufacture
                                                        </span>
                                                    </div>
                                                    <div className="color-views-grid color-views-grid-2">
                                                        <ImageDropZone label="Front View" value={color.frontView} onChange={(val) => handleColorChange(idx, "frontView", val)} placeholder="Drag & drop front view"/>
                                                        <ImageDropZone label="Back View" value={color.backView} onChange={(val) => handleColorChange(idx, "backView", val)} placeholder="Drag & drop back view"/>
                                                    </div>

                                                    {/* Model Photos */}
                                                    <div className="views-section-label mt-16">
                                                        <span className="views-label-text">Model Photos</span>
                                                        <span className="views-audience-badge badge-user-only">
                                                            <Info size={11}/>
                                                            User Add-on Only
                                                        </span>
                                                    </div>
                                                    <div className="color-views-grid color-views-grid-2 mb-16">
                                                        <ImageDropZone label="Model Photo 1" value={color.modelPhoto1} onChange={(val) => handleColorChange(idx, "modelPhoto1", val)} placeholder="Drag & drop model photo 1"/>
                                                        <ImageDropZone label="Model Photo 2" value={color.modelPhoto2} onChange={(val) => handleColorChange(idx, "modelPhoto2", val)} optional placeholder="Drag & drop model photo 2"/>
                                                    </div>

                                                    {/* ── Manufacture Specifications & Pricing Dropdown ───────────────── */}
                                                    <div className="color-mfr-dropdown-container mt-20">
                                                        <button type="button" className={`color-mfr-dropdown-btn ${isMfrExpanded ? "mfr-expanded" : ""}`} onClick={() => handleToggleMfrExpand(idx)}>
                                                            <div className="mfr-btn-title">
                                                                <span className="mfr-icon">🏭</span>
                                                                <span className="mfr-btn-label">Manufacture Specs</span>
                                                                <span className="manufacture-badge">Internal Only</span>
                                                            </div>
                                                            <div className="mfr-btn-right">
                                                                {(color.manufacturePrice !== "" || color.printSpecs?.some(s => s.printType || s.printPosition || s.designFile || s.mockup)) && (<span className="mfr-configured-tag">Configured</span>)}
                                                                {isMfrExpanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                                                            </div>
                                                        </button>

                                                        {isMfrExpanded && (<div className="color-mfr-dropdown-body mt-12">
                                                                {/* Multiple Print Positions / Specs List */}
                                                                <div className="print-specs-list">
                                                                    {(color.printSpecs || [{ printType: color.printType, printPosition: color.printPosition, designFile: color.designFile, mockup: color.mockup }]).map((spec, specIdx) => (<div key={specIdx} className="print-spec-item-card mb-16">
                                                                            <div className="print-spec-header mb-12">
                                                                                <span className="print-spec-number">Print Position #{specIdx + 1}</span>
                                                                                {specIdx > 0 && (<button type="button" className="btn-icon text-danger" onClick={() => handleRemovePrintSpec(idx, specIdx)} title="Remove this print position">
                                                                                        <Minus size={15}/>
                                                                                    </button>)}
                                                                            </div>

                                                                            <div className="product-form-grid mb-12">
                                                                                <div className="form-group">
                                                                                    <label>Print Type</label>
                                                                                    <select className="input" value={spec.printType || ""} onChange={(e) => handlePrintSpecChange(idx, specIdx, "printType", e.target.value)}>
                                                                                        <option value="">— Select Print Type —</option>
                                                                                        {Object.values(PrintType).map(pt => (<option key={pt} value={pt}>{pt}</option>))}
                                                                                    </select>
                                                                                </div>
                                                                                <div className="form-group">
                                                                                    <label>Print Position</label>
                                                                                    <input type="text" className="input" placeholder="e.g. Front Center, Left Sleeve, Back Neck" value={spec.printPosition || ""} onChange={(e) => handlePrintSpecChange(idx, specIdx, "printPosition", e.target.value)}/>
                                                                                </div>
                                                                            </div>

                                                                            <div className="color-views-grid color-views-grid-2">
                                                                                <ImageDropZone label="Design File" value={spec.designFile || ""} onChange={(val) => handlePrintSpecChange(idx, specIdx, "designFile", val)} optional placeholder="Drag & drop design file"/>
                                                                                <ImageDropZone label="Mockup Image" value={spec.mockup || ""} onChange={(val) => handlePrintSpecChange(idx, specIdx, "mockup", val)} optional placeholder="Drag & drop mockup image"/>
                                                                            </div>
                                                                        </div>))}
                                                                    <button type="button" className="btn btn-secondary btn-sm mt-8 mb-16" onClick={() => handleAddPrintSpec(idx)}>
                                                                        <Plus size={14}/> Add Another Print Position
                                                                    </button>
                                                                </div>

                                                                {/* ── Per-Color Price Breakdown: Manufacture Price & User Price ── */}
                                                                <div className="color-pb-section mt-16 pt-16" style={{ borderTop: "1px dashed #FED7AA" }}>
                                                                    <div className="color-pb-header mb-12">
                                                                        <span className="color-pb-title">💰 Pricing Details for {color.name || `Color ${idx + 1}`}</span>
                                                                    </div>

                                                                    {/* Main Price Inputs: Manufacture Price & User Price */}
                                                                    <div className="product-form-grid mb-16">
                                                                        {/* Manufacture Price */}
                                                                        <div className="form-group mfr-price-group">
                                                                            <label className="font-semibold text-xs text-primary flex-items-center gap-6">
                                                                                Manufacture Price <span className="name-audience-tag name-tag-manufacture">for Manufacture</span>
                                                                            </label>
                                                                            <div className="mfr-input-wrapper">
                                                                                <span className="mfr-currency-prefix">₹</span>
                                                                                <input type="number" className="input mfr-price-input" placeholder="0.00" min="0" step="0.01" value={color.manufacturePrice} onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            handleColorChange(idx, "manufacturePrice", val);
                        }}/>
                                                                            </div>
                                                                            <p className="field-hint text-xs mt-4">Price paid to the manufacturer.</p>
                                                                        </div>

                                                                        {/* User Price */}
                                                                        <div className="form-group mfr-price-group color-selling-price-box">
                                                                            <label className="font-semibold text-xs text-primary flex-items-center gap-6">
                                                                                User Price <span className="name-audience-tag name-tag-customer">for User</span>
                                                                            </label>
                                                                            <div className="mfr-input-wrapper color-selling-input-wrapper">
                                                                                <span className="mfr-currency-prefix">₹</span>
                                                                                <input type="number" className="input mfr-price-input color-selling-price-input" placeholder={(() => {
                            const cBase = Number(color.baseCost) || 0;
                            const cPrint = Number(color.printingCost) || 0;
                            const cShip = Number(color.shippingCost) || 0;
                            const cAdd = Number(color.additionalCost) || 0;
                            const tot = cBase + cPrint + cShip + cAdd;
                            return tot > 0 ? String(tot) : "0.00";
                        })()} min="0" step="0.01" value={color.userPrice !== "" ? color.userPrice : color.sellingPrice} onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            handleColorChange(idx, "userPrice", val);
                            handleColorChange(idx, "sellingPrice", val);
                        }}/>
                                                                            </div>
                                                                            <p className="field-hint text-xs mt-4">Selling price shown to end customers on storefront.</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Optional Detailed Cost Breakdown */}
                                                                    <details className="price-breakdown-details mb-12">
                                                                        <summary className="text-xs text-muted font-medium cursor-pointer" style={{ userSelect: "none", marginBottom: "8px" }}>
                                                                            Optional Cost Breakdown (Base, Printing, Shipping, Additional)
                                                                        </summary>
                                                                        <div className="product-form-grid mt-12 mb-12">
                                                                            <div className="form-group">
                                                                                <label>Base Cost (₹)</label>
                                                                                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={color.baseCost} onChange={(e) => handleColorChange(idx, "baseCost", e.target.value ? Number(e.target.value) : "")}/>
                                                                            </div>
                                                                            <div className="form-group">
                                                                                <label>Printing Cost (₹)</label>
                                                                                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={color.printingCost} onChange={(e) => handleColorChange(idx, "printingCost", e.target.value ? Number(e.target.value) : "")}/>
                                                                            </div>
                                                                            <div className="form-group">
                                                                                <label>Shipping Cost (₹)</label>
                                                                                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={color.shippingCost} onChange={(e) => handleColorChange(idx, "shippingCost", e.target.value ? Number(e.target.value) : "")}/>
                                                                            </div>
                                                                            <div className="form-group">
                                                                                <label>Additional Cost (₹)</label>
                                                                                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={color.additionalCost} onChange={(e) => handleColorChange(idx, "additionalCost", e.target.value ? Number(e.target.value) : "")}/>
                                                                            </div>
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            </div>)}
                                                    </div>
                                                </div>)}
                                        </div>);
        })}
                            </div>
                        </div>

                        <hr className="section-divider"/>

                        {/* ── 4. Sizing ─────────────────────────────────────── */}
                        <div className="form-section">
                            <h3 className="section-title">4. Sizing Details &amp; Availability</h3>
                            <div className="sizes-manager-container">
                                <label className="sizes-section-label">Available Sizes (Click to toggle availability)</label>

                                <div className="sizes-chips-list">
                                    {formSizes.map((s, idx) => (<div key={idx} className={`size-chip-box ${s.isAvailable ? "chip-available" : "chip-unavailable"} ${s.isExisting ? "chip-existing" : ""}`} onClick={() => handleToggleSizeAvailability(idx)}>
                                            <span className="size-chip-title">{s.size}</span>
                                            <span className="size-chip-status-text">
                                                {s.isAvailable ? "Available" : "Not Available"}
                                            </span>

                                            {!s.isExisting ? (<button type="button" className="size-chip-delete-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSize(idx);
                }} title="Remove unsaved size">
                                                    <X size={12}/>
                                                </button>) : (<span className="size-chip-lock-icon" title="Existing size cannot be deleted. Click chip to toggle Not Available.">
                                                    <Lock size={10}/>
                                                </span>)}
                                        </div>))}
                                </div>

                                <div className="add-size-row">
                                    <input type="text" className="input add-size-input" placeholder="Type new size (e.g. XXL, 32, OS)" value={newSizeInput} onChange={(e) => setNewSizeInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddSize();
            }
        }}/>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSize}>
                                        <Plus size={14}/> Add Size
                                    </button>
                                </div>
                                <p className="field-hint mt-8">
                                    Click any size pill to toggle between <strong>Available</strong> and <strong>Not Available</strong>. Existing sizes cannot be hard-deleted to preserve active order tracking.
                                </p>
                            </div>

                            <div className="product-form-grid mt-20">
                                <div className="form-group product-form-full">
                                    <ImageDropZone label="Size Chart Image" value={sizeChart} onChange={setSizeChart} optional placeholder="Drag & drop size chart image here"/>
                                </div>
                            </div>
                        </div>

                        <hr className="section-divider"/>

                        {/* ── 5. Additional Details ─────────────────────────── */}
                        <div className="form-section">
                            <h3 className="section-title">5. Details &amp; Notes</h3>

                            <div className="form-group product-form-full mb-20">
                                <label>Description</label>
                                <textarea className="input" placeholder="Enter product description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}/>
                            </div>
                            <div className="form-group product-form-full mb-20">
                                <label>Designer Note</label>
                                <textarea className="input" placeholder="e.g. Conceived with a focus on structural integrity and silhouette..." value={designerNote} onChange={(e) => setDesignerNote(e.target.value)} rows={2}/>
                            </div>
                            <div className="form-group product-form-full mb-20">
                                <label>Wash Care Instructions</label>
                                <textarea className="input" placeholder="e.g. Machine wash cold, inside out..." value={washCare} onChange={(e) => setWashCare(e.target.value)} rows={2}/>
                            </div>
                            <div className="form-group product-form-full">
                                <label>Shipping Note</label>
                                <textarea className="input" placeholder="e.g. Ships within 2-3 business days." value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} rows={2}/>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer sticky-footer">
                        {isEditing && onDelete && (
                            <button
                                type="button"
                                className={`product-delete-btn ${isDeleting ? "is-loading" : ""}`}
                                onClick={handleDeleteClick}
                                disabled={isSubmitting || isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={16} className="spin-icon" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </>
                                )}
                            </button>
                        )}
                        <div className="modal-actions-right">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting || isDeleting}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn-submit-primary ${isSubmitting ? "is-loading" : ""}`}
                                disabled={isSubmitting || isDeleting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={17} className="spin-icon" />
                                        <span>{isEditing ? "Saving Changes..." : "Submitting..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye size={17} />
                                        <span>{isEditing ? "Preview & Save Changes" : "Preview & Submit"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>);
};
export default ProductModal;
