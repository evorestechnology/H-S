import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeView, setActiveView] = useState('front'); // 'front' | 'back'
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  const isWishlisted = wishlistItems.some(item => item?.id === product?.id);

  // Active color variant if present
  const colorsList = Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : [];
  const activeColor = colorsList.length > 0 ? (colorsList[selectedColorIndex] || colorsList[0]) : null;

  // Cover Image extraction
  const coverPhoto = product?.coverPhoto || '';

  // Front View extraction
  const frontView = activeColor?.frontView
    || product?.frontView
    || coverPhoto
    || (Array.isArray(product?.images) && product.images[0])
    || '';

  // Back View extraction
  const backView = activeColor?.backView
    || product?.backView
    || (Array.isArray(product?.images) && product.images.length > 1 ? product.images[1] : '')
    || activeColor?.modelPhoto1
    || '';

  const hasDistinctCover = Boolean(coverPhoto && coverPhoto !== frontView);
  const hasBackView = Boolean(backView);

  // Determine which image should currently display: 'cover', 'back', or 'front'
  const isDisplayingBack = hasBackView && (activeView === 'back' || (isHovered && activeView !== 'front' && activeView !== 'cover'));
  const isDisplayingCover = hasDistinctCover && activeView === 'cover' && !isHovered;
  const isShowingBack = isDisplayingBack;

  const handleViewProduct = (e) => {
    e.preventDefault();
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 rounded-xl">
        {product.isNew && (
          <span className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-xl shadow-sm">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur hover:bg-white rounded-full transition-colors shadow-sm"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 rounded-3xl">
        {/* Cover Photo Layer (if distinct from front) */}
        {hasDistinctCover && (
          <img 
            src={coverPhoto} 
            alt={`${product.name} cover`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isDisplayingCover ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
          />
        )}

        {/* Front View Image */}
        <img 
          src={frontView || 'https://via.placeholder.com/600'} 
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ${isShowingBack || isDisplayingCover ? 'opacity-0 scale-105' : 'opacity-100 scale-100'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
        />

        {/* Back View Image */}
        {hasBackView && (
          <img 
            src={backView} 
            alt={`${product.name} back view`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isShowingBack ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
          />
        )}
        
        {/* Cover / Front / Back Toggle Pill (one-tap on touch/mobile or manual switch on desktop) */}
        {(hasDistinctCover || hasBackView) && (
          <div 
            className="absolute bottom-3 left-3 z-20 flex items-center bg-black/85 backdrop-blur-md rounded-full p-0.5 border border-white/20 shadow-lg text-[9px] font-bold tracking-wider uppercase text-white transition-opacity duration-300"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            {hasDistinctCover && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveView('cover');
                }}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  isDisplayingCover
                    ? 'bg-white text-black font-black shadow-sm' 
                    : 'text-white/70 hover:text-white'
                }`}
                title="Show Cover Image"
              >
                Cover
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveView('front');
              }}
              className={`px-2 py-0.5 rounded-full transition-all ${
                !isShowingBack && !isDisplayingCover
                  ? 'bg-white text-black font-black shadow-sm' 
                  : 'text-white/70 hover:text-white'
              }`}
              title="Show Front View"
            >
              Front
            </button>
            {hasBackView && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveView('back');
                }}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  isShowingBack
                    ? 'bg-white text-black font-black shadow-sm' 
                    : 'text-white/70 hover:text-white'
                }`}
                title="Show Back View"
              >
                Back
              </button>
            )}
          </div>
        )}

        {/* Sold Out Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="bg-black text-white px-6 py-2 font-bold uppercase tracking-widest text-xs rotate-[-12deg] shadow-xl border-2 border-white">
              Sold Out
            </span>
          </div>
        )}

        {/* View Product Overlay */}
        {product.inStock && (
          <div className={`absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'} z-20`}>
            <button 
              onClick={handleViewProduct}
              className="w-full bg-black text-white py-3 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Eye className="w-4 h-4" />
              View Product
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {/* Color variants preview dots */}
        {colorsList.length > 1 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {colorsList.slice(0, 5).map((col, idx) => {
              const code = col?.code || (typeof col === 'string' ? col : '#000');
              const name = col?.name || (typeof col === 'string' ? col : `Color ${idx + 1}`);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColorIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColorIndex === idx 
                      ? 'scale-125 border-black ring-2 ring-black/40 ring-offset-1' 
                      : 'border-neutral-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: code }}
                  title={`${name} variant`}
                />
              );
            })}
            {colorsList.length > 5 && (
              <span className="text-[10px] text-muted-foreground font-mono font-medium">+{colorsList.length - 5}</span>
            )}
          </div>
        )}

        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-tight mb-1 group-hover:underline underline-offset-4 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm font-semibold">₹{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
