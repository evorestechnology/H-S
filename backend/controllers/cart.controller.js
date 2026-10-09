import { prisma } from '../lib/prisma.js';

// Selective projection for products in cart items to eliminate huge Base64 payloads
const CART_PRODUCT_SELECT = {
  id: true,
  name: true,
  price: true,
  coverPhoto: true,
  stock: true,
  inStock: true
};

// Helper to get or create a cart for a user with lean product projection
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: CART_PRODUCT_SELECT
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: CART_PRODUCT_SELECT
            }
          }
        }
      }
    });
  }
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and Size are required' });
    }

    // Ensure product exists with lightweight scalar read
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, inStock: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.inStock === false) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    // Lightweight cart check without loading heavy product objects
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        items: {
          select: { id: true, productId: true, size: true, color: true, quantity: true }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        select: { id: true, items: true }
      });
    }

    // Check if item already exists in cart with same size/color
    const existingItem = (cart.items || []).find(
      (item) => item.productId === productId && item.size === size && item.color === color
    );

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size,
          color,
          quantity
        }
      });
    }

    // Return fresh updated cart with lean projection
    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(201).json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Verify item belongs to user's cart without loading full objects
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        cart: { select: { userId: true } }
      }
    });

    if (!cartItem || cartItem.cart?.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.max(1, quantity) }
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        cart: { select: { userId: true } }
      }
    });

    if (!cartItem || cartItem.cart?.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }
    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
