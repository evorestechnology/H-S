import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler, ChevronRight, ChevronDown, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogStore } from '../shared/store/useCatalogStore';
import { useCartStore } from '../shared/store/useCartStore';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import ImageLightboxModal from '../shared/components/ImageLightboxModal';

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

  const addToCart = useCartStore(state => state.addToCart);
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.some(item => item?.id === product?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data) {
          setSelectedSize(typeof data.sizes?.[0] === 'string' ? data.sizes[0] : data.sizes?.[0]?.size || '');
          setSelectedColor(typeof data.colors?.[0] === 'string' ? data.colors[0] : data.colors?.[0]?.name || 'Default');
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
        setLoading(false);
      }
    };
    loadProduct();
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
      navigate('/login');
      return;
    }
    addToCart(product, selectedSize, quantity, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  let allImages = [];
  
  // Find the selected color object
  const selectedColorObj = (product.colors || []).find(c => 
    (typeof c === 'string' ? c : c?.name || 'Default Color') === selectedColor
  ) || {};

  // If the selected color has specific model photos, use them!
  const colorImages = Array.isArray(selectedColorObj.modelPhotos) && selectedColorObj.modelPhotos.length > 0
    ? selectedColorObj.modelPhotos
    : (product.images || []);

  if (product.coverPhoto) {
    allImages = [product.coverPhoto, ...colorImages.filter(img => img !== product.coverPhoto)];
  } else {
    allImages = colorImages.length > 0 ? colorImages : ['https://via.placeholder.com/800'];
  }

  return (
    <div className="pt-24 pb-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Breadcrumbs */}
      <nav className="flex text-xs uppercase tracking-widest text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/category/${product.category}`} className="hover:text-foreground transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-start relative">
        
        {/* Cover Photo - Sticky Left */}
        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div 
            onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}
            className="aspect-[3/4] bg-muted w-full overflow-hidden rounded-2xl relative cursor-zoom-in group"
            title="Click to view full image in high resolution"
          >
            <img src={allImages[0]} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'opacity-70 grayscale' : ''}`} />
            
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
        </div>

        {/* Extra Images - Scrolling Middle */}
        <div className="lg:col-span-4 w-full">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-4 snap-x no-scrollbar w-full">
            {allImages.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => { setLightboxIndex(idx); setIsLightboxOpen(true); }}
                className={`aspect-[3/4] w-[85vw] sm:w-[60vw] lg:w-full flex-shrink-0 snap-center bg-muted overflow-hidden rounded-2xl relative cursor-zoom-in group ${idx === 0 ? 'lg:hidden' : ''}`}
                title="Click to view full image in high resolution"
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'opacity-70 grayscale' : ''}`} />
                
                <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {!product.inStock && idx === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm rotate-[-12deg] shadow-xl border-2 border-white">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Details - Sticky Right */}
        <div className="w-full lg:col-span-4 lg:sticky lg:top-24 h-fit flex flex-col pt-4 lg:pt-0">
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
                    onClick={() => setSelectedColor(color)}
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
            <div className="grid grid-cols-4 gap-3">
              {(product.sizes || []).map(sizeObj => {
                const sizeStr = typeof sizeObj === 'string' ? sizeObj : sizeObj?.size || 'N/A';
                const isAvailable = typeof sizeObj === 'object' && sizeObj.hasOwnProperty('isAvailable') ? sizeObj.isAvailable : true;
                
                return (
                  <button
                    key={sizeStr}
                    onClick={() => setSelectedSize(sizeStr)}
                    disabled={!isAvailable}
                    className={`py-3 border text-sm font-bold uppercase transition-colors ${
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

          <div className="flex gap-4 mb-10">
            <div className="w-24 border border-border flex items-center justify-between px-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg">-</button>
              <span className="font-bold text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-lg">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 py-4 font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                !product.inStock 
                  ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                  : isAdded 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-foreground text-background border-foreground hover:bg-white hover:text-black hover:border-black border-2'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
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
              className={`w-14 flex items-center justify-center border-2 transition-colors ${
                isWishlisted
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground'
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
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
                  <div key={p.id}>
                    <Link to={`/product/${p.id}`} className="group block">
                      <div className="aspect-[3/4] bg-muted overflow-hidden mb-4 relative rounded-xl">
                        <img src={p.coverPhoto || (p.images && p.images[0]) || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-tight group-hover:underline">{p.name}</h3>
                      <p className="text-muted-foreground text-sm">${p.price.toFixed(2)}</p>
                    </Link>
                  </div>
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
              className="bg-background max-w-2xl w-full p-6 lg:p-10 relative overflow-hidden"
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
