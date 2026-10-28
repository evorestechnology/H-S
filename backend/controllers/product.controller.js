import { prisma } from '../lib/prisma.js';
import { sanitizeProductImageFields } from '../utils/imageHelper.js';

const safeParseFloat = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const safeParseInt = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      // Fix common single quote JSON issues before parsing
      return JSON.parse(val.replace(/'/g, '"'));
    } catch (e) {
      return [val]; // If it's just a single string like "S", make it an array
    }
  }
  return val ? [val] : [];
};

// High-performance in-memory cache for catalog and product details (reduces remote DB roundtrip from 4s to 1ms)
const productCache = new Map();
const listCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

export const invalidateProductCache = (productId = null) => {
  if (productId) {
    productCache.delete(String(productId));
  } else {
    productCache.clear();
  }
  listCache.clear();
};

// Helper to sanitize color variant for catalog responses (exclude heavy Base64 modelPhotos array)
const sanitizeColorForList = (color) => {
  if (!color || typeof color !== 'object') return color;
  return {
    name: color.name || '',
    code: color.code || null,
    isAvailable: color.isAvailable !== false,
    userPrice: color.userPrice ?? color.sellingPrice ?? null,
    sellingPrice: color.sellingPrice ?? color.userPrice ?? null,
    manufacturePrice: color.manufacturePrice ?? null,
    baseCost: color.baseCost ?? 0,
    printingCost: color.printingCost ?? 0,
    shippingCost: color.shippingCost ?? 0,
    additionalCost: color.additionalCost ?? 0,
    printType: color.printType || null,
    printPosition: color.printPosition || null,
    printSpecs: Array.isArray(color.printSpecs) ? color.printSpecs : (color.printSpecs ? [color.printSpecs] : null),
    designFile: color.designFile || null,
    mockup: color.mockup || null,
    printWeave: color.printWeave || null,
    backWeave: color.backWeave || null,
    frontView: color.frontView || color.image || null,
    backView: color.backView || null,
    modelPhoto1: color.modelPhoto1 || (Array.isArray(color.modelPhotos) ? color.modelPhotos[0] : null) || null,
    modelPhoto2: color.modelPhoto2 || (Array.isArray(color.modelPhotos) ? color.modelPhotos[1] : null) || null
  };
};

// @desc    Get all products with filters & pagination
// @route   GET /api/products or /api/catalogue/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedList = listCache.get(cacheKey);
    if (cachedList && (Date.now() - cachedList.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedList.data);
    }
    const { category, isBestSeller, dropId, inStock, page: pageQuery, limit: limitQuery } = req.query;

    const hasPage = pageQuery !== undefined;
    const hasLimit = limitQuery !== undefined;
    const isPaginated = hasPage || hasLimit || req.query.paginate === 'true';

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitQuery, 10) || 20));
    const skip = (page - 1) * limit;

    // Build filter dynamically
    const filter = {};
    if (category && category !== 'All Categories') filter.category = { equals: category, mode: 'insensitive' };
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (dropId) filter.dropId = dropId;
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    // Hide products that belong to a Draft/Inactive drop from the public frontend
    // But ALLOW products that don't belong to any drop at all!
    if (req.query.all !== 'true') {
      filter.OR = [
        { dropId: null },
        { drop: { status: 'Live' } },
        { drop: { status: 'live' } },
        { drop: { isActive: true } }
      ];
    }

    const queryArgs = {
      where: filter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        manufactureName: true,
        description: true,
        price: true,
        userPrice: true,
        manufacturePrice: true,
        coverPhoto: true,
        images: true,
        category: true,
        gender: true,
        fit: true,
        isNew: true,
        isBestSeller: true,
        stock: true,
        inStock: true,
        sizes: true,
        colors: true,
        sizeChart: true,
        designerNote: true,
        washCare: true,
        shippingNote: true,
        manufactureSpec: true,
        priceBreakdown: true,
        dropId: true,
        drop: { select: { title: true, dropName: true, status: true } },
        createdAt: true,
        updatedAt: true
      }
    };

    if (isPaginated) {
      queryArgs.skip = skip;
      queryArgs.take = limit;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany(queryArgs),
      isPaginated ? prisma.product.count({ where: filter }) : Promise.resolve(null)
    ]);

    // Aggregate sales data per product to rank real Best Sellers
    let salesMap = {};
    try {
      const salesAgg = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { id: true }
      });
      for (const item of salesAgg) {
        if (item.productId) {
          salesMap[item.productId] = {
            totalSold: item._sum?.quantity || 0,
            orderCount: item._count?.id || 0
          };
        }
      }
    } catch (err) {
      console.warn('Could not aggregate sales data for products:', err.message);
    }

    // Format lightweight products list: sanitize colors and build authoritative images
    let formattedProducts = products.map(p => {
      const sanitizedColors = Array.isArray(p.colors)
        ? p.colors.map(sanitizeColorForList)
        : p.colors;
      const sales = salesMap[p.id] || { totalSold: 0, orderCount: 0 };

      // Primary color variant for front/back views
      const primaryColor = Array.isArray(sanitizedColors) && sanitizedColors.length > 0 ? sanitizedColors[0] : null;
      const coverPhoto = p.coverPhoto || primaryColor?.frontView || (Array.isArray(p.images) && p.images[0]) || '';
      const frontView = primaryColor?.frontView || coverPhoto;
      const backView = primaryColor?.backView 
        || (Array.isArray(p.images) && p.images.length > 1 ? p.images[1] : '')
        || primaryColor?.modelPhoto1 
        || '';

      // Aggregate all views and model photos for full alternate hover support
      const colorPhotos = Array.isArray(sanitizedColors)
        ? sanitizedColors.flatMap(c => [c.frontView, c.backView, c.modelPhoto1, c.modelPhoto2].filter(Boolean))
        : [];

      const allImages = Array.from(new Set([
        ...(coverPhoto ? [coverPhoto] : []),
        ...(frontView ? [frontView] : []),
        ...(backView ? [backView] : []),
        ...colorPhotos,
        ...(Array.isArray(p.images) ? p.images : [])
      ].filter(Boolean)));

      return {
        ...p,
        frontView,
        backView,
        coverPhoto,
        images: allImages.length > 0 ? allImages : (coverPhoto ? [coverPhoto] : []),
        totalSold: sales.totalSold,
        orderCount: sales.orderCount,
        colors: sanitizedColors
      };
    });

    // If client requested bestsellers sorting or filtering
    if (req.query.sort === 'bestsellers' || isBestSeller === 'true') {
      formattedProducts.sort((a, b) => {
        const soldA = a.totalSold || 0;
        const soldB = b.totalSold || 0;
        if (soldB !== soldA) return soldB - soldA;
        if (b.isBestSeller && !a.isBestSeller) return 1;
        if (a.isBestSeller && !b.isBestSeller) return -1;
        const stockA = a.inStock !== false ? 1 : 0;
        const stockB = b.inStock !== false ? 1 : 0;
        if (stockB !== stockA) return stockB - stockA;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    const result = isPaginated ? {
      success: true,
      count: formattedProducts.length,
      total: total ?? formattedProducts.length,
      page,
      limit,
      totalPages: Math.ceil((total ?? formattedProducts.length) / limit),
      data: formattedProducts,
      products: formattedProducts
    } : formattedProducts;

    listCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id or /api/catalogue/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cached = productCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json(cached.data);
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        drop: { select: { title: true, dropName: true } },
        reviews: {
          include: {
            user: { select: { fullName: true } }
          }
        }
      }
    });

    if (product) {
      const sanitizedColors = Array.isArray(product.colors)
        ? product.colors.map(sanitizeColorForList)
        : product.colors;

      const primaryColor = Array.isArray(sanitizedColors) && sanitizedColors.length > 0 ? sanitizedColors[0] : null;
      const coverPhoto = product.coverPhoto || primaryColor?.frontView || (Array.isArray(product.images) && product.images[0]) || '';
      const frontView = primaryColor?.frontView || coverPhoto;
      const backView = primaryColor?.backView 
        || (Array.isArray(product.images) && product.images.length > 1 ? product.images[1] : '')
        || '';

      const colorPhotos = Array.isArray(sanitizedColors)
        ? sanitizedColors.flatMap(c => [
            c.frontView, 
            c.backView, 
            c.modelPhoto1, 
            c.modelPhoto2
          ].filter(Boolean))
        : [];

      const allImages = Array.from(new Set([
        ...(coverPhoto ? [coverPhoto] : []),
        ...(frontView ? [frontView] : []),
        ...(backView ? [backView] : []),
        ...colorPhotos,
        ...(Array.isArray(product.images) ? product.images : [])
      ].filter(Boolean)));

      const formattedProduct = {
        ...product,
        frontView,
        backView,
        coverPhoto,
        images: allImages.length > 0 ? allImages : (coverPhoto ? [coverPhoto] : []),
        colors: sanitizedColors
      };

      productCache.set(id, { timestamp: Date.now(), data: formattedProduct });
      return res.json(formattedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products or /api/catalogue/drops/:dropId/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const dropIdFromParams = req.params.dropId;
    const body = await sanitizeProductImageFields(req.body);

    const { 
      name, manufactureName, description, price, userPrice, manufacturePrice,
      images, coverPhoto, category, gender, fit, isNew, isBestSeller, stock, inStock,
      sizes, colors, sizeChart, washCare, shippingNote, designerNote, priceBreakdown, manufactureSpec, dropId
    } = body;

    const targetDropId = dropIdFromParams || dropId;
    const finalPrice = price !== undefined ? safeParseFloat(price) : (userPrice ? safeParseFloat(userPrice) : 0);

    const createPayload = {
      name: name || 'Untitled Product',
      manufactureName: manufactureName || null,
      description: description || '',
      price: finalPrice ?? 0,
      userPrice: userPrice ? safeParseFloat(userPrice) : (finalPrice ?? 0),
      manufacturePrice: safeParseFloat(manufacturePrice),
      images: Array.isArray(images) && images.length > 0 ? images : (coverPhoto ? [coverPhoto] : []),
      coverPhoto: coverPhoto || (Array.isArray(images) && images[0] ? images[0] : ''),
      category: category || 'T-Shirts',
      gender: gender || 'Unisex',
      fit: fit || null,
      isNew: isNew === undefined ? true : isNew,
      isBestSeller: isBestSeller || false,
      stock: stock ? (safeParseInt(stock) ?? 0) : 0,
      inStock: inStock !== undefined ? inStock : true,
      sizes: ensureArray(sizes),
      colors: ensureArray(colors),
      sizeChart: sizeChart || null,
      washCare: washCare || null,
      shippingNote: shippingNote || null,
      designerNote: designerNote || null,
      priceBreakdown: priceBreakdown || null,
      manufactureSpec: manufactureSpec || null,
      dropId: targetDropId || null
    };

    const product = await prisma.product.create({
      data: createPayload
    });

    invalidateProductCache(product.id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id or /api/catalogue/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const body = await sanitizeProductImageFields(req.body);

    const { 
      name, manufactureName, description, price, userPrice, manufacturePrice,
      images, coverPhoto, category, gender, fit, isNew, isBestSeller, stock, inStock,
      sizes, colors, sizeChart, washCare, shippingNote, designerNote, priceBreakdown, manufactureSpec, dropId
    } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const parsedUserPrice = userPrice !== undefined ? safeParseFloat(userPrice) : undefined;
    const parsedPrice = price !== undefined 
      ? (safeParseFloat(price) ?? product.price) 
      : (parsedUserPrice !== undefined ? parsedUserPrice : undefined);

    let finalColors = undefined;
    if (colors !== undefined) {
      finalColors = ensureArray(colors);
    } else if (parsedUserPrice !== undefined && Array.isArray(product.colors) && product.colors.length > 0) {
      finalColors = product.colors.map(c => ({
        ...c,
        userPrice: parsedUserPrice,
        sellingPrice: parsedUserPrice
      }));
    }

    let resolvedCoverPhoto = coverPhoto;
    let resolvedImages = images;

    if (finalColors && Array.isArray(finalColors) && finalColors.length > 0) {
      const colorPhotos = finalColors.flatMap(c => [
        c.frontView,
        c.backView,
        c.modelPhoto1,
        c.modelPhoto2,
        ...(Array.isArray(c.modelPhotos) ? c.modelPhotos : [])
      ].filter(Boolean));

      if (!resolvedCoverPhoto || resolvedCoverPhoto.trim() === '') {
        resolvedCoverPhoto = finalColors[0]?.frontView || finalColors[0]?.modelPhoto1 || product.coverPhoto || '';
      }

      const combined = [
        ...(resolvedCoverPhoto ? [resolvedCoverPhoto] : []),
        ...(Array.isArray(resolvedImages) ? resolvedImages : []),
        ...colorPhotos
      ].filter(Boolean);

      resolvedImages = Array.from(new Set(combined));
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name }),
        ...(manufactureName !== undefined && { manufactureName: manufactureName || null }),
        ...(description !== undefined && { description }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(parsedUserPrice !== undefined && { userPrice: parsedUserPrice }),
        ...(manufacturePrice !== undefined && { manufacturePrice: safeParseFloat(manufacturePrice) }),
        ...(resolvedImages !== undefined && { images: Array.isArray(resolvedImages) ? resolvedImages : [] }),
        ...(resolvedCoverPhoto !== undefined && { coverPhoto: resolvedCoverPhoto }),
        ...(category !== undefined && { category }),
        ...(gender !== undefined && { gender }),
        ...(fit !== undefined && { fit }),
        ...(isNew !== undefined && { isNew }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(stock !== undefined && { stock: safeParseInt(stock) ?? product.stock }),
        ...(inStock !== undefined && { inStock }),
        ...(sizes !== undefined && { sizes: ensureArray(sizes) }),
        ...(finalColors !== undefined && { colors: finalColors }),
        ...(sizeChart !== undefined && { sizeChart }),
        ...(washCare !== undefined && { washCare }),
        ...(shippingNote !== undefined && { shippingNote }),
        ...(designerNote !== undefined && { designerNote }),
        ...(priceBreakdown !== undefined && { priceBreakdown }),
        ...(manufactureSpec !== undefined && { manufactureSpec }),
        ...(dropId !== undefined && { dropId })
      },
    });

    invalidateProductCache(productId);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product', error: error.message });
  }
};

// @desc    Toggle product inStock availability
// @route   PATCH /api/products/:id/stock or /api/catalogue/products/:id/stock
// @access  Private/Admin
export const toggleProductStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { inStock } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        inStock: inStock !== undefined ? inStock : !product.inStock
      }
    });

    invalidateProductCache(productId);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling product stock:', error.message);
    res.status(500).json({ message: 'Server error toggling product stock' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id or /api/catalogue/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    invalidateProductCache(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
