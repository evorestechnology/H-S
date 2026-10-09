import { useState, useEffect, useMemo } from "react";
import "./Catalog.css";
import { getDrops, getCatalogSummary, createDrop, updateDrop, updateDropStatus, deleteDrop, createProduct, updateProduct, deleteProduct } from "./api";
import { getPortalUser, isUserInRole } from "../../shared/services/authStorage";
import CatalogHeader from "./components/CatalogHeader/CatalogHeader";
import CatalogStats from "./components/CatalogStats/CatalogStats";
import CatalogFilter from "./components/CatalogFilter/CatalogFilter";
import DropList from "./components/DropList/DropList";
import CatalogModal from "./components/CatalogModal/CatalogModal";
import ProductModal from "./components/ProductModal/ProductModal";
import EmptyState from "./components/EmptyState/EmptyState";
const Catalog = () => {
    const [drops, setDrops] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [sortOrder, setSortOrder] = useState("newest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDrop, setEditingDrop] = useState(null);
    // Product Management State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [activeDropId, setActiveDropId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const currentUser = getPortalUser("admin");
    const isAdmin = isUserInRole(currentUser, ["ADMIN", "ADMINISTRATOR"]);
    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
        else {
            setIsLoading(false);
        }
    }, [isAdmin]);
    const loadData = async () => {
        if (!isAdmin)
            return;
        setIsLoading(true);
        try {
            const dropsData = await getDrops();
            setDrops(dropsData);
            setIsLoading(false);
            const summaryData = await getCatalogSummary(dropsData);
            setSummary(summaryData);
        }
        catch (error) {
            console.error("Failed to load catalog data:", error);
            setIsLoading(false);
        }
    };
    const refreshSummary = async () => {
        try {
            const updatedSummary = await getCatalogSummary();
            setSummary(updatedSummary);
        }
        catch (error) {
            console.error("Failed to refresh catalog summary:", error);
        }
    };
    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("All Status");
        setCategoryFilter("All Categories");
        setSortOrder("newest");
    };
    const filteredAndSortedDrops = useMemo(() => {
        let result = drops.map(drop => {
            if (categoryFilter === "All Categories")
                return drop;
            const matchingProducts = drop.products.filter(p => p.category === categoryFilter);
            return { ...drop, products: matchingProducts };
        }).filter(drop => {
            const matchesStatus = statusFilter === "All Status" || drop.status === statusFilter;
            const matchesCategory = categoryFilter === "All Categories" || drop.products.length > 0;
            const keyword = search.toLowerCase();
            const matchesSearch = drop.dropName.toLowerCase().includes(keyword) ||
                drop.products.some(p => p.name.toLowerCase().includes(keyword));
            return matchesStatus && matchesCategory && matchesSearch;
        });
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [drops, search, statusFilter, categoryFilter, sortOrder]);
    const handleSaveDrop = async (dropName, status) => {
        setIsModalOpen(false);
        try {
            if (editingDrop) {
                const updatedDrop = await updateDrop(editingDrop.id, { dropName, status });
                setDrops(drops.map(d => d.id === editingDrop.id ? { ...updatedDrop, products: d.products } : d));
            }
            else {
                const newDrop = await createDrop(dropName, status);
                setDrops([newDrop, ...drops]);
                setTimeout(() => {
                    setActiveDropId(newDrop.id);
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                }, 300);
            }
            await refreshSummary();
        }
        catch (error) {
            console.error("Failed to save drop:", error);
        }
    };
    const handleUpdateDropStatus = async (dropId, status) => {
        try {
            await updateDropStatus(dropId, status);
            setDrops(prev => prev.map(d => d.id === dropId ? { ...d, status } : d));
            await refreshSummary();
        }
        catch (error) {
            console.error("Failed to update drop status:", error);
        }
    };
    const handleEditDrop = (id) => {
        const dropToEdit = drops.find(d => d.id === id);
        if (dropToEdit) {
            setEditingDrop(dropToEdit);
            setIsModalOpen(true);
        }
    };
    const openAddDropModal = () => {
        setEditingDrop(null);
        setIsModalOpen(true);
    };
    const handleDeleteDrop = async (id) => {
        if (window.confirm("Are you sure you want to delete this drop?")) {
            try {
                await deleteDrop(id);
                setDrops(drops.filter(d => d.id !== id));
                await refreshSummary();
            }
            catch (error) {
                console.error("Failed to delete drop:", error);
            }
        }
    };
    const openAddProductModal = (dropId) => {
        setActiveDropId(dropId);
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };
    const openEditProductModal = (dropId, product) => {
        setActiveDropId(dropId);
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };
    const handleSaveProduct = async (productData) => {
        if (!activeDropId)
            return;
        try {
            if (editingProduct) {
                const updatedProduct = await updateProduct(editingProduct.id, productData);
                setDrops(drops.map(d => {
                    if (d.id === activeDropId) {
                        return { ...d, products: d.products.map(p => p.id === editingProduct.id ? updatedProduct : p) };
                    }
                    return d;
                }));
            }
            else {
                const newProduct = await createProduct(activeDropId, productData);
                setDrops(drops.map(d => {
                    if (d.id === activeDropId) {
                        return { ...d, products: [newProduct, ...d.products] };
                    }
                    return d;
                }));
            }
            setIsProductModalOpen(false);
            await refreshSummary();
        }
        catch (error) {
            console.error("Failed to save product:", error);
        }
    };
    const handleUpdateProductPrice = async (dropId, productId, newPrice) => {
        try {
            const drop = drops.find(d => d.id === dropId);
            const product = drop?.products.find(p => p.id === productId);
            let updatedColors = undefined;
            if (product?.colors && Array.isArray(product.colors) && product.colors.length > 0) {
                updatedColors = product.colors.map(c => ({
                    ...c,
                    userPrice: newPrice,
                    sellingPrice: newPrice
                }));
            }
            const updatedProduct = await updateProduct(productId, {
                userPrice: newPrice,
                price: newPrice,
                ...(updatedColors ? { colors: updatedColors } : {})
            });
            setDrops(prev => prev.map(d => {
                if (d.id === dropId) {
                    return {
                        ...d,
                        products: d.products.map(p => p.id === productId ? { ...p, ...updatedProduct, userPrice: newPrice, price: newPrice, colors: updatedColors || p.colors } : p)
                    };
                }
                return d;
            }));
            await refreshSummary();
        }
        catch (error) {
            console.error("Failed to update product price:", error);
            throw error;
        }
    };
    const handleDeleteProduct = async () => {
        if (!editingProduct || !activeDropId)
            return;
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(editingProduct.id);
                setDrops(drops.map(d => {
                    if (d.id === activeDropId) {
                        return { ...d, products: d.products.filter(p => p.id !== editingProduct.id) };
                    }
                    return d;
                }));
                setIsProductModalOpen(false);
                await refreshSummary();
            }
            catch (error) {
                console.error("Failed to delete product:", error);
            }
        }
    };
    if (!isAdmin) {
        return (<div className="catalog-page">
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>
                        Access Restricted
                    </h2>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                        Admin privileges are required to view or manage catalog.
                    </p>
                </div>
            </div>);
    }
    return (<div className="catalog-page">
            <CatalogHeader onAddDrop={openAddDropModal}/>
            
            <CatalogStats summary={summary}/>
            
            <CatalogFilter search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusChange={setStatusFilter} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} sortOrder={sortOrder} onSortChange={setSortOrder} onReset={handleResetFilters}/>

            {isLoading ? (<div className="catalog-loading">
                    <p>Loading catalog data...</p>
                </div>) : drops.length === 0 ? (<EmptyState onAction={openAddDropModal}/>) : filteredAndSortedDrops.length === 0 ? (<div className="catalog-no-results">
                    <p>No drops match your current filters.</p>
                </div>) : (<DropList drops={filteredAndSortedDrops} onEdit={handleEditDrop} onDelete={handleDeleteDrop} onAddProduct={openAddProductModal} onEditProduct={openEditProductModal} onUpdateStatus={handleUpdateDropStatus} onUpdateProductPrice={handleUpdateProductPrice}/>)}

            <CatalogModal open={isModalOpen} drop={editingDrop} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveDrop}/>

            <ProductModal open={isProductModalOpen} product={editingProduct} onClose={() => setIsProductModalOpen(false)} onSubmit={handleSaveProduct} onDelete={editingProduct ? handleDeleteProduct : undefined}/>
        </div>);
};
export default Catalog;
