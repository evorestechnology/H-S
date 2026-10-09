import { prisma } from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';
import { uploadBase64ToSupabase } from '../utils/imageHelper.js';
import fs from 'fs';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

// @desc    Upload product photo, mockup image, or design file
// @route   POST /api/catalogue/upload or /api/products/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  try {
    // 1. Handle Multer file upload
    if (req.file) {
      const extension = (req.file.originalname.split('.').pop() || '').toLowerCase();
      const mimeType = (req.file.mimetype || '').toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_MIME_TYPES.includes(mimeType)) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Invalid file format. Only JPEG, PNG, and WebP are allowed.' });
      }

      if (req.file.size > MAX_UPLOAD_BYTES) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'File exceeds maximum 10MB limit.' });
      }

      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(201).json({ url: publicUrlData.publicUrl, message: 'Image uploaded to Supabase successfully' });
      } catch (err) {
        console.error('Supabase raw file upload error:', err);
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(201).json({ url: fileUrl, message: 'Image uploaded locally (Supabase fallback)' });
      }
    }

    // 2. Handle Base64 JSON upload
    const { file, image } = req.body || {};
    const rawData = file || image;
    if (rawData && typeof rawData === 'string') {
      if (rawData.includes('image/svg+xml')) {
        return res.status(400).json({ success: false, message: 'SVG format is not allowed for security reasons.' });
      }
      const publicUrl = await uploadBase64ToSupabase(rawData);
      return res.status(201).json({ url: publicUrl, message: 'Image uploaded to Supabase successfully' });
    }

    res.status(400).json({ success: false, message: 'No file uploaded' });
  } catch (error) {
    console.error('Error in uploadImage:', error.message);
    res.status(500).json({ success: false, message: 'Server error handling image upload' });
  }
};

// @desc    Get product categories from database
// @route   GET /api/catalogue/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { all, format } = req.query;
    const where = all === 'true' ? {} : { isActive: true };

    const queryPromise = prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Categories DB query timeout')), 5000)
    );

    const categories = await Promise.race([queryPromise, timeoutPromise]);

    if (format === 'names') {
      return res.json(categories.map(c => c.name));
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.json([]);
  }
};

// @desc    Create new product category
// @route   POST /api/catalogue/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, weightPerPiece, conversionRule } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmedName, mode: 'insensitive' } }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const id = `CAT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const category = await prisma.category.create({
      data: {
        id,
        name: trimmedName,
        description: description || null,
        weightPerPiece: Number(weightPerPiece) || 0.500,
        conversionRule: conversionRule || `1 kg = 2 ${trimmedName}`,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// @desc    Update product category
// @route   PUT /api/catalogue/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weightPerPiece, conversionRule, isActive } = req.body;

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { name: { equals: id, mode: 'insensitive' } }
        ]
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (weightPerPiece !== undefined) updateData.weightPerPiece = Number(weightPerPiece);
    if (conversionRule !== undefined) updateData.conversionRule = conversionRule;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: updateData
    });

    if (name && name.trim() && name.trim() !== existing.name) {
      await prisma.product.updateMany({
        where: { category: existing.name },
        data: { category: name.trim() }
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

// @desc    Delete product category
// @route   DELETE /api/catalogue/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { name: { equals: id, mode: 'insensitive' } }
        ]
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await prisma.product.count({
      where: { category: existing.name }
    });

    if (productCount > 0) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { isActive: false }
      });
      return res.json({
        success: true,
        message: `Category "${existing.name}" is used by ${productCount} products; deactivated.`
      });
    }

    await prisma.category.delete({
      where: { id: existing.id }
    });

    res.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// @desc    Update category weight rules in batch
// @route   PUT /api/catalogue/categories/rules
// @access  Private/Admin
export const updateCategoryWeightRules = async (req, res) => {
  try {
    const rules = req.body;
    if (!Array.isArray(rules)) {
      return res.status(400).json({ success: false, message: 'Expected an array of weight rules' });
    }

    await prisma.$transaction(async (tx) => {
      for (const rule of rules) {
        if (!rule.categoryName) continue;
        const trimmedName = rule.categoryName.trim();
        await tx.category.upsert({
          where: { name: trimmedName },
          update: {
            conversionRule: rule.conversionRule,
            weightPerPiece: Number(rule.weightPerPiece) || 0.500
          },
          create: {
            id: `CAT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            name: trimmedName,
            conversionRule: rule.conversionRule,
            weightPerPiece: Number(rule.weightPerPiece) || 0.500,
            isActive: true
          }
        });
      }
    });

    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      message: 'Category weight rules updated successfully',
      data: allCategories
    });
  } catch (error) {
    console.error('Error updating category weight rules:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update category weight rules' });
  }
};

// @desc    Reset categories to default gym apparel
// @route   POST /api/catalogue/categories/reset
// @access  Private/Admin
export const resetCategories = async (req, res) => {
  try {
    const defaults = [
      { name: 'T-Shirts', description: 'Performance & gym tees', weightPerPiece: 0.500, conversionRule: '1 kg = 2 T-Shirts' },
      { name: 'Hoodies', description: 'Heavyweight hoodies', weightPerPiece: 1.000, conversionRule: '1 kg = 1 Hoodie' },
      { name: 'Pants', description: 'Athletic trackpants', weightPerPiece: 1.000, conversionRule: '1 kg = 1 Pant / SP' },
      { name: 'Shorts', description: 'Breathable workout shorts', weightPerPiece: 0.333, conversionRule: '1 kg = 3 Shorts' },
      { name: 'Accessories', description: 'Gym gear & accessories', weightPerPiece: 0.250, conversionRule: '1 kg = 4 Accessories' }
    ];

    await prisma.$transaction(async (tx) => {
      for (const def of defaults) {
        await tx.category.upsert({
          where: { name: def.name },
          update: {
            weightPerPiece: def.weightPerPiece,
            conversionRule: def.conversionRule,
            isActive: true
          },
          create: {
            id: `CAT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            name: def.name,
            description: def.description,
            weightPerPiece: def.weightPerPiece,
            conversionRule: def.conversionRule,
            isActive: true
          }
        });
      }
    });

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      message: 'Categories reset to defaults successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error resetting categories:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset categories' });
  }
};

// @desc    Get print type options
// @route   GET /api/catalogue/print-types
// @access  Public
export const getPrintTypes = async (req, res) => {
  res.json(['DTF', 'DTG', 'Screen Print', 'Embroidery', 'Sublimation', 'Vinyl']);
};

// @desc    Get print position options
// @route   GET /api/catalogue/print-positions
// @access  Public
export const getPrintPositions = async (req, res) => {
  res.json([
    'Front Center',
    'Back Center',
    'Left Chest',
    'Right Chest',
    'Sleeve',
    'Full Front',
    'Full Back',
    'Inner Collar'
  ]);
};
