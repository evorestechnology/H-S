import { prisma } from '../lib/prisma.js';

// @desc    Get catalog summary metrics
// @route   GET /api/drops/summary or /api/catalogue/summary
// @access  Public
export const getCatalogSummary = async (req, res) => {
  try {
    const summaryPromise = Promise.all([
      prisma.drop.count(),
      prisma.product.count(),
      prisma.product.count({
        where: {
          inStock: true,
          drop: {
            OR: [
              { status: { equals: 'Live', mode: 'insensitive' } },
              { isActive: true }
            ]
          }
        }
      })
    ]);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Summary query timeout')), 5000)
    );

    const [totalDrops, totalProducts, liveProducts] = await Promise.race([summaryPromise, timeoutPromise]);
    const draftProducts = Math.max(0, totalProducts - liveProducts);

    res.json({
      totalDrops,
      totalProducts,
      liveProducts,
      draftProducts
    });
  } catch (error) {
    console.error('Error fetching catalog summary:', error.message);
    res.json({
      totalDrops: dropsCache ? dropsCache.length : 0,
      totalProducts: dropsCache ? dropsCache.reduce((acc, d) => acc + (d.products?.length || 0), 0) : 0,
      liveProducts: 0,
      draftProducts: 0
    });
  }
};

let dropsCache = null;
let dropsCacheTime = 0;
let isFetchingDrops = false;
const CACHE_FRESH_MS = 60000; // 60 seconds fresh

export const invalidateDropsCache = () => {
  dropsCache = null;
  dropsCacheTime = 0;
};

const fetchAndFormatDrops = async () => {
  const queryPromise = prisma.drop.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          manufactureName: true,
          coverPhoto: true,
          price: true,
          userPrice: true,
          manufacturePrice: true,
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
          createdAt: true,
          updatedAt: true
        }
      },
    },
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Drops DB query timeout')), 8000)
  );

  let drops;
  try {
    drops = await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Warning: drops query timed out, returning cached/fallback drops.', err.message);
    return dropsCache || [];
  }

  const formattedDrops = drops.map(d => ({
    ...d,
    dropName: d.dropName || d.title || 'Untitled Drop',
    title: d.title || d.dropName || 'Untitled Drop',
    status: d.status || (d.isActive ? 'Live' : 'Draft'),
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? d.updatedAt.toISOString() : new Date().toISOString(),
    products: (d.products || []).map(p => {
      const sanitizedColors = Array.isArray(p.colors)
        ? p.colors.map(c => {
            if (!c || typeof c !== 'object') return c;
            return {
              name: c.name || '',
              code: c.code || null,
              userPrice: c.userPrice ?? c.sellingPrice ?? null,
              sellingPrice: c.sellingPrice ?? c.userPrice ?? null,
              manufacturePrice: c.manufacturePrice ?? null,
              frontView: c.frontView || c.image || null,
              backView: c.backView || null,
              mockup: c.mockup || null
            };
          })
        : p.colors;

      return {
        ...p,
        images: p.coverPhoto ? [p.coverPhoto] : [],
        colors: sanitizedColors
      };
    })
  }));

  dropsCache = formattedDrops;
  dropsCacheTime = Date.now();
  return formattedDrops;
};

// Background pre-warm on module load
(async () => {
  try {
    await fetchAndFormatDrops();
  } catch (err) {
    console.log('Background drops pre-warm initial attempt:', err.message);
  }
})();

// @desc    Get all drops with products
// @route   GET /api/drops or /api/catalogue/drops
// @access  Public
export const getDrops = async (req, res) => {
  try {
    const now = Date.now();

    // If cache exists, serve instantly (Stale-While-Revalidate)
    if (dropsCache) {
      res.json(dropsCache);

      // Revalidate in background if stale
      if ((now - dropsCacheTime) > CACHE_FRESH_MS && !isFetchingDrops) {
        isFetchingDrops = true;
        fetchAndFormatDrops()
          .catch(err => console.error('Background revalidation error:', err.message))
          .finally(() => { isFetchingDrops = false; });
      }
      return;
    }

    // On cold start if no cache exists yet, wait for fetch
    isFetchingDrops = true;
    const formattedDrops = await fetchAndFormatDrops();
    isFetchingDrops = false;

    res.json(formattedDrops);
  } catch (error) {
    isFetchingDrops = false;
    console.error('Error fetching drops:', error.message);
    res.status(500).json({ message: 'Server error fetching drops' });
  }
};

// @desc    Get single drop
// @route   GET /api/drops/:id or /api/catalogue/drops/:id
// @access  Public
export const getDropById = async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({
      where: { id: req.params.id },
      include: {
        products: true,
      },
    });

    if (drop) {
      res.json({
        ...drop,
        dropName: drop.dropName || drop.title || 'Untitled Drop',
        title: drop.title || drop.dropName || 'Untitled Drop',
        status: drop.status || (drop.isActive ? 'Live' : 'Draft'),
        createdAt: drop.createdAt ? drop.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: drop.updatedAt ? drop.updatedAt.toISOString() : new Date().toISOString()
      });
    } else {
      res.status(404).json({ message: 'Drop not found' });
    }
  } catch (error) {
    console.error('Error fetching drop:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a drop
// @route   POST /api/drops or /api/catalogue/drops
// @access  Private/Admin
export const createDrop = async (req, res) => {
  try {
    const { dropName, title, status, isActive, releaseDate } = req.body;
    const nameToUse = dropName || title || 'New Drop';
    const statusToUse = status || (isActive ? 'Live' : 'Draft');

    const drop = await prisma.drop.create({
      data: {
        dropName: nameToUse,
        title: nameToUse,
        status: statusToUse,
        isActive: statusToUse === 'Live',
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      },
      include: {
        products: true
      }
    });

    invalidateDropsCache();

    res.status(201).json({
      ...drop,
      dropName: drop.dropName || drop.title,
      status: drop.status,
      products: drop.products || []
    });
  } catch (error) {
    console.error('Error creating drop:', error.message);
    res.status(500).json({ message: 'Server error while creating drop' });
  }
};

// @desc    Update a drop
// @route   PUT /api/drops/:id or /api/catalogue/drops/:id
// @access  Private/Admin
export const updateDrop = async (req, res) => {
  try {
    const dropId = req.params.id;
    const { dropName, title, status, isActive, releaseDate } = req.body;

    const existingDrop = await prisma.drop.findUnique({ where: { id: dropId } });

    if (!existingDrop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    const nameToUse = dropName || title || existingDrop.dropName || existingDrop.title;
    const statusToUse = status || (isActive !== undefined ? (isActive ? 'Live' : 'Draft') : existingDrop.status);

    const updatedDrop = await prisma.drop.update({
      where: { id: dropId },
      data: {
        dropName: nameToUse,
        title: nameToUse,
        status: statusToUse,
        isActive: statusToUse === 'Live',
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      },
      include: {
        products: true
      }
    });

    invalidateDropsCache();

    res.json({
      ...updatedDrop,
      dropName: updatedDrop.dropName || updatedDrop.title,
      status: updatedDrop.status,
      products: updatedDrop.products || []
    });
  } catch (error) {
    console.error('Error updating drop:', error.message);
    res.status(500).json({ message: 'Server error while updating drop' });
  }
};

// @desc    Update drop status
// @route   PATCH /api/drops/:id/status or /api/catalogue/drops/:id/status
// @access  Private/Admin
export const updateDropStatus = async (req, res) => {
  try {
    const dropId = req.params.id;
    const { status } = req.body;

    const existingDrop = await prisma.drop.findUnique({ where: { id: dropId } });
    if (!existingDrop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    const updatedDrop = await prisma.drop.update({
      where: { id: dropId },
      data: {
        status: status || existingDrop.status,
        isActive: status === 'Live'
      },
      include: {
        products: true
      }
    });

    invalidateDropsCache();

    res.json(updatedDrop);
  } catch (error) {
    console.error('Error updating drop status:', error.message);
    res.status(500).json({ message: 'Server error while updating drop status' });
  }
};

// @desc    Delete a drop
// @route   DELETE /api/drops/:id or /api/catalogue/drops/:id
// @access  Private/Admin
export const deleteDrop = async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({ where: { id: req.params.id } });

    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    await prisma.drop.delete({ where: { id: req.params.id } });

    invalidateDropsCache();

    res.json({ message: 'Drop removed successfully' });
  } catch (error) {
    console.error('Error deleting drop:', error.message);
    res.status(500).json({ message: 'Server error while deleting drop' });
  }
};
