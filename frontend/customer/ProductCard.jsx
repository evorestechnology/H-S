import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  const isWishlisted = wishlistItems.some(item => item.id === product.id);

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
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 rounded-xl ">
        {product.isNew && (
          <span className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-xl">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur hover:bg-white rounded-full transition-colors"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 rounded-3xl">
        <img 
          src={product.coverPhoto || (product.images && product.images[0]) || ''} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered && product.inStock ? 'scale-105' : 'scale-100'} ${!product.inStock ? 'opacity-70 grayscale' : ''}`}
        />
        {product.images && product.images[1] && product.inStock && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} alternate`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
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
              className="w-full bg-black text-white py-3 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Product
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <h3 className="font-bold text-sm uppercase tracking-tight mb-1 group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm">₹{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
