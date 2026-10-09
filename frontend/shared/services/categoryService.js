import { useState, useEffect } from "react";
import apiClient from "./apiClient";
// In-memory runtime cache populated strictly from the PostgreSQL database
let cachedCategories = [];
// Helper to notify all component subscribers
const notifyCategoryChange = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("categoriesChanged"));
    }
};
/**
 * Fetch all categories from backend database.
 */
export const fetchCategories = async () => {
    try {
        const data = await apiClient.get("/catalogue/categories");
        if (Array.isArray(data)) {
            cachedCategories = data;
            notifyCategoryChange();
            return data;
        }
    }
    catch (error) {
        console.error("Failed to fetch categories from database:", error);
        throw error;
    }
    return cachedCategories;
};
/**
 * Synchronous getter returning category names from the database cache.
 */
export const getCategories = () => {
    return cachedCategories.map(c => c.name);
};
/**
 * Synchronous getter returning category weight rules from the database cache.
 */
export const getCategoryWeightRules = () => {
    return cachedCategories.map(c => ({
        categoryName: c.name,
        conversionRule: c.conversionRule || `1 kg = 2 ${c.name}`,
        weightPerPiece: c.weightPerPiece || 0.5
    }));
};
/**
 * Persist category weight rules to backend database.
 */
export const updateCategoryWeightRules = async (rules) => {
    try {
        const response = await apiClient.put("/catalogue/categories/rules", rules);
        if (response?.data && Array.isArray(response.data)) {
            cachedCategories = response.data;
        }
        else {
            await fetchCategories();
        }
        notifyCategoryChange();
    }
    catch (error) {
        console.error("Failed to update weight rules in database:", error);
        throw error;
    }
};
/**
 * Add category to backend database.
 */
export const addCategory = async (name) => {
    const trimmed = name.trim();
    if (!trimmed)
        return;
    try {
        await apiClient.post("/catalogue/categories", {
            name: trimmed,
            weightPerPiece: 0.5,
            conversionRule: `1 kg = 2 ${trimmed}`
        });
        await fetchCategories();
    }
    catch (error) {
        console.error("Failed to add category to database:", error);
        throw error;
    }
};
/**
 * Update category in backend database.
 */
export const updateCategory = async (oldName, newName) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew)
        return;
    try {
        await apiClient.put(`/catalogue/categories/${encodeURIComponent(oldName)}`, {
            name: trimmedNew
        });
        await fetchCategories();
    }
    catch (error) {
        console.error("Failed to update category in database:", error);
        throw error;
    }
};
/**
 * Delete category from backend database.
 */
export const deleteCategory = async (name) => {
    try {
        await apiClient.delete(`/catalogue/categories/${encodeURIComponent(name)}`);
        await fetchCategories();
    }
    catch (error) {
        console.error("Failed to delete category from database:", error);
        throw error;
    }
};
/**
 * Reset categories to defaults in backend database.
 */
export const resetCategories = async () => {
    try {
        await apiClient.post("/catalogue/categories/reset");
        await fetchCategories();
    }
    catch (error) {
        console.error("Failed to reset categories in database:", error);
        throw error;
    }
};
/**
 * React hook for reactive, database-driven category list.
 */
export const useCategories = () => {
    const [categories, setCategories] = useState(getCategories);
    useEffect(() => {
        fetchCategories().then(() => {
            setCategories(getCategories());
        });
        const handleUpdate = () => {
            setCategories(getCategories());
        };
        window.addEventListener("categoriesChanged", handleUpdate);
        return () => {
            window.removeEventListener("categoriesChanged", handleUpdate);
        };
    }, []);
    return categories;
};
/**
 * React hook for reactive, database-driven category weight rules.
 */
export const useCategoryWeightRules = () => {
    const [weightRules, setWeightRules] = useState(getCategoryWeightRules);
    useEffect(() => {
        fetchCategories().then(() => {
            setWeightRules(getCategoryWeightRules());
        });
        const handleUpdate = () => {
            setWeightRules(getCategoryWeightRules());
        };
        window.addEventListener("categoriesChanged", handleUpdate);
        return () => {
            window.removeEventListener("categoriesChanged", handleUpdate);
        };
    }, []);
    return weightRules;
};
