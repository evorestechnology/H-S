import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler, ChevronRight, ChevronDown, ChevronUp, Maximize2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogStore } from '../shared/store/useCatalogStore';
import { useCartStore } from '../shared/store/useCartStore';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import ImageLightboxModal from '../shared/components/ImageLightboxModal';
import { subscribeToCatalogSync } from '../shared/lib/catalogSync';
import ProductCard from './ProductCard';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-sm font-bold uppercase tracking-widest"
      >
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const getProductById = useCatalogStore(state => state.getProductById);
  const fetchProducts = useCatalogStore(state => state.fetchProducts);
  const allProducts = useCatalogStore(state => state.products);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const scrollPanelRef = useRef(null);

  const handleSelectView = (idx) => {
    setActiveViewIndex(idx);
    if (scrollPanelRef.current) {
      const items = scrollPanelRef.current.querySelectorAll('[data-gallery-index]');
      const targetItem = items[idx];
      if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleScrollUp = () => {
    if (scrollPanelRef.current) {
      scrollPanelRef.current.scrollBy({ top: -380, left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (scrollPanelRef.current) {
      scrollPanelRef.current.scrollBy({ top: 380, left: 300, behavior: 'smooth' });
    }
  };

  const addToCart = useCartStore(state => state.addToCart);
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.some(item => item?.id === product?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data) {
          setSelectedSize(prev => prev || (typeof data.sizes?.[0] === 'string' ? data.sizes[0] : data.sizes?.[0]?.size || ''));
          setSelectedColor(prev => prev || (typeof data.colors?.[0] === 'string' ? data.colors[0] : data.colors?.[0]?.name || 'Default'));
          setQuantity(1);
          setIsAdded(false);
          setShowRelated(false);
          // Fetch category products for 'related'
          if (allProducts.length === 0) {
            await fetchProducts();
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        if (showLoadingSpinner) setLoading(false);
      }
    };
    loadProduct(true);

    const unsubscribe = subscribeToCatalogSync((syncData) => {
      if (!syncData?.productId || String(syncData.productId) === String(id)) {
        loadProduct(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, getProductById, fetchProducts, allProducts.length]);

  if (loading) {
    return <div className="pt-32 min-h-screen text-center uppercase tracking-widest font-bold text-muted-foreground text-sm">Loading Product...</div>;
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <h1 className="font-heading text-4xl uppercase font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    const finalSize = selectedSize || (typeof product.sizes?.[0] === 'string' ? product.sizes[0] : product.sizes?.[0]?.size) || 'Standard';
    const finalColor = selectedColor || (typeof product.colors?.[0] === 'string' ? product.colors[0] : product.colors?.[0]?.name) || 'Default';

    addToCart(product, finalSize, quantity, finalColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Find the selected color object
  const selectedColorObj = (product.colors || []).find(c => 
    (typeof c === 'string' ? c : c?.name || 'Default Color') === selectedColor
  ) || {};

  // 1. Cover Image
  const coverUrl = product.coverPhoto 
    || (Array.isArray(product.images) && product.images[0]) 
    || '';

  // 2. Front View (for selected color)
  const frontViewUrl = selectedColorObj.frontView 
    || product.frontView 
    || coverUrl 
    || '';

  // 3. Back View (for selected color)
  const backViewUrl = selectedColorObj.backView 
    || product.backView 
    || (Array.isArray(product.images) && product.images.length > 1 ? product.images[1] : '')
    || '';

  // 4. Model View 1
  const model1Url = selectedColorObj.modelPhoto1 
    || (Array.isArray(product.images) && product.images.length > 2 ? product.images[2] : '') 
    || '';

  // 5. Model View 2
  const model2Url = selectedColorObj.modelPhoto2 
    || (Array.isArray(product.images) && product.images.length > 3 ? product.images[3] : '') 
    || '';

  const galleryItems = [];

  // Always show Cover Image
  if (coverUrl) {
    galleryItems.push({ label: 'Cover Image', shortLabel: 'Cover', type: 'cover', url: coverUrl });
  }

  // Always show Front View
  if (frontViewUrl) {
    galleryItems.push({ label: 'Front View', shortLabel: 'Front', type: 'front', url: frontViewUrl });
  }

  // Always show Back View
  if (backViewUrl) {
    galleryItems.push({ label: 'Back View', shortLabel: 'Back', type: 'back', url: backViewUrl });
  }

  // Show Model Photo 1 if present
  if (model1Url) {
    galleryItems.push({ label: 'Model View 1', shortLabel: 'Model 1', type: 'model', url: model1Url });
  }

  // Show Model Photo 2 if present
  if (model2Url) {
    galleryItems.push({ label: 'Model View 2', shortLabel: 'Model 2', type: 'model', url: model2Url });
  }

  // Additional extra photos
  const knownUrls = [coverUrl, frontViewUrl, backViewUrl, model1Url, model2Url].filter(Boolean);
  const extraPhotos = [
    ...(Array.isArray(selectedColorObj.modelPhotos) ? selectedColorObj.modelPhotos : []),
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(url => url && !knownUrls.includes(url));

  let angleCounter = 1;
  extraPhotos.forEach(url => {
    if (!galleryItems.some(item => item.url === url)) {
      galleryItems.push({ 
        label: `Angle ${angleCounter}`, 
        shortLabel: `Angle ${angleCounter}`, 
        type: 'extra', 
        url 
      });
      angleCounter++;
    }
  });

  // if (galleryItems.length === 0) {
  //   galleryItems.push({ label: 'Product View', shortLabel: 'Main', type: 'front', url: 'https://via.placeholder.com/800' });
  // }

  const allImages = galleryItems.map(item => item.url);
  const currentMainItem = galleryItems[activeViewIndex] || galleryItems[0];
  const currentMainImage = currentMainItem.url;

  return (
    <div className="pt-16 sm:pt-18 md:pt-20 pb-16 sm:pb-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[100dvh]">
      
      {/* Breadcrumbs */}
      <nav className="flex text-xs uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/category/${product.category}`} className="hover:text-foreground transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground font-bold">{product.name}</span>
      </nav>

      {/* Front & Back & Cover Quick View Switcher Bar */}
      {/* {galleryItems.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">Product Views:</span>
          {galleryItems.map((item, idx) => {
            const isSelected = activeViewIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectView(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  isSelected 
                    ? 'bg-black text-white border-black shadow-md' 
                    : 'bg-muted/40 text-foreground border-border hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-start relative">
        
        {/* Cover Photo / Main Showcase - Sticky Left */}
        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 h-fit">
          <div 
            onClick={() => { setLightboxIndex(activeViewIndex); setIsLightboxOpen(true); }}
            className="aspect-[3/4] bg-muted w-full overflow-hidden rounded-2xl relative cursor-zoom-in group border border-border/40 shadow-sm"
            title="Click to view full image in high resolution"
          >
            <img 
              src={currentMainImage} 
              alt={`${product.name} - ${currentMainItem.label}`} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'opacity-70 grayscale' : ''}`} 
            />
            
            {/* Prominent View Badge */}
            <div className="absolute top-3 left-3 z-10 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md border border-white/10">
              {currentMainItem.label}
            </div>

            <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Maximize2 className="w-4 h-4" />
            </div>

            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm rotate-[-12deg] shadow-xl border-2 border-white">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Labeled Thumbnail Navigation Row */}
          {galleryItems.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar pb-1">
              {galleryItems.map((item, idx) => {
                const isSelected = activeViewIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectView(idx)}
                    className="flex flex-col items-center gap-1.5 group flex-shrink-0"
                    title={`Switch to ${item.label}`}
                  >
                    <div className={`w-16 h-20 rounded-xl overflow-hidden bg-muted border-2 transition-all ${isSelected ? 'border-black ring-2 ring-black/30' : 'border-border/60 hover:border-black/50'}`}>
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-black font-black' : 'text-muted-foreground'}`}>
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Gallery Views - Stylish Scrolling Middle Panel */}
        <div className="lg:col-span-4 w-full flex flex-col">
          {/* Panel Header with Controls */}
          {/* <div className="flex items-center justify-between pb-3 px-1 border-b border-border/40 mb-3"> */}
            {/* <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shadow-xs">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Product Gallery
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                {galleryItems.length} {galleryItems.length === 1 ? 'View' : 'Views'}
              </span>
            </div> */}

            {/* Scroll Navigation Arrows */}
            {/* {galleryItems.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  className="w-7 h-7 rounded-full border border-border/80 bg-background/80 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground shadow-xs active:scale-95"
                  title="Scroll Up"
                  aria-label="Scroll Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  className="w-7 h-7 rounded-full border border-border/80 bg-background/80 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground shadow-xs active:scale-95"
                  title="Scroll Down"
                  aria-label="Scroll Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div> */}

          {/* Bounded Scrollable Container with Hidden Scrollbar (Scroll Functionality Active) */}
          <div 
            ref={scrollPanelRef}
            className="no-scrollbar flex lg:flex-col overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-140px)] lg:h-[650px] gap-4 snap-x lg:snap-y scroll-smooth pb-2 lg:pb-4 w-full rounded-2xl"
          >
            {galleryItems.map((item, idx) => {
              const isSelected = activeViewIndex === idx;
              return (
                <div 
                  key={idx} 
                  data-gallery-index={idx}
                  onClick={() => handleSelectView(idx)}
                  className={`aspect-[3/4] w-[85vw] sm:w-[50vw] lg:w-full flex-shrink-0 snap-center bg-muted overflow-hidden rounded-2xl relative cursor-pointer group transition-all duration-300 ${
                    isSelected 
                      ? 'ring-2 ring-black border-2 border-transparent shadow-md' 
                      : 'border border-border/50 hover:border-black/50 hover:shadow-sm opacity-90 hover:opacity-100'
                  }`}
                  title={`View ${item.label} (Click to set as main view)`}
                >
                  <img 
                    src={item.url} 
                    alt={`${product.name} - ${item.label}`} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'opacity-70 grayscale' : ''}`} 
                  />
                  
                  {/* Labeled badge with live viewing pulse */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md border border-white/10">
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <span>{item.label}</span>
                  </div>

                  {/* High-res Lightbox Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    className="absolute top-3 right-3 z-10 bg-black/75 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
                    title="Expand high-res preview"
                    aria-label="Expand image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Active view indicator corner tag */}
                  {isSelected && (
                    <div className="absolute bottom-3 right-3 z-10 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md border border-white/20">
                      Active View
                    </div>
                  )}

                  {!product.inStock && idx === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm rotate-[-12deg] shadow-xl border-2 border-white">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Elegant bottom scroll cue for desktop */}
          {galleryItems.length > 2 && (
            <div className="hidden lg:flex items-center justify-center gap-1.5 pt-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
              <ChevronDown className="w-3 h-3 animate-bounce" />
              <span>Scroll panel to view all angles</span>
            </div>
          )}

          {/* Mobile View Toggle Buttons Strip */}
          {galleryItems.length > 1 && (
            <div className="flex lg:hidden gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
              {galleryItems.map((item, idx) => {
                const isSelected = activeViewIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectView(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                      isSelected 
                        ? 'bg-black text-white border-black shadow-sm' 
                        : 'bg-muted/40 text-foreground border-border'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details - Sticky Right */}
        <div className="w-full lg:col-span-4 lg:sticky lg:top-20 h-fit flex flex-col pt-4 lg:pt-0">
          {product.isNew && <span className="text-xs font-bold uppercase tracking-widest mb-4">New Arrival</span>}
          <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-4">
            {product.name}
          </h1>
          <p className="text-2xl mb-8">₹{product.price.toFixed(2)}</p>

          {/* @BACKEND_TEAM: Colors are currently coming from the mock `product.colors` array. Once the backend is integrated, ensure the API returns an array of color names or objects (e.g. { name: 'Black', hex: '#000000' }) for the product. */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Select Color</h3>
            <div className="flex flex-wrap gap-4">
              {(product.colors || ['Default Color']).map(colorObj => {
                const color = typeof colorObj === 'string' ? colorObj : colorObj?.name || 'Default Color';
                const hexValue = typeof colorObj === 'object' && colorObj?.hex ? colorObj.hex : null;
                
                const hex = hexValue || (color.toLowerCase().includes('black') ? '#111' 
                          : color.toLowerCase().includes('white') ? '#eee' 
                          : color.toLowerCase().includes('grey') || color.toLowerCase().includes('gray') ? '#999'
                          : color.toLowerCase().includes('olive') ? '#556b2f'
                          : '#ccc');

                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setActiveViewIndex(0);
                    }}
                    title={color}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color 
                        ? 'border border-foreground' 
                        : 'border border-transparent'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">Select Size</h3>
              <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                <Ruler className="w-3 h-3" /> Size Guide
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {(product.sizes || []).map(sizeObj => {
                const sizeStr = typeof sizeObj === 'string' ? sizeObj : sizeObj?.size || 'N/A';
                const isAvailable = typeof sizeObj === 'object' && sizeObj.hasOwnProperty('isAvailable') ? sizeObj.isAvailable : true;
                
                return (
                  <button
                    key={sizeStr}
                    onClick={() => setSelectedSize(sizeStr)}
                    disabled={!isAvailable}
                    className={`py-2.5 sm:py-3 border text-xs sm:text-sm font-bold uppercase transition-colors ${
                      selectedSize === sizeStr 
                        ? 'bg-foreground text-background border-foreground' 
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    } ${!isAvailable ? 'opacity-30 cursor-not-allowed hover:border-border' : ''}`}
                  >
                    {sizeStr}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 mb-10">
            <div className="w-20 sm:w-24 border border-border flex items-center justify-between px-2 sm:px-4">
              <button 
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                disabled={quantity <= 1}
                className="text-base sm:text-lg p-1 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="font-bold text-xs sm:text-sm select-none">{quantity}</span>
              <button 
                type="button"
                onClick={() => setQuantity(q => q + 1)} 
                className="text-base sm:text-lg p-1 select-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-bold uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                !product.inStock 
                  ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                  : isAdded 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-foreground text-background border-foreground hover:bg-white hover:text-black hover:border-black border-2'
              }`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {!product.inStock ? 'Sold Out' : isAdded ? 'Added to Cart' : 'Add to Cart'}
            </button>

            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                toggleWishlist(product);
              }}
              className={`w-11 sm:w-14 flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                isWishlisted
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground'
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="mb-10">
            {product.designerNote && (
              <Accordion title="Designer's Note">
                <p className="whitespace-pre-line">{product.designerNote}</p>
              </Accordion>
            )}
            
            {product.description && (
              <Accordion title="Details & Description" defaultOpen={true}>
                <p className="whitespace-pre-line">{product.description}</p>
                {product.fit && (
                  <ul className="mt-4 space-y-2 list-disc list-inside">
                    <li>Fit: {product.fit}</li>
                  </ul>
                )}
              </Accordion>
            )}
            
            {product.washCare && (
              <Accordion title="Washcare">
                <p className="whitespace-pre-line">{product.washCare}</p>
              </Accordion>
            )}

            {product.shippingNote && (
              <Accordion title="Shipping">
                <p className="whitespace-pre-line">{product.shippingNote}</p>
              </Accordion>
            )}
            <div className="border-t border-border"></div>
          </div>
        </div>
      </div>

      {/* Explore More Button */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 flex flex-col items-center">
          <button 
            onClick={() => setShowRelated(!showRelated)}
            className="group flex flex-col items-center gap-3 hover:text-muted-foreground transition-colors"
          >
            <span className="font-heading font-bold uppercase tracking-widest text-sm">
              {showRelated ? 'Show Less' : 'Explore More'}
            </span>
            <motion.div
              animate={{ y: showRelated ? 0 : [0, 5, 0] }}
              transition={{ 
                repeat: showRelated ? 0 : Infinity, 
                duration: 1.5, 
                ease: "easeInOut" 
              }}
              className={`p-3 border rounded-full transition-colors ${showRelated ? 'bg-black text-white border-black' : 'border-black group-hover:border-muted-foreground'}`}
            >
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showRelated ? 'rotate-180' : ''}`} />
            </motion.div>
          </button>
        </div>
      )}

      {/* Related Products */}
      <AnimatePresence>
        {showRelated && relatedProducts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-16 border-t border-border pt-16">
              <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-10 text-center">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsSizeGuideOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-6 lg:p-10 relative rounded-xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-bold uppercase tracking-widest"
              >
                Close
              </button>
              <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-6">Size Guide</h2>
              <div className="w-full bg-muted aspect-video relative flex items-center justify-center border border-border">
                <img src={product.sizeChart || "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop"} alt="Size Chart" className="w-full h-full object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal for Uncropped Large View */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        currentIndex={lightboxIndex}
        setCurrentIndex={setLightboxIndex}
      />
    </div>
  );
}
