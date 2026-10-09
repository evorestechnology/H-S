import { prisma } from '../lib/prisma.js';
import { getTaxSettingsHelper } from '../controllers/settings.controller.js';

// Returns YYYY-MM-DD in Indian Standard Time (Asia/Kolkata)
const getIstDateString = (date = new Date()) => {
  return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export const mapDbStatusToUi = (dbStatus) => {
  switch (dbStatus) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'SHIPPING':
      return 'Shipping';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELED':
      return 'Cancelled';
    default:
      return dbStatus || 'In Progress';
  }
};

export const mapUiStatusToDb = (uiStatus) => {
  switch ((uiStatus || '').toLowerCase()) {
    case 'in progress':
      return 'IN_PROGRESS';
    case 'shipping':
      return 'SHIPPING';
    case 'delivered':
    case 'completed':
      return 'DELIVERED';
    case 'cancelled':
    case 'canceled':
      return 'CANCELED';
    default:
      return 'IN_PROGRESS';
  }
};

/**
 * Resolves color-specific assets (mockups, DTF/DTG design file, print specs, neck tag)
 * for an ordered product color.
 */
export const resolveColorAssets = (product, orderColor) => {
  const normalizedOrderColor = (orderColor || '').trim().toLowerCase();

  let matchedColor = null;
  if (Array.isArray(product?.colors) && normalizedOrderColor) {
    matchedColor = product.colors.find(c => {
      if (!c) return false;
      if (typeof c === 'string') return c.trim().toLowerCase() === normalizedOrderColor;
      const cName = (c.name || '').trim().toLowerCase();
      const cCode = (c.code || '').trim().toLowerCase();
      return (
        cName === normalizedOrderColor ||
        cCode === normalizedOrderColor ||
        (cName && normalizedOrderColor && (cName.includes(normalizedOrderColor) || normalizedOrderColor.includes(cName)))
      );
    });
  }

  // Determine light/dark garment for neck tag & contrast
  const isLight =
    normalizedOrderColor.includes('white') ||
    normalizedOrderColor.includes('cream') ||
    normalizedOrderColor.includes('light') ||
    normalizedOrderColor.includes('yellow') ||
    normalizedOrderColor.includes('beige') ||
    normalizedOrderColor.includes('sand');

  const neckLogoFileName = isLight ? 'neck logo black.png' : 'neck logo white.png';

  // Front View Image (prioritize color-specific front mockup, then model photo, then images)
  let frontImg = '';
  if (matchedColor && typeof matchedColor === 'object') {
    frontImg =
      matchedColor.frontView ||
      matchedColor.modelPhoto1 ||
      (Array.isArray(matchedColor.modelPhotos) && matchedColor.modelPhotos[0]) ||
      (Array.isArray(matchedColor.images) && matchedColor.images[0]) ||
      matchedColor.image ||
      '';
  }

  // Back View Image (prioritize color-specific back mockup, then model photo 2, then images)
  let backImg = '';
  if (matchedColor && typeof matchedColor === 'object') {
    backImg =
      matchedColor.backView ||
      matchedColor.modelPhoto2 ||
      (Array.isArray(matchedColor.modelPhotos) && matchedColor.modelPhotos[1]) ||
      (Array.isArray(matchedColor.images) && matchedColor.images[1]) ||
      '';
  }

  // Design File (Artwork for print placement, e.g. DTF/DTG file)
  let designFile = '';
  if (matchedColor && typeof matchedColor === 'object') {
    if (typeof matchedColor.designFile === 'string' && matchedColor.designFile) {
      designFile = matchedColor.designFile;
    } else if (Array.isArray(matchedColor.printSpecs) && typeof matchedColor.printSpecs[0]?.designFile === 'string') {
      designFile = matchedColor.printSpecs[0].designFile;
    } else if (matchedColor.printSpecs && typeof matchedColor.printSpecs.designFile === 'string') {
      designFile = matchedColor.printSpecs.designFile;
    }
  }
  if (!designFile && typeof product?.manufactureSpec?.designFile === 'string') {
    designFile = product.manufactureSpec.designFile;
  } else if (!designFile && typeof product?.designFile === 'string') {
    designFile = product.designFile;
  }

  // Print Type (DTF, DTG, Screen Print, etc.)
  let printType = 'DTF';
  if (matchedColor && typeof matchedColor === 'object') {
    if (typeof matchedColor.printType === 'string' && matchedColor.printType) {
      printType = matchedColor.printType;
    } else if (Array.isArray(matchedColor.printSpecs) && typeof matchedColor.printSpecs[0]?.printType === 'string') {
      printType = matchedColor.printSpecs[0].printType;
    } else if (matchedColor.printSpecs && typeof matchedColor.printSpecs.printType === 'string') {
      printType = matchedColor.printSpecs.printType;
    }
  } else if (typeof product?.manufactureSpec?.printType === 'string') {
    printType = product.manufactureSpec.printType;
  } else if (typeof product?.manufactureSpec?.method === 'string') {
    printType = product.manufactureSpec.method;
  }

  // Print Position
  let printPosition = 'Front Center';
  if (matchedColor && typeof matchedColor === 'object') {
    if (typeof matchedColor.printPosition === 'string' && matchedColor.printPosition) {
      printPosition = matchedColor.printPosition;
    } else if (Array.isArray(matchedColor.printSpecs) && typeof matchedColor.printSpecs[0]?.printPosition === 'string') {
      printPosition = matchedColor.printSpecs[0].printPosition;
    } else if (matchedColor.printSpecs && typeof matchedColor.printSpecs.printPosition === 'string') {
      printPosition = matchedColor.printSpecs.printPosition;
    }
  } else if (typeof product?.manufactureSpec?.printPosition === 'string') {
    printPosition = product.manufactureSpec.printPosition;
  }

  // Print Specs (Must always be a string, never an object or array)
  let printSpecs = '';
  if (matchedColor && typeof matchedColor === 'object' && matchedColor.printSpecs) {
    if (typeof matchedColor.printSpecs === 'string') {
      printSpecs = matchedColor.printSpecs;
    } else if (Array.isArray(matchedColor.printSpecs) && matchedColor.printSpecs.length > 0) {
      const first = matchedColor.printSpecs[0];
      if (typeof first === 'string') {
        printSpecs = first;
      } else if (first && typeof first === 'object') {
        printSpecs = `${first.printType || printType} print on ${first.printPosition || printPosition}`;
      }
    } else if (typeof matchedColor.printSpecs === 'object') {
      printSpecs = `${matchedColor.printSpecs.printType || printType} print on ${matchedColor.printSpecs.printPosition || printPosition}`;
    }
  }

  if (!printSpecs) {
    if (typeof product?.manufactureSpec?.printSpecs === 'string') {
      printSpecs = product.manufactureSpec.printSpecs;
    } else if (typeof product?.manufactureSpec?.frontPrintSpec === 'string') {
      printSpecs = product.manufactureSpec.frontPrintSpec;
    } else {
      printSpecs = `${printType} standard artwork print (10.5 in x 14 in)`;
    }
  }

  // Color Hex Code
  let colorCode = (matchedColor && typeof matchedColor === 'object' && matchedColor.code) || null;
  if (!colorCode && normalizedOrderColor) {
    if (normalizedOrderColor.includes('black') || normalizedOrderColor.includes('dark')) colorCode = '#0A0A0C';
    else if (normalizedOrderColor.includes('white') || normalizedOrderColor.includes('snow')) colorCode = '#FFFFFF';
    else if (normalizedOrderColor.includes('gray') || normalizedOrderColor.includes('charcoal')) colorCode = '#475569';
    else if (normalizedOrderColor.includes('navy') || normalizedOrderColor.includes('blue')) colorCode = '#1E3A8A';
    else if (normalizedOrderColor.includes('green') || normalizedOrderColor.includes('olive')) colorCode = '#14532D';
    else if (normalizedOrderColor.includes('red') || normalizedOrderColor.includes('maroon')) colorCode = '#991B1B';
    else if (normalizedOrderColor.includes('yellow') || normalizedOrderColor.includes('gold')) colorCode = '#CA8A04';
    else if (normalizedOrderColor.includes('brown')) colorCode = '#451A03';
    else if (normalizedOrderColor.includes('beige') || normalizedOrderColor.includes('sand')) colorCode = '#D4B996';
  }

  // If frontImg still empty and color matches product's default or no color views exist, fallback to product coverPhoto
  if (!frontImg) {
    frontImg = product?.images?.[0] || product?.coverPhoto || '';
  }
  if (!backImg) {
    backImg = product?.images?.[1] || product?.images?.[0] || product?.coverPhoto || '';
  }

  // Resolve all configured print placements dynamically
  let printPlacements = [];

  const extractValidPlacement = (item, defaultPos, idx) => {
    if (!item) return null;
    const pType = item.printType || item.method || 'DTF';
    const pPos = item.printPosition || defaultPos;
    const dFile = item.designFile || null;
    const mUp = item.mockup || null;
    const hasData = item.printType || item.printPosition || item.designFile || item.mockup;
    if (!hasData) return null;
    return {
      placementIndex: idx + 1,
      name: `Print Placement ${idx + 1}`,
      printType: pType,
      printPosition: pPos,
      designFile: dFile,
      mockup: mUp,
      specs: typeof item.specs === 'string' && item.specs
        ? item.specs
        : (item.frontPrintSpec || item.printSpecs || `${pType} print on ${pPos}`)
    };
  };

  // 1. Check matchedColor.printSpecs array
  if (matchedColor && typeof matchedColor === 'object') {
    if (Array.isArray(matchedColor.printSpecs) && matchedColor.printSpecs.length > 0) {
      matchedColor.printSpecs.forEach((ps, idx) => {
        const placement = extractValidPlacement(ps, idx === 0 ? 'Front Center' : 'Upper Back Center', idx);
        if (placement) {
          printPlacements.push(placement);
        }
      });
    }

    // 2. If no valid placement from printSpecs array, check single fields on matchedColor
    if (printPlacements.length === 0 && (matchedColor.printType || matchedColor.printPosition || matchedColor.designFile || matchedColor.mockup)) {
      const placement = extractValidPlacement(matchedColor, 'Front Center', 0);
      if (placement) {
        printPlacements.push(placement);
      }
    }
  }

  // 3. If still empty, check product.manufactureSpec
  if (printPlacements.length === 0 && product?.manufactureSpec) {
    if (Array.isArray(product.manufactureSpec.printSpecs) && product.manufactureSpec.printSpecs.length > 0) {
      product.manufactureSpec.printSpecs.forEach((ps, idx) => {
        const placement = extractValidPlacement(ps, idx === 0 ? 'Front Center' : 'Upper Back Center', idx);
        if (placement) {
          printPlacements.push(placement);
        }
      });
    } else if (product.manufactureSpec.printType || product.manufactureSpec.printPosition || product.manufactureSpec.designFile || product.manufactureSpec.mockup) {
      const placement = extractValidPlacement(product.manufactureSpec, 'Front Center', 0);
      if (placement) {
        printPlacements.push(placement);
      }
    }
  }

  // 4. If still empty, check product root fields (designFile or printType)
  if (printPlacements.length === 0 && (product?.designFile || product?.printType)) {
    printPlacements.push({
      placementIndex: 1,
      name: 'Print Placement 1',
      printType: product.printType || 'DTF',
      printPosition: product.printPosition || 'Front Center',
      designFile: product.designFile || null,
      mockup: frontImg || null,
      specs: `${product.printType || 'DTF'} print on ${product.printPosition || 'Front Center'}`
    });
  }

  // 5. If STILL empty, single fallback placement based on resolved printType/designFile
  if (printPlacements.length === 0) {
    printPlacements.push({
      placementIndex: 1,
      name: 'Print Placement 1',
      printType: printType || 'DTF',
      printPosition: printPosition || 'Front Center',
      designFile: designFile || null,
      mockup: frontImg || null,
      specs: printSpecs || `${printType} standard artwork print (10.5 in x 14 in)`
    });
  }

  // Synchronize primary placement scalar properties for backwards compatibility
  if (printPlacements.length > 0) {
    if (!designFile && printPlacements[0].designFile) {
      designFile = printPlacements[0].designFile;
    }
    if (printPlacements[0].printType) {
      printType = printPlacements[0].printType;
    }
    if (printPlacements[0].printPosition) {
      printPosition = printPlacements[0].printPosition;
    }
    if (printPlacements[0].specs) {
      printSpecs = printPlacements[0].specs;
    }
  }

  return {
    frontImg,
    backImg,
    designFile,
    printType,
    printPosition,
    printSpecs,
    printPlacements,
    colorCode,
    isLight,
    neckLogoFileName,
    matchedColor
  };
};

export const formatOrderForUi = (order, isDetail = false) => {
  const firstItem = order.items?.[0] || {};
  const product = firstItem.product || {};
  const user = order.user || {};
  const manufacturer = order.manufacturer || null;

  // Parse shippingAddress if it is a JSON string
  let formattedAddress = order.shippingAddress || 'Customer Address';
  let recipientName = user.fullName || user.email || '';
  let recipientPhone = user.mobile || '';
  let recipientCountry = user.country || '';

  if (typeof order.shippingAddress === 'string') {
    const trimmed = order.shippingAddress.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.name && parsed.name !== 'User') {
            recipientName = parsed.name;
          }
          if (parsed.phone) {
            recipientPhone = parsed.phone;
          }
          if (parsed.country) {
            recipientCountry = parsed.country;
          }
          const parts = [
            parsed.street,
            parsed.city,
            parsed.state,
            parsed.zipCode,
            parsed.country
          ].filter(Boolean);
          if (parts.length > 0) {
            formattedAddress = parts.join(', ');
          }
        }
      } catch (e) {
        // Fallback to raw string
      }
    }
  }

  // Resolve color-specific assets (mockups, DTF/DTG design file, print specs, neck tag)
  const colorAssets = resolveColorAssets(product, firstItem.color);
  let frontImg = colorAssets.frontImg;
  let backImg = colorAssets.backImg;

  if (!frontImg) {
    frontImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  }
  if (!backImg) {
    backImg = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80';
  }

  // Resolve color/product-specific catalog manufacturing price
  const matchedColor = colorAssets.matchedColor;
  const colorMfgPrice = (matchedColor && typeof matchedColor.manufacturePrice === 'number' && matchedColor.manufacturePrice > 0)
    ? matchedColor.manufacturePrice
    : null;
  const productMfgPrice = (typeof product.manufacturePrice === 'number' && product.manufacturePrice > 0)
    ? product.manufacturePrice
    : null;
  const catalogMfgPrice = colorMfgPrice || productMfgPrice;

  // Authoritative coupon resolution with mathematical fallback
  let resolvedCouponCode = order.couponCode || null;
  let resolvedCouponDiscount = typeof order.couponDiscount === 'number' ? order.couponDiscount : 0;
  let resolvedCouponApplied = Boolean(order.couponApplied || resolvedCouponCode || (resolvedCouponDiscount > 0));

  if (!resolvedCouponApplied || resolvedCouponDiscount === 0) {
    const rawItemsSum = Array.isArray(order.items)
      ? order.items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0)
      : 0;
    const tax = Number(order.taxPrice) || 0;
    const ship = Number(order.shippingPrice) || 0;
    const expectedGross = rawItemsSum + tax + ship;
    const netTotal = Number(order.totalPrice) || 0;
    const impliedDiscount = expectedGross - netTotal;

    if (rawItemsSum > 0 && impliedDiscount >= 1) {
      resolvedCouponDiscount = Number(impliedDiscount.toFixed(2));
      resolvedCouponApplied = true;
      if (!resolvedCouponCode) {
        resolvedCouponCode = 'Applied';
      }
    }
  }

  // Format all individual line items with full manufacturing details
  const rawOrderItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order.orderItems) && order.orderItems.length > 0 ? order.orderItems : (firstItem.name ? [firstItem] : []));

  const formattedItems = rawOrderItems.map((it, idx) => {
    const itProduct = it.product || {};
    const itColorAssets = resolveColorAssets(itProduct, it.color);
    let itFront = itColorAssets.frontImg || itProduct.coverPhoto || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
    let itBack = itColorAssets.backImg || itFront;
    const itMatched = itColorAssets.matchedColor;

    // Resolve color-specific manufacturing price
    const itColorMfgPrice = (itMatched && typeof itMatched.manufacturePrice === 'number' && itMatched.manufacturePrice > 0)
      ? itMatched.manufacturePrice
      : null;
    const itProductMfgPrice = (typeof itProduct.manufacturePrice === 'number' && itProduct.manufacturePrice > 0)
      ? itProduct.manufacturePrice
      : null;
    const itTargetMfgPrice = itColorMfgPrice || itProductMfgPrice;

    // Resolve component breakdown costs
    const itPrintCost = (itMatched && typeof itMatched.printingCost === 'number')
      ? itMatched.printingCost
      : (itMatched ? 0 : (itProduct.priceBreakdown?.printingCost || 0));

    const itShipCost = (itMatched && typeof itMatched.shippingCost === 'number')
      ? itMatched.shippingCost
      : (itMatched ? 0 : (itProduct.priceBreakdown?.shippingCost || 0));

    const itOtherCost = (itMatched && typeof itMatched.additionalCost === 'number')
      ? itMatched.additionalCost
      : (itMatched ? 0 : (itProduct.priceBreakdown?.additionalCost || 0));

    const itExtraCostsTotal = itPrintCost + itShipCost + itOtherCost;

    let itBaseCost = 0;
    if (itMatched && typeof itMatched.baseCost === 'number') {
      itBaseCost = itMatched.baseCost;
    } else if (itTargetMfgPrice !== null) {
      itBaseCost = Math.max(0, itTargetMfgPrice - itExtraCostsTotal);
    } else if (itProduct.priceBreakdown && typeof itProduct.priceBreakdown.baseCost === 'number') {
      itBaseCost = itProduct.priceBreakdown.baseCost;
    } else {
      itBaseCost = 0;
    }

    // Ensure mathematical consistency: if itTargetMfgPrice is defined, itBaseCost + itExtraCostsTotal must equal itTargetMfgPrice
    if (itTargetMfgPrice !== null && (itBaseCost + itExtraCostsTotal !== itTargetMfgPrice)) {
      itBaseCost = Math.max(0, itTargetMfgPrice - itExtraCostsTotal);
    }

    const itTotalBreakdown = Number((itBaseCost + itPrintCost + itShipCost + itOtherCost).toFixed(2));

    // In list mode, only keep designFile if it is an HTTP URL or requested with isDetail
    const resolvedItemDesignFile = (typeof itColorAssets.designFile === 'string' && (isDetail || itColorAssets.designFile.startsWith('http')))
      ? itColorAssets.designFile
      : null;

    return {
      id: it.id || `item-${idx}`,
      productId: it.productId || itProduct.id || null,
      name: it.name || itProduct.name || 'Athletic Product',
      mfgItemName: itProduct.manufactureName || it.name || itProduct.name || 'MFG Athletic Product',
      size: it.size || 'L',
      color: it.color || 'Standard',
      quantity: it.quantity || 1,
      price: typeof it.price === 'number' ? it.price : (Number(itProduct.price) || 0),
      unitMfgPrice: itTotalBreakdown,
      itemMfgTotal: Number((itTotalBreakdown * (it.quantity || 1)).toFixed(2)),
      costBreakdown: {
        baseCost: itBaseCost,
        printingCost: itPrintCost,
        shippingCost: itShipCost,
        otherCost: itOtherCost,
        total: itTotalBreakdown
      },
      image: itFront,
      images: itFront ? [itFront] : (itProduct.coverPhoto ? [itProduct.coverPhoto] : []),
      productDetails: {
        mfgProductName: itProduct.manufactureName || itProduct.name || it.name || 'MFG Athletic Product',
        frontViewUrl: itFront,
        backViewUrl: itBack,
        neckLogoUrl: itColorAssets.isLight ? '/assests/neckband logo/neck logo black.png' : '/assests/neckband logo/neck logo white.png',
        designFile: resolvedItemDesignFile,
        printType: itColorAssets.printType,
        printPosition: itColorAssets.printPosition,
        printSpecs: itColorAssets.printSpecs,
        printPlacements: itColorAssets.printPlacements || [],
        colorCode: itColorAssets.colorCode,
        colorName: it.color || 'Standard',
        mfgBasePrice: itBaseCost,
        baseCost: itBaseCost,
        printingCost: itPrintCost,
        shippingCost: itShipCost,
        otherCost: itOtherCost,
        costBreakdown: {
          baseCost: itBaseCost,
          printingCost: itPrintCost,
          shippingCost: itShipCost,
          otherCost: itOtherCost,
          total: itTotalBreakdown
        },
        printingDetails: {
          method: itColorAssets.printType ? `${itColorAssets.printType} Printing` : 'Direct-to-Film (DTF) Heat Transfer',
          printType: itColorAssets.printType,
          printPosition: itColorAssets.printPosition,
          designFile: resolvedItemDesignFile,
          frontPrintSpec: itColorAssets.printSpecs,
          backPrintSpec: (itColorAssets.printPlacements && itColorAssets.printPlacements.length > 1)
            ? itColorAssets.printPlacements[1].specs
            : (itProduct.manufactureSpec?.backPrintSpec || null),
          neckLogoSpec: `Inner collar neck label 2.5 in x 1.0 in (${itColorAssets.isLight ? 'Black Font' : 'White Font'})`,
          neckLogoFile: itColorAssets.neckLogoFileName,
          fabricGSM: itProduct.manufactureSpec?.fabricGSM || '240 GSM 100% Ring-Spun Cotton',
          pantoneCodes: itColorAssets.colorCode ? `${itColorAssets.colorCode} / ${it.color || 'Standard'}` : '#1A1A1A / Standard'
        }
      },
      product: {
        id: itProduct.id || null,
        name: itProduct.name || it.name || 'Product',
        price: itProduct.price || it.price || 0,
        manufacturePrice: itProduct.manufacturePrice || null,
        manufactureName: itProduct.manufactureName || null,
        coverPhoto: itProduct.coverPhoto || itFront || null
      }
    };
  });

  const combinedItemName = formattedItems.length > 0
    ? formattedItems.map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`).join(', ')
    : (firstItem.name || 'Athletic Product');

  const combinedMfgItemName = formattedItems.length > 0
    ? formattedItems.map(i => i.mfgItemName).join(', ')
    : (product.manufactureName || firstItem.name || 'MFG Athletic Product');

  const combinedSize = formattedItems.length > 0
    ? formattedItems.map(i => i.size).join(', ')
    : (firstItem.size || 'L');

  const combinedColor = formattedItems.length > 0
    ? formattedItems.map(i => i.color).join(', ')
    : (firstItem.color || 'Standard');

  const resolvedTaxPrice = Number(order.taxPrice) || 0;
  const resolvedShippingPrice = Number(order.shippingPrice) || 0;

  // Authoritative total manufacturing payment calculation from items
  const computedItemsMfgTotal = formattedItems.reduce((sum, item) => {
    const itemMfg = item.productDetails?.costBreakdown?.total ?? item.productDetails?.baseCost ?? 0;
    return sum + (itemMfg * (item.quantity || 1));
  }, 0);

  let resolvedMfgPayment = 0;
  if (order.priceAdjustmentStatus === 'Approved') {
    resolvedMfgPayment = order.mfgPayment;
  } else if (computedItemsMfgTotal > 0) {
    resolvedMfgPayment = computedItemsMfgTotal;
  } else if (typeof order.mfgPayment === 'number' && order.mfgPayment > 0) {
    resolvedMfgPayment = order.mfgPayment;
  } else {
    resolvedMfgPayment = catalogMfgPrice || (typeof order.mfgPayment === 'number' ? order.mfgPayment : 0);
  }

  // Top-level breakdown fallback
  const baseProductCost = formattedItems[0]?.productDetails?.baseCost ?? resolvedMfgPayment;
  const printCost = formattedItems[0]?.productDetails?.printingCost ?? 0;
  const shipCost = formattedItems[0]?.productDetails?.shippingCost ?? 0;
  const otherCost = formattedItems[0]?.productDetails?.otherCost ?? 0;

  const resolvedTopDesignFile = (typeof colorAssets.designFile === 'string' && (isDetail || colorAssets.designFile.startsWith('http')))
    ? colorAssets.designFile
    : null;

  return {
    id: order.id,
    createdAt: order.createdAt || null,
    orderedDate: order.createdAt
      ? getIstDateString(order.createdAt)
      : getIstDateString(),
    itemName: combinedItemName,
    mfgItemName: combinedMfgItemName,
    size: combinedSize,
    color: combinedColor,
    orderedBy: user.id || order.userId || '',
    fullName: recipientName || user.fullName || user.email || 'Customer',
    phone: recipientPhone || user.mobile || 'N/A',
    country: recipientCountry || user.country || 'India',
    shippingAddress: formattedAddress,
    amountPaid: order.totalPrice || 0,
    totalPrice: order.totalPrice || 0,
    taxPrice: resolvedTaxPrice,
    gstCollected: resolvedTaxPrice,
    shippingPrice: resolvedShippingPrice,
    mfgPayment: resolvedMfgPayment,
    manufacturerId: order.manufacturerId || null,
    manufacturerName: manufacturer ? (manufacturer.companyName || manufacturer.fullName) : null,
    shipperName: order.shipperName || 'None',
    trackingId: order.trackingNumber || 'None',
    trackingLink: order.trackingLink || 'None',
    status: order.status === 'CANCELED' ? 'Cancelled' : (order.cancelRequested ? 'Cancel Requested' : mapDbStatusToUi(order.status)),
    previousStatus: mapDbStatusToUi(order.status),
    cancelReason: order.cancelReason || '',
    cancelRequested: order.status === 'CANCELED' ? false : Boolean(order.cancelRequested),
    cancelledByRole: order.cancelledByRole || (order.status === 'CANCELED' ? 'ADMIN' : null),
    cancelledByUserId: order.cancelledByUserId || null,
    cancelledAt: order.cancelledAt ? new Date(order.cancelledAt).toISOString() : null,
    priceAdjustmentStatus: order.priceAdjustmentStatus || 'None',
    priceAdjustmentAmount: order.priceAdjustmentAmount || 0,
    priceAdjustmentReason: order.priceAdjustmentReason || '',
    mfgPaymentStatus: order.status === 'CANCELED' ? 'Excluded' : (order.mfgPaymentStatus || 'Unpaid'),
    mfgPaidDate: order.mfgPaidDate || null,
    completedDate: order.completedDate || null,
    couponCode: resolvedCouponCode,
    couponDiscount: resolvedCouponDiscount,
    couponApplied: resolvedCouponApplied,
    items: formattedItems,
    productDetails: (formattedItems[0]?.productDetails) || {
      mfgProductName: product.manufactureName || product.name || firstItem.name || 'MFG Athletic Item',
      frontViewUrl: frontImg,
      backViewUrl: backImg,
      neckLogoUrl: colorAssets.isLight ? '/assests/neckband logo/neck logo black.png' : '/assests/neckband logo/neck logo white.png',
      designFile: resolvedTopDesignFile,
      printType: colorAssets.printType,
      printPosition: colorAssets.printPosition,
      printSpecs: colorAssets.printSpecs,
      printPlacements: colorAssets.printPlacements || [],
      colorCode: colorAssets.colorCode,
      colorName: firstItem.color || 'Standard',
      mfgBasePrice: baseProductCost,
      baseCost: baseProductCost,
      printingCost: printCost,
      shippingCost: shipCost,
      otherCost: otherCost,
      costBreakdown: {
        baseCost: baseProductCost,
        printingCost: printCost,
        shippingCost: shipCost,
        otherCost: otherCost,
        total: Number((baseProductCost + printCost + shipCost + otherCost).toFixed(2))
      },
      printingDetails: {
        method: colorAssets.printType ? `${colorAssets.printType} Printing` : 'Direct-to-Film (DTF) Heat Transfer',
        printType: colorAssets.printType,
        printPosition: colorAssets.printPosition,
        designFile: resolvedTopDesignFile,
        frontPrintSpec: colorAssets.printSpecs,
        backPrintSpec: (colorAssets.printPlacements && colorAssets.printPlacements.length > 1)
          ? colorAssets.printPlacements[1].specs
          : (product.manufactureSpec?.backPrintSpec || null),
        neckLogoSpec: `Inner collar neck label 2.5 in x 1.0 in (${colorAssets.isLight ? 'Black Font' : 'White Font'})`,
        neckLogoFile: colorAssets.neckLogoFileName,
        fabricGSM: product.manufactureSpec?.fabricGSM || '240 GSM 100% Ring-Spun Cotton',
        pantoneCodes: colorAssets.colorCode ? `${colorAssets.colorCode} / ${firstItem.color || 'Standard'}` : '#1A1A1A / Standard'
      }
    }
  };
};

/**
 * Creates a direct order submitted by Admin or Staff.
 * Automatically links or creates an underlying Product and OrderItem.
 */
export const createDirectOrder = async (orderData, creatorUserId) => {
  const {
    itemName,
    mfgItemName,
    size = 'L',
    color = 'Black',
    orderedBy,
    fullName,
    phone,
    country = 'India',
    shippingAddress,
    amountPaid = 100,
    mfgPayment = 0,
    status = 'In Progress',
    manufacturerId = null
  } = orderData;

  const validAmountPaid = Number(amountPaid) || 0;
  const trimmedItemName = (itemName || 'Custom Product').trim();
  const trimmedMfgItemName = (mfgItemName || `MFG ${trimmedItemName}`).trim();

  return await prisma.$transaction(async (tx) => {
    // 1. Resolve or create associated Product
    let product = await tx.product.findFirst({
      where: {
        name: { equals: trimmedItemName, mode: 'insensitive' }
      }
    });

    const parsedMfgPayment = Number(mfgPayment);
    let validMfgPayment = (parsedMfgPayment > 0) ? parsedMfgPayment : 0;
    if (product) {
      const colorAssets = resolveColorAssets(product, color);
      const matched = colorAssets.matchedColor;
      const colorMfgPrice = (matched && typeof matched.manufacturePrice === 'number' && matched.manufacturePrice > 0)
        ? matched.manufacturePrice
        : null;
      const colorBreakdownTotal = (matched && (typeof matched.baseCost === 'number' || typeof matched.printingCost === 'number'))
        ? ((Number(matched.baseCost) || 0) + (Number(matched.printingCost) || 0) + (Number(matched.shippingCost) || 0) + (Number(matched.additionalCost) || 0))
        : 0;
      const targetColorMfg = colorMfgPrice || (colorBreakdownTotal > 0 ? colorBreakdownTotal : null);

      if (!validMfgPayment || (targetColorMfg && validMfgPayment === product.manufacturePrice && targetColorMfg !== product.manufacturePrice)) {
        if (targetColorMfg) {
          validMfgPayment = targetColorMfg;
        } else if (typeof product.manufacturePrice === 'number' && product.manufacturePrice > 0) {
          validMfgPayment = product.manufacturePrice;
        }
      }
    }
    if (!validMfgPayment) {
      validMfgPayment = (typeof product?.manufacturePrice === 'number' && product.manufacturePrice > 0)
        ? product.manufacturePrice
        : 0;
    }

    if (!product) {
      product = await tx.product.create({
        data: {
          name: trimmedItemName,
          manufactureName: trimmedMfgItemName,
          price: validAmountPaid,
          manufacturePrice: validMfgPayment,
          category: 'Apparel',
          gender: 'Unisex',
          stock: 99,
          inStock: true,
          manufacturerId: manufacturerId || null
        }
      });
    } else {
      // Decrement stock if available
      const newStock = Math.max(0, (product.stock || 1) - 1);
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: newStock,
          inStock: newStock > 0
        }
      });
    }

    // 2. Resolve Customer User ID
    let targetUserId = null;
    if (orderedBy && orderedBy.trim()) {
      const trimmedOrderedBy = orderedBy.trim();
      const existingUserById = await tx.user.findUnique({
        where: { id: trimmedOrderedBy }
      });
      if (existingUserById) {
        targetUserId = existingUserById.id;
      } else {
        const existingUserByName = await tx.user.findFirst({
          where: {
            OR: [
              { email: { equals: trimmedOrderedBy, mode: 'insensitive' } },
              { fullName: { equals: trimmedOrderedBy, mode: 'insensitive' } }
            ]
          }
        });
        if (existingUserByName) {
          targetUserId = existingUserByName.id;
        }
      }
    }

    // If still not matched, check if customer fullName or phone matches
    if (!targetUserId && fullName && fullName.trim()) {
      const trimmedName = fullName.trim();
      const matchedUser = await tx.user.findFirst({
        where: {
          OR: [
            { fullName: { equals: trimmedName, mode: 'insensitive' } },
            { email: { equals: trimmedName, mode: 'insensitive' } }
          ]
        }
      });
      if (matchedUser) {
        targetUserId = matchedUser.id;
      }
    }

    if (!targetUserId && phone && phone.trim()) {
      const matchedByPhone = await tx.user.findFirst({
        where: {
          mobile: { contains: phone.trim() }
        }
      });
      if (matchedByPhone) {
        targetUserId = matchedByPhone.id;
      }
    }

    // If still not resolved, assign to a customer with role 'USER' rather than Admin
    if (!targetUserId) {
      const customerUser = await tx.user.findFirst({
        where: { role: 'USER' }
      });
      if (customerUser) {
        targetUserId = customerUser.id;
      } else {
        targetUserId = creatorUserId;
      }
    }

    // 3. Resolve Manufacturer ID if provided
    let validManufacturerId = null;
    if (manufacturerId && manufacturerId.trim() && manufacturerId !== 'all' && manufacturerId !== 'unassigned') {
      const mfgUser = await tx.user.findFirst({
        where: {
          id: manufacturerId.trim(),
          role: 'MANUFACTURER'
        }
      });
      if (mfgUser) {
        validManufacturerId = mfgUser.id;
      }
    }

    // 4. Create Order and OrderItem
    const dbStatus = mapUiStatusToDb(status);
    const formattedShippingAddress = typeof shippingAddress === 'string'
      ? shippingAddress
      : JSON.stringify(shippingAddress || {});

    const dateStr = getIstDateString().slice(2).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const customOrderId = `HS-${dateStr}-${randomHex}`;

    const order = await tx.order.create({
      data: {
        id: customOrderId,
        userId: targetUserId,
        manufacturerId: validManufacturerId,
        shippingAddress: formattedShippingAddress,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: validAmountPaid,
        mfgPayment: validMfgPayment,
        status: dbStatus,
        paymentStatus: 'SUCCESSFUL',
        mfgPaymentStatus: 'Unpaid',
        couponCode: orderData.couponCode || null,
        couponDiscount: Number(orderData.couponDiscount) || 0,
        couponApplied: Boolean(orderData.couponCode || (orderData.couponDiscount && Number(orderData.couponDiscount) > 0)),
        items: {
          create: [
            {
              productId: product.id,
              name: trimmedItemName,
              size: size || 'L',
              color: color || 'Black',
              quantity: 1,
              price: validAmountPaid
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            country: true
          }
        },
        manufacturer: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    if (orderData.couponCode || orderData.couponDiscount) {
      await tx.$executeRawUnsafe(
        `UPDATE "Order" SET "couponCode" = $1, "couponDiscount" = $2, "couponApplied" = $3 WHERE "id" = $4`,
        orderData.couponCode || null,
        Number(orderData.couponDiscount) || 0,
        Boolean(orderData.couponCode || (orderData.couponDiscount && Number(orderData.couponDiscount) > 0)),
        customOrderId
      );
      order.couponCode = orderData.couponCode || null;
      order.couponDiscount = Number(orderData.couponDiscount) || 0;
      order.couponApplied = Boolean(orderData.couponCode || (orderData.couponDiscount && Number(orderData.couponDiscount) > 0));
    }

    return formatOrderForUi(order);
  });
};

/**
 * Authoritative shipping calculation helper based on Category weight rules and destination.
 */
export const calculateAuthoritativeShipping = async (items, country = 'India', client = prisma) => {
  const isDomestic = (country || 'India').trim().toLowerCase() === 'india';
  if (isDomestic) return 0;

  const shipSettingRow = await client.setting.findUnique({ where: { key: 'shipping' } });
  const shipConfig = shipSettingRow?.value || { blockStepKg: 5, ratePerBlock: 5000 };
  const blockStepKg = Number(shipConfig.blockStepKg) || 5;
  const ratePerBlock = Number(shipConfig.ratePerBlock) || 5000;

  const categories = await client.category.findMany();
  const weightMap = {};
  categories.forEach(c => {
    weightMap[c.name.toLowerCase()] = c.weightPerPiece;
  });

  let totalWeightKg = 0;
  for (const it of items) {
    const catKey = (it.category || '').toLowerCase();
    const unitWeight = weightMap[catKey] || 0.500;
    totalWeightKg += unitWeight * (it.quantity || 1);
  }

  if (totalWeightKg <= 0) return 0;
  const blocks = Math.ceil(totalWeightKg / blockStepKg);
  return blocks * ratePerBlock;
};

/**
 * Creates an order from consumer checkout (shopping cart) inside an atomic database transaction.
 * Server-authoritative: validates inventory, decrements stock, calculates coupon, tax, shipping, and total.
 */
export const createCheckoutOrder = async (orderItems, shippingAddress, paymentMethod, userId, couponCode = null) => {
  return await prisma.$transaction(async (tx) => {
    let itemsPrice = 0;
    let totalMfgPayment = 0;
    const itemsToCreate = [];
    const itemsForShipping = [];

    // Batch load all ordered products to eliminate N+1 queries
    const productIds = Array.from(new Set(orderItems.map(it => it.productId).filter(Boolean)));
    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    // Aggregate requested quantities per product to validate and decrement stock atomically
    const requestedQtyPerProduct = new Map();
    for (const item of orderItems) {
      const qty = Number(item.quantity) || 1;
      requestedQtyPerProduct.set(item.productId, (requestedQtyPerProduct.get(item.productId) || 0) + qty);
    }

    for (const item of orderItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.name || item.productId} not found`);
      }

      // Check stock sufficiency: only block if inStock is explicitly false, or if positive stock inventory is less than requested
      const totalRequested = requestedQtyPerProduct.get(item.productId) || item.quantity;
      if (product.inStock === false || (typeof product.stock === 'number' && product.stock > 0 && product.stock < totalRequested)) {
        throw new Error(`"${product.name}" is currently out of stock.`);
      }

      const unitPrice = product.price;
      itemsPrice += unitPrice * item.quantity;

      const colorAssets = resolveColorAssets(product, item.color);
      const matched = colorAssets.matchedColor;
      const colorMfgPrice = (matched && typeof matched.manufacturePrice === 'number' && matched.manufacturePrice > 0)
        ? matched.manufacturePrice
        : null;
      const colorBreakdownTotal = (matched && (typeof matched.baseCost === 'number' || typeof matched.printingCost === 'number'))
        ? ((Number(matched.baseCost) || 0) + (Number(matched.printingCost) || 0) + (Number(matched.shippingCost) || 0) + (Number(matched.additionalCost) || 0))
        : 0;
      const targetColorMfg = colorMfgPrice || (colorBreakdownTotal > 0 ? colorBreakdownTotal : null);

      const unitMfgPrice = targetColorMfg
        || ((typeof product.manufacturePrice === 'number' && product.manufacturePrice > 0)
          ? product.manufacturePrice
          : 0);
      totalMfgPayment += unitMfgPrice * item.quantity;

      itemsToCreate.push({
        productId: product.id,
        name: product.name,
        size: item.size || 'M',
        color: item.color || null,
        quantity: item.quantity,
        price: unitPrice
      });

      itemsForShipping.push({
        category: product.category,
        quantity: item.quantity
      });
    }

    // Atomically decrement stock for products with explicit tracked positive inventory inside transaction
    for (const [productId, qtyToDecrement] of requestedQtyPerProduct.entries()) {
      const prod = productMap.get(productId);
      if (prod && typeof prod.stock === 'number' && prod.stock > 0) {
        const newStock = Math.max(0, prod.stock - qtyToDecrement);
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: newStock,
            inStock: newStock > 0
          }
        });
      }
    }

    // Authoritative Coupon Validation
    let couponDiscount = 0;
    let validCouponCode = null;
    let isCouponApplied = false;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await tx.coupon.findUnique({ where: { code: cleanCode } });
      if (coupon && coupon.status === 'Active') {
        const notExpired = !coupon.expiryDate || new Date(coupon.expiryDate).setHours(23, 59, 59, 999) >= new Date().getTime();
        const minSpendMet = coupon.minSpend <= itemsPrice;
        const limitNotReached = coupon.usageLimit === 0 || coupon.usageCount < coupon.usageLimit;

        if (notExpired && minSpendMet && limitNotReached) {
          if (coupon.discountType === 'Percentage') {
            couponDiscount = (itemsPrice * coupon.discountValue) / 100;
          } else {
            couponDiscount = Math.min(itemsPrice, coupon.discountValue);
          }
          validCouponCode = coupon.code;
          isCouponApplied = true;
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } }
          });
        }
      }
    }

    // Determine country from shippingAddress
    let destinationCountry = 'India';
    if (typeof shippingAddress === 'object' && shippingAddress?.country) {
      destinationCountry = shippingAddress.country;
    } else if (typeof shippingAddress === 'string') {
      try {
        const parsed = JSON.parse(shippingAddress);
        if (parsed.country) destinationCountry = parsed.country;
      } catch (e) {
        // Fallback
      }
    }

    // Authoritative Shipping Calculation
    const shippingPrice = await calculateAuthoritativeShipping(itemsForShipping, destinationCountry, tx);

    // Authoritative Tax Calculation
    const taxSettings = await getTaxSettingsHelper(tx);
    let taxPrice = 0;
    if (taxSettings.enableGst) {
      const isIndian = destinationCountry.trim().toLowerCase() === 'india';
      if (isIndian) {
        taxPrice = itemsPrice > taxSettings.indianThreshold
          ? itemsPrice * (taxSettings.indianHighRate / 100)
          : itemsPrice * (taxSettings.indianLowRate / 100);
      } else {
        taxPrice = itemsPrice * (taxSettings.nonIndianRate / 100);
      }
    }

    const totalPrice = Number((itemsPrice - couponDiscount + taxPrice + shippingPrice).toFixed(2));
    const mfgPayment = totalMfgPayment;
    const paymentStatus = (paymentMethod === 'COD' || paymentMethod === 'CASHFREE') ? 'PENDING' : 'SUCCESSFUL';

    const dateStr = getIstDateString().slice(2).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const customOrderId = `HS-${dateStr}-${randomHex}`;

    const order = await tx.order.create({
      data: {
        id: customOrderId,
        userId,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        taxPrice: Number(taxPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        totalPrice,
        mfgPayment,
        paymentStatus,
        status: 'IN_PROGRESS',
        items: {
          create: itemsToCreate
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            country: true
          }
        },
        manufacturer: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    if (isCouponApplied && validCouponCode) {
      await tx.$executeRawUnsafe(
        `UPDATE "Order" SET "couponCode" = $1, "couponDiscount" = $2, "couponApplied" = $3 WHERE "id" = $4`,
        validCouponCode,
        Number(couponDiscount.toFixed(2)),
        true,
        customOrderId
      );
      order.couponCode = validCouponCode;
      order.couponDiscount = Number(couponDiscount.toFixed(2));
      order.couponApplied = true;
    }

    return formatOrderForUi(order);
  }, { maxWait: 10000, timeout: 20000 });
};

/**
 * Retrieves orders filtered by role (ADMIN sees all; MANUFACTURER sees assigned + unassigned).
 * Supports optional pagination (?page=1&limit=20) with selective Prisma projections.
 */
export const getOrdersForUser = async (user, options = {}) => {
  const userRole = (user?.role || '').toUpperCase();
  const whereClause = {};

  if (userRole === 'MANUFACTURER' && user?.id) {
    whereClause.OR = [
      { manufacturerId: user.id },
      { manufacturerId: null }
    ];
  } else if (userRole === 'USER' && user?.id) {
    whereClause.userId = user.id;
  }

  const hasPagination = options.page !== undefined || options.limit !== undefined;
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const queryArgs = {
    where: whereClause,
    include: {
      items: {
        select: {
          id: true,
          orderId: true,
          productId: true,
          name: true,
          size: true,
          color: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              manufactureName: true,
              price: true,
              manufacturePrice: true,
              coverPhoto: true,
              category: true,
              inStock: true,
              stock: true,
              priceBreakdown: true,
              manufactureSpec: true,
              colors: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  };

  if (hasPagination) {
    queryArgs.skip = skip;
    queryArgs.take = limit;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany(queryArgs),
    hasPagination ? prisma.order.count({ where: whereClause }) : Promise.resolve(null)
  ]);

  const formattedOrders = orders.map(o => formatOrderForUi(o, false));

  if (hasPagination) {
    return {
      orders: formattedOrders,
      count: formattedOrders.length,
      total: total ?? formattedOrders.length,
      page,
      limit,
      totalPages: Math.ceil((total ?? formattedOrders.length) / limit)
    };
  }

  return formattedOrders;
};

/**
 * Updates order to shipping status with tracking information.
 */
export const updateShipping = async (id, shippingData) => {
  const { shipperName, trackingId, trackingLink, status } = shippingData;

  const currentOrder = await prisma.order.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!currentOrder) {
    throw new Error('Order not found');
  }

  let targetStatus = currentOrder.status;
  if (status) {
    targetStatus = mapUiStatusToDb(status);
  } else if (currentOrder.status === 'IN_PROGRESS') {
    targetStatus = 'SHIPPING';
  }

  const cleanShipper = shipperName && shipperName !== 'None' ? shipperName.trim() : null;
  const cleanTrackingId = trackingId && trackingId !== 'None' ? trackingId.trim() : null;
  const cleanTrackingLink = trackingLink && trackingLink !== 'None' ? trackingLink.trim() : null;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: targetStatus,
      shipperName: cleanShipper,
      trackingNumber: cleanTrackingId,
      trackingLink: cleanTrackingLink
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Marks order as delivered/completed.
 */
export const completeOrder = async (id, completedDate) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      completedDate: completedDate || getIstDateString()
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Cancels order directly with reason and replenishes inventory.
 */
/**
 * Cancels order directly with reason, audit trail, and replenishes inventory.
 */
export const cancelOrder = async (id, cancelReason, actor = { role: 'ADMIN', id: null }) => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!existing) {
      throw new Error('Order not found');
    }
    if (actor?.role === 'MANUFACTURER' && existing.manufacturerId && existing.manufacturerId !== actor.id) {
      throw new Error('Unauthorized to cancel this order');
    }
    const cancelledByRole = (actor?.role || '').toUpperCase() === 'MANUFACTURER' ? 'MANUFACTURER' : 'ADMIN';
    const finalReason = cancelReason && cancelReason.trim()
      ? cancelReason.trim()
      : (existing.cancelReason || null);

    if (existing.status === 'CANCELED') {
      let updated;
      try {
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelReason: finalReason,
            cancelledByRole: existing.cancelledByRole || cancelledByRole,
            cancelledByUserId: existing.cancelledByUserId || actor?.id || null,
            cancelledAt: existing.cancelledAt || new Date(),
            cancelRequested: false
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      } catch (auditErr) {
        console.warn('Falling back to core cancel fields:', auditErr.message);
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelReason: finalReason,
            cancelRequested: false
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      }
      return formatOrderForUi(updated);
    }

    // Replenish stock for all items without N+1 queries
    if (Array.isArray(existing.items)) {
      const replenishMap = new Map();
      for (const item of existing.items) {
        if (item.productId && item.quantity > 0) {
          replenishMap.set(item.productId, (replenishMap.get(item.productId) || 0) + item.quantity);
        }
      }

      if (replenishMap.size > 0) {
        const productIds = Array.from(replenishMap.keys());
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true }
        });
        const validProductIds = new Set(products.map(p => p.id));

        for (const [productId, incrementQty] of replenishMap.entries()) {
          if (validProductIds.has(productId)) {
            await tx.product.update({
              where: { id: productId },
              data: {
                stock: { increment: incrementQty },
                inStock: true
              }
            });
          }
        }
      }
    }

    let updated;
    try {
      updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELED',
          cancelReason: finalReason,
          cancelledByRole,
          cancelledByUserId: actor?.id || null,
          cancelledAt: new Date(),
          cancelRequested: false
        },
        include: {
          items: { include: { product: true } },
          user: true,
          manufacturer: true
        }
      });
    } catch (auditErr) {
      console.warn('Falling back to core cancel fields:', auditErr.message);
      updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELED',
          cancelReason: finalReason,
          cancelRequested: false
        },
        include: {
          items: { include: { product: true } },
          user: true,
          manufacturer: true
        }
      });
    }

    return formatOrderForUi(updated);
  }, { maxWait: 10000, timeout: 20000 });
};

/**
 * Submits a price adjustment request from Manufacturer.
 */
export const requestPriceAdjustment = async (id, priceAdjustmentAmount, priceAdjustmentReason) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      priceAdjustmentAmount: parseFloat(priceAdjustmentAmount) || 0,
      priceAdjustmentReason: priceAdjustmentReason || '',
      priceAdjustmentStatus: 'Pending Approval'
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Responds to a price adjustment request (approve or reject).
 */
export const handlePriceAdjustmentResponse = async (id, action) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error('Order not found');
  }

  const isApproved = action === 'approve';
  const adjustment = order.priceAdjustmentAmount || 0;
  const newMfgPayment = isApproved
    ? Number((order.mfgPayment + adjustment).toFixed(2))
    : order.mfgPayment;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      priceAdjustmentStatus: isApproved ? 'Approved' : 'Rejected',
      mfgPayment: newMfgPayment
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Submits an order cancellation request from Manufacturer.
 */
export const requestOrderCancellation = async (id, cancelReason, actor = { role: 'MANUFACTURER', id: null }) => {
  const finalReason = cancelReason && cancelReason.trim() ? cancelReason.trim() : null;
  const updated = await prisma.order.update({
    where: { id },
    data: {
      cancelRequested: true,
      cancelReason: finalReason,
      cancelledByRole: 'MANUFACTURER',
      cancelledByUserId: actor?.id || null,
      cancelledAt: new Date()
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  }).catch(() => {
    return prisma.order.update({
      where: { id },
      data: {
        cancelRequested: true,
        cancelReason: finalReason
      },
      include: {
        items: { include: { product: true } },
        user: true,
        manufacturer: true
      }
    });
  });

  return formatOrderForUi(updated);
};

/**
 * Responds to a cancellation request (accept or reject).
 */
export const handleCancellationResponse = async (id, action, actor = { role: 'ADMIN', id: null }) => {
  const isAccepted = action === 'accept';

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!existing) {
      throw new Error('Order not found');
    }

    if (isAccepted) {
      // Replenish stock for all items without N+1 queries
      if (Array.isArray(existing.items)) {
        const replenishMap = new Map();
        for (const item of existing.items) {
          if (item.productId && item.quantity > 0) {
            replenishMap.set(item.productId, (replenishMap.get(item.productId) || 0) + item.quantity);
          }
        }

        if (replenishMap.size > 0) {
          const productIds = Array.from(replenishMap.keys());
          const products = await tx.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true }
          });
          const validProductIds = new Set(products.map(p => p.id));

          for (const [productId, incrementQty] of replenishMap.entries()) {
            if (validProductIds.has(productId)) {
              await tx.product.update({
                where: { id: productId },
                data: {
                  stock: { increment: incrementQty },
                  inStock: true
                }
              });
            }
          }
        }
      }

      let updated;
      try {
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelRequested: false,
            status: 'CANCELED',
            cancelReason: existing.cancelReason || null,
            cancelledByRole: existing.cancelledByRole || 'MANUFACTURER',
            cancelledByUserId: existing.cancelledByUserId || actor?.id || null,
            cancelledAt: existing.cancelledAt || new Date()
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      } catch (auditErr) {
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelRequested: false,
            status: 'CANCELED',
            cancelReason: existing.cancelReason || null
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      }
      return formatOrderForUi(updated);
    } else {
      let updated;
      try {
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelRequested: false,
            cancelReason: null,
            cancelledByRole: null,
            cancelledByUserId: null,
            cancelledAt: null
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      } catch (auditErr) {
        updated = await tx.order.update({
          where: { id },
          data: {
            cancelRequested: false,
            cancelReason: null
          },
          include: {
            items: { include: { product: true } },
            user: true,
            manufacturer: true
          }
        });
      }
      return formatOrderForUi(updated);
    }
  }, { maxWait: 10000, timeout: 20000 });
};

/**
 * Updates manufacturer payout status (Paid / Unpaid).
 */
export const updateMfgPaymentStatus = async (id, mfgPaymentStatus, mfgPaidDate) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      mfgPaymentStatus: mfgPaymentStatus || 'Paid',
      mfgPaidDate: mfgPaymentStatus === 'Paid'
        ? (mfgPaidDate || getIstDateString())
        : null
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Retrieves a single order by ID.
 */
export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    }
  });

  if (!order) return null;
  return formatOrderForUi(order, true);
};
