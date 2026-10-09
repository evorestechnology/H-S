import { prisma } from '../lib/prisma.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wishlist: true }
    });
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if product is already in wishlist
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wishlist: { select: { id: true } } }
    });

    const isWishlisted = user.wishlist.some((p) => p.id === productId);

    let updatedUser;
    if (isWishlisted) {
      // Remove from wishlist
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { wishlist: { disconnect: { id: productId } } },
        include: { wishlist: true }
      });
    } else {
      // Add to wishlist
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { wishlist: { connect: { id: productId } } },
        include: { wishlist: true }
      });
    }

    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
