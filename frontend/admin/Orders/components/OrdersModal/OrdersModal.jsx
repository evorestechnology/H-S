import { useEffect, useState } from "react";
import "./OrdersModal.css";
import { X } from "lucide-react";
import { getManufacturers } from "../../api";
import { getUsers } from "../../../Users/api";
import { getProducts } from "../../../Catalog/api";
const OrdersModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
    const [itemName, setItemName] = useState("");
    const [mfgItemName, setMfgItemName] = useState("");
    const [size, setSize] = useState("");
    const [color, setColor] = useState("");
    const [orderedBy, setOrderedBy] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("India");
    const [shippingAddress, setShippingAddress] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [mfgPayment, setMfgPayment] = useState("");
    const [status, setStatus] = useState("In Progress");
    const [manufacturerId, setManufacturerId] = useState("");
    const [manufacturers, setManufacturers] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    useEffect(() => {
        if (open) {
            getManufacturers()
                .then((data) => setManufacturers(data || []))
                .catch((err) => console.error("Could not load manufacturers:", err));
            getUsers()
                .then((res) => setUsers(res?.users || []))
                .catch((err) => console.error("Could not load users:", err));
            getProducts()
                .then((data) => setProducts(data || []))
                .catch((err) => console.error("Could not load catalog products:", err));
        }
    }, [open]);
    if (!open)
        return null;
    const handleSelectUser = (userId) => {
        setOrderedBy(userId);
        const selected = users.find((u) => u.id === userId);
        if (selected) {
            setFullName(selected.fullName || selected.fullname || selected.username || "");
            setPhone(selected.mobile || selected.phone || "");
            if (selected.country && selected.country !== "N/A") {
                setCountry(selected.country);
            }
            if (selected.shippingAddress && selected.shippingAddress !== "N/A") {
                setShippingAddress(selected.shippingAddress);
            }
        }
    };
    const resolveProductMfgPrice = (prod, chosenColor) => {
        if (!prod)
            return "";
        if (Array.isArray(prod.colors) && chosenColor) {
            const normalized = chosenColor.toLowerCase().trim();
            const matched = prod.colors.find((c) => {
                if (!c)
                    return false;
                if (typeof c === "string")
                    return c.toLowerCase().trim() === normalized;
                const cName = (c.name || "").toLowerCase().trim();
                const cCode = (c.code || "").toLowerCase().trim();
                return (cName === normalized ||
                    cCode === normalized ||
                    (cName && normalized && (cName.includes(normalized) || normalized.includes(cName))));
            });
            if (matched) {
                if (typeof matched.manufacturePrice === "number" && matched.manufacturePrice > 0) {
                    return String(matched.manufacturePrice);
                }
                const cBase = Number(matched.baseCost) || 0;
                const cPrint = Number(matched.printingCost) || 0;
                const cShip = Number(matched.shippingCost) || 0;
                const cAdd = Number(matched.additionalCost) || 0;
                const total = cBase + cPrint + cShip + cAdd;
                if (total > 0)
                    return String(total);
            }
        }
        if (typeof prod.manufacturePrice === "number" && prod.manufacturePrice > 0) {
            return String(prod.manufacturePrice);
        }
        return "";
    };
    const handleSelectProduct = (selectedName) => {
        setItemName(selectedName);
        const prod = products.find((p) => p.name.toLowerCase() === selectedName.toLowerCase().trim());
        if (prod) {
            setMfgItemName(prod.manufactureName || prod.name);
            if (prod.price || prod.userPrice) {
                setAmountPaid(String(prod.price || prod.userPrice));
            }
            let selectedColor = color;
            if (Array.isArray(prod.colors) && prod.colors.length > 0) {
                const hasCurrentColor = prod.colors.some((c) => {
                    const cName = typeof c === "string" ? c : c.name;
                    return cName && cName.toLowerCase().trim() === color.toLowerCase().trim();
                });
                if (!hasCurrentColor || !color) {
                    const firstC = prod.colors[0];
                    selectedColor = typeof firstC === "string" ? firstC : (firstC.name || firstC.code || "");
                    setColor(selectedColor);
                }
            }
            if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
                const hasCurrentSize = prod.sizes.some((s) => {
                    const sName = typeof s === "string" ? s : s.size;
                    return sName && sName.toLowerCase().trim() === size.toLowerCase().trim();
                });
                if (!hasCurrentSize || !size) {
                    const firstS = prod.sizes[0];
                    setSize(typeof firstS === "string" ? firstS : (firstS.size || ""));
                }
            }
            const mfgP = resolveProductMfgPrice(prod, selectedColor);
            if (mfgP) {
                setMfgPayment(mfgP);
            }
        }
    };
    const handleColorChange = (newColor) => {
        setColor(newColor);
        const prod = products.find((p) => p.name.toLowerCase() === itemName.toLowerCase().trim());
        if (prod) {
            const mfgP = resolveProductMfgPrice(prod, newColor);
            if (mfgP) {
                setMfgPayment(mfgP);
            }
        }
    };
    const handleSubmit = () => {
        if (!itemName.trim()) {
            alert("Please select or enter an item name");
            return;
        }
        if (!size.trim()) {
            alert("Please select or enter a size");
            return;
        }
        if (!color.trim()) {
            alert("Please select or enter a color");
            return;
        }
        if (!amountPaid || Number(amountPaid) <= 0) {
            alert("Please enter a valid amount paid");
            return;
        }
        const trimmedUserItem = itemName.trim();
        const trimmedMfgItem = mfgItemName.trim() || `MFG ${trimmedUserItem}`;
        onSubmit({
            itemName: trimmedUserItem,
            mfgItemName: trimmedMfgItem,
            size: size.trim(),
            color: color.trim(),
            orderedBy: orderedBy.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            country: country.trim() || "India",
            shippingAddress: shippingAddress.trim(),
            amountPaid: Number(amountPaid) || 0,
            mfgPayment: Number(mfgPayment) || 0,
            status,
            manufacturerId: manufacturerId ? manufacturerId : undefined
        });
        setItemName("");
        setMfgItemName("");
        setSize("");
        setColor("");
        setOrderedBy("");
        setFullName("");
        setPhone("");
        setCountry("India");
        setShippingAddress("");
        setAmountPaid("");
        setMfgPayment("");
        setStatus("In Progress");
        setManufacturerId("");
        onClose();
    };
    return (<div className="orders-modal-overlay">
            <div className="orders-modal">
                <div className="orders-modal-header">
                    <h2>Create New Order</h2>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="orders-modal-body">
                    <div className="grid-2">
                        <div className="form-group">
                            <label>User Item Name *</label>
                            <input type="text" list="catalog-products-list" placeholder="e.g. H&S Silk Hoodie" value={itemName} onChange={(e) => handleSelectProduct(e.target.value)} disabled={isSubmitting}/>
                            <datalist id="catalog-products-list">
                                {products.map((p) => (<option key={p.id} value={p.name}>
                                        {p.name} (MFG Price: ₹{p.manufacturePrice ?? "N/A"})
                                    </option>))}
                            </datalist>
                        </div>
                        <div className="form-group">
                            <label>Mfg Item Name</label>
                            <input type="text" placeholder="e.g. MFG Heavyweight Silk Hoodie 380GSM" value={mfgItemName} onChange={(e) => setMfgItemName(e.target.value)} disabled={isSubmitting}/>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Size</label>
                            <input type="text" list="admin-order-modal-sizes" placeholder="e.g. L, M, 42 EU" value={size} onChange={(e) => setSize(e.target.value)} disabled={isSubmitting}/>
                            {(() => {
            const prod = products.find((p) => p.name.toLowerCase() === itemName.toLowerCase().trim());
            if (Array.isArray(prod?.sizes) && prod.sizes.length > 0) {
                return (<datalist id="admin-order-modal-sizes">
                                            {prod.sizes.map((s, idx) => {
                        const sName = typeof s === "string" ? s : s.size;
                        return (<option key={idx} value={sName}>
                                                        {sName}
                                                    </option>);
                    })}
                                        </datalist>);
            }
            return null;
        })()}
                        </div>
                        <div className="form-group">
                            <label>Color</label>
                            <input type="text" list="admin-order-modal-colors" placeholder="e.g. Black, White, Green" value={color} onChange={(e) => handleColorChange(e.target.value)} disabled={isSubmitting}/>
                            {(() => {
            const prod = products.find((p) => p.name.toLowerCase() === itemName.toLowerCase().trim());
            if (Array.isArray(prod?.colors) && prod.colors.length > 0) {
                return (<datalist id="admin-order-modal-colors">
                                            {prod.colors.map((c, idx) => {
                        const cName = typeof c === "string" ? c : c.name;
                        const mfg = typeof c === "object" ? (c.manufacturePrice ?? prod.manufacturePrice) : prod.manufacturePrice;
                        return (<option key={idx} value={cName}>
                                                        {cName} (MFG: ₹{mfg ?? "N/A"})
                                                    </option>);
                    })}
                                        </datalist>);
            }
            return null;
        })()}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Select Registered Customer</label>
                        <select value={orderedBy} onChange={(e) => handleSelectUser(e.target.value)} disabled={isSubmitting}>
                            <option value="">-- Select Customer / User --</option>
                            {users.map((u) => (<option key={u.id} value={u.id}>
                                    {u.fullName || u.fullname || u.username} ({u.email || u.id})
                                </option>))}
                        </select>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Ordered By (User ID)</label>
                            <input type="text" placeholder="e.g. Customer ID" value={orderedBy} onChange={(e) => setOrderedBy(e.target.value)} disabled={isSubmitting}/>
                        </div>
                        <div className="form-group">
                            <label>Customer Full Name</label>
                            <input type="text" placeholder="e.g. Customer Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSubmitting}/>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" placeholder="e.g. +1 555-019-2831" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting}/>
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input type="text" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)} disabled={isSubmitting}/>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Amount Paid (₹) *</label>
                            <input type="number" placeholder="e.g. 199.99" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} disabled={isSubmitting}/>
                        </div>
                        <div className="form-group">
                            <label>MFG Payment (₹)</label>
                            <input type="number" placeholder="e.g. 120.00" value={mfgPayment} onChange={(e) => setMfgPayment(e.target.value)} disabled={isSubmitting}/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Shipping Address</label>
                        <input type="text" placeholder="e.g. 742 Evergreen Terr, Springfield, IL" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} disabled={isSubmitting}/>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Initial Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSubmitting}>
                                <option value="In Progress">In Progress</option>
                                <option value="Shipping">Shipping</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Assign Manufacturer</label>
                            <select value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)} disabled={isSubmitting}>
                                <option value="">All Manufacturers (Unassigned)</option>
                                {manufacturers.map((mfg) => (<option key={mfg.id} value={mfg.id}>
                                        {mfg.companyName ? `${mfg.companyName} (${mfg.fullName})` : mfg.fullName}
                                    </option>))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="orders-modal-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Order"}
                    </button>
                </div>
            </div>
        </div>);
};
export default OrdersModal;
