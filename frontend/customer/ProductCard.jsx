import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';
import { resolveColorHex } from '../shared/lib/colorUtils';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  const isWishlisted = wishlistItems.some(item => item?.id === product?.id);

  // Active color variant if present
  const colorsList = Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : [];
  const activeColor = colorsList.length > 0 ? (colorsList[selectedColorIndex] || colorsList[0]) : null;

  // Primary image is ALWAYS the cover photo (with fallbacks)
  const primaryImage = product?.coverPhoto 
    || (Array.isArray(product?.images) && product.images[0]) 
    || activeColor?.frontView 
    || product?.frontView 
    || '';

  // If user tapped a specific color variant, preview that color's front view
  const currentImage = (selectedColorIndex > 0 && activeColor?.frontView)
    ? activeColor.frontView
    : primaryImage;

  // Secondary/hover image (front view, back view, or 2nd image if different from current)
  const hoverImage = activeColor?.backView && activeColor.backView !== currentImage
    ? activeColor.backView
    : ((activeColor?.frontView && activeColor.frontView !== currentImage)
      ? activeColor.frontView
      : ((Array.isArray(product?.images) && product.images.length > 1 && product.images[1] !== currentImage)
        ? product.images[1]
        : ''));

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
      {/* Sleek, Non-Dominating Badges on Mobile */}
      {(product.isBestSeller || product.isNew) && (
        <div className="absolute top-2 left-2 z-20 flex items-center">
          {product.isBestSeller ? (
            <span className="bg-black/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs border border-white/10">
              Best Seller
            </span>
          ) : product.isNew ? (
            <span className="bg-white/90 backdrop-blur-md text-black text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs border border-black/10">
              New
            </span>
          ) : null}
        </div>
      )}

      {/* Wishlist Button - Sleek and compact */}
      <button 
        type="button"
        onClick={handleWishlistToggle}
        className="group absolute top-2 right-2 z-20 p-1.5 sm:p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full transition-all duration-200 shadow-xs hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110 ${isWishlisted ? 'fill-black text-black' : 'text-neutral-700 group-hover:text-black'}`} />
      </button>

      {/* Image Container - Fully visible without cropping/trimming */}
      <div className="relative aspect-[3/4] bg-[#F7F7F8] dark:bg-neutral-900 overflow-hidden mb-3 sm:mb-4 rounded-2xl flex items-center justify-center border border-neutral-200/60 dark:border-neutral-800">
        {/* Primary / Selected Variant Image */}
        <img 
          src={currentImage || 'https://via.placeholder.com/600'} 
          alt={product.name}
          className={`w-full h-full object-contain transition-all duration-700 ${isHovered && hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
        />

        {/* Hover Alternate Image */}
        {hoverImage && (
          <img 
            src={hoverImage} 
            alt={`${product.name} alternate view`}
            className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
          />
        )}

        {/* Sold Out Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="bg-black text-white px-5 py-1.5 font-bold uppercase tracking-widest text-[11px] rotate-[-12deg] shadow-xl border-2 border-white">
              Sold Out
            </span>
          </div>
        )}

        {/* View Product Overlay */}
        {product.inStock && (
          <div className={`hidden sm:block absolute bottom-0 left-0 w-full p-3 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'} z-20`}>
            <button 
              type="button"
              onClick={handleViewProduct}
              className="w-full bg-black text-white py-2.5 font-bold uppercase text-[11px] tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all duration-200 flex items-center justify-center gap-2 shadow-lg rounded-xl cursor-pointer hover:shadow-xl active:scale-[0.99]"
            >
              <Eye className="w-3.5 h-3.5" />
              View Product
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {/* Color variants preview dots with exact colors */}
        {colorsList.length > 1 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {colorsList.slice(0, 5).map((col, idx) => {
              const code = resolveColorHex(col);
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
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 cursor-pointer ${
                    selectedColorIndex === idx 
                      ? 'scale-125 border-black ring-2 ring-black/40 ring-offset-1 z-10 shadow-sm' 
                      : 'border-neutral-300 dark:border-neutral-600 hover:scale-125 hover:shadow-sm hover:ring-1 hover:ring-black/20'
                  }`}
                  style={{ backgroundColor: code }}
                  title={`${name} variant (${code})`}
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
