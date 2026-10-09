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

// Helper to sanitize color variant for catalog list responses (exclude heavy Base64 modelPhotos & designFile)
const sanitizeColorForList = (color) => {
  if (!color || typeof color !== 'object') return color;
  return {
    name: color.name || '',
    code: color.code || null,
    userPrice: color.userPrice ?? color.sellingPrice ?? null,
    sellingPrice: color.sellingPrice ?? color.userPrice ?? null,
    manufacturePrice: color.manufacturePrice ?? null,
    baseCost: color.baseCost ?? 0,
    printingCost: color.printingCost ?? 0,
    shippingCost: color.shippingCost ?? 0,
    additionalCost: color.additionalCost ?? 0,
    printType: color.printType || null,
    printPosition: color.printPosition || null,
    printSpecs: color.printSpecs || null,
    frontView: color.frontView || color.image || null,
    backView: color.backView || null,
    mockup: color.mockup || null
  };
};

// @desc    Get all products with filters & pagination
// @route   GET /api/products or /api/catalogue/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
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
        category: true,
        gender: true,
        fit: true,
        isNew: true,
        isBestSeller: true,
        stock: true,
        inStock: true,
        sizes: true,
        colors: true,
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

    // Format lightweight products list: sanitize colors and prune duplicate Base64 arrays
    const formattedProducts = products.map(p => {
      const sanitizedColors = Array.isArray(p.colors)
        ? p.colors.map(sanitizeColorForList)
        : p.colors;

      return {
        ...p,
        images: p.coverPhoto ? [p.coverPhoto] : [],
        colors: sanitizedColors
      };
    });

    if (isPaginated) {
      return res.json({
        success: true,
        count: formattedProducts.length,
        total: total ?? formattedProducts.length,
        page,
        limit,
        totalPages: Math.ceil((total ?? formattedProducts.length) / limit),
        data: formattedProducts,
        products: formattedProducts
      });
    }

    return res.json(formattedProducts);
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
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
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
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

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name }),
        ...(manufactureName !== undefined && { manufactureName: manufactureName || null }),
        ...(description !== undefined && { description }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(parsedUserPrice !== undefined && { userPrice: parsedUserPrice }),
        ...(manufacturePrice !== undefined && { manufacturePrice: safeParseFloat(manufacturePrice) }),
        ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
        ...(coverPhoto !== undefined && { coverPhoto }),
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
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
