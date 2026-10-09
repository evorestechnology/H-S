import React, { useState } from "react";
import { Tag, Plus, Trash2, Edit3, Check, X, RotateCcw, Search, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCategories, addCategory, updateCategory, deleteCategory, resetCategories } from "../../../../shared/services/categoryService";
import "./CategorySettingsCard.css";
export const CategorySettingsCard = () => {
    const categories = useCategories();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [alertMessage, setAlertMessage] = useState(null);
    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage(null), 3000);
    };
    const handleAdd = async (e) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();
        if (!trimmed) {
            showAlert("error", "Please enter a valid category name.");
            return;
        }
        if (categories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
            showAlert("error", `Category "${trimmed}" already exists.`);
            return;
        }
        try {
            await addCategory(trimmed);
            setNewCategoryName("");
            showAlert("success", `Category "${trimmed}" added successfully!`);
        }
        catch (err) {
            showAlert("error", err?.message || "Failed to add category to database.");
        }
    };
    const handleStartEdit = (cat) => {
        setEditingCategory(cat);
        setEditValue(cat);
    };
    const handleSaveEdit = async (oldName) => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            showAlert("error", "Category name cannot be empty.");
            return;
        }
        if (trimmed.toLowerCase() !== oldName.toLowerCase() &&
            categories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
            showAlert("error", `Category "${trimmed}" already exists.`);
            return;
        }
        try {
            await updateCategory(oldName, trimmed);
            setEditingCategory(null);
            setEditValue("");
            showAlert("success", `Category updated to "${trimmed}".`);
        }
        catch (err) {
            showAlert("error", err?.message || "Failed to update category in database.");
        }
    };
    const handleDelete = async (cat) => {
        if (categories.length <= 1) {
            showAlert("error", "At least one product category must remain.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete category "${cat}"?`)) {
            try {
                await deleteCategory(cat);
                showAlert("success", `Category "${cat}" removed.`);
            }
            catch (err) {
                showAlert("error", err?.message || "Failed to delete category.");
            }
        }
    };
    const handleReset = async () => {
        if (window.confirm("Reset categories back to default list (T-Shirts, Hoodies, Pants, Accessories, Shorts)?")) {
            try {
                await resetCategories();
                showAlert("success", "Categories reset to default values.");
            }
            catch (err) {
                showAlert("error", err?.message || "Failed to reset categories.");
            }
        }
    };
    const filteredCategories = categories.filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="category-settings-card">
            <div className="card-header-bar">
                <div className="card-title-group">
                    <div className="title-icon-wrapper">
                        <Layers size={20}/>
                    </div>
                    <div>
                        <h2>Product Categories Management</h2>
                        <p>Add, edit, or remove catalog categories. Changes instantly update all product forms & filters.</p>
                    </div>
                </div>

                <button type="button" className="reset-categories-btn" onClick={handleReset}>
                    <RotateCcw size={14}/>
                    <span>Reset Defaults</span>
                </button>
            </div>

            {alertMessage && (<div className={`category-alert ${alertMessage.type}`}>
                    {alertMessage.type === "success" ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    <span>{alertMessage.text}</span>
                </div>)}

            {/* Add Category Form */}
            <form onSubmit={handleAdd} className="add-category-form">
                <div className="add-category-input-group">
                    <Tag size={18} className="input-prefix-icon"/>
                    <input type="text" className="category-input" placeholder="Enter new category name (e.g. Tank Tops, Gym Bags)..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}/>
                </div>
                <button type="submit" className="add-category-btn">
                    <Plus size={16}/>
                    <span>Add Category</span>
                </button>
            </form>

            {/* Search & Filter Toolbar */}
            <div className="category-toolbar">
                <div className="category-search-box">
                    <Search size={16} className="search-icon"/>
                    <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>
                <div className="category-count-badge">
                    <span>Total Active Categories: <strong>{categories.length}</strong></span>
                </div>
            </div>

            {/* Category Items List */}
            <div className="category-list-grid">
                {filteredCategories.length === 0 ? (<div className="empty-category-notice">
                        <p>No categories match "{searchQuery}"</p>
                    </div>) : (filteredCategories.map((cat) => {
            const isEditing = editingCategory === cat;
            return (<div key={cat} className={`category-item-card ${isEditing ? "editing" : ""}`}>
                                <div className="category-item-left">
                                    <div className="cat-badge-icon">
                                        <Tag size={16}/>
                                    </div>
                                    {isEditing ? (<input type="text" className="inline-edit-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter")
                            handleSaveEdit(cat);
                        if (e.key === "Escape")
                            setEditingCategory(null);
                    }} autoFocus/>) : (<span className="category-name-text">{cat}</span>)}
                                </div>

                                <div className="category-item-actions">
                                    {isEditing ? (<>
                                            <button type="button" className="action-btn save-btn" onClick={() => handleSaveEdit(cat)} title="Save Changes">
                                                <Check size={14}/>
                                            </button>
                                            <button type="button" className="action-btn cancel-btn" onClick={() => setEditingCategory(null)} title="Cancel">
                                                <X size={14}/>
                                            </button>
                                        </>) : (<>
                                            <button type="button" className="action-btn edit-btn" onClick={() => handleStartEdit(cat)} title="Edit Category Name">
                                                <Edit3 size={14}/>
                                            </button>
                                            <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(cat)} title="Delete Category">
                                                <Trash2 size={14}/>
                                            </button>
                                        </>)}
                                </div>
                            </div>);
        }))}
            </div>
        </div>);
};
