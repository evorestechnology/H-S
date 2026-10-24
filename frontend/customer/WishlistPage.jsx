import { useEffect } from 'react';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { useAuthStore } from '../shared/store/useAuthStore';
import ProductCard from './ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems } = useWishlistStore();
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      navigate('/login', { state: { from: '/wishlist' }, replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  // Show nothing while auth is being checked
  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show sign-in prompt (brief flash before redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 text-center">
        <LogIn className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="font-heading text-2xl font-bold uppercase mb-4">Sign In to View Your Wishlist</h2>
        <p className="text-muted-foreground mb-8">Save your favourite pieces and access them anytime.</p>
        <Link
          to="/login"
          state={{ from: '/wishlist' }}
          className="px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-18 md:pt-20 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[100dvh]">
      <div className="flex items-center gap-4 mb-8 sm:mb-12 border-b border-border pb-6">
        <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
        <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight">Your Wishlist</h1>
        <span className="text-muted-foreground text-xs sm:text-sm font-bold ml-auto">{wishlistItems.length} Items</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Heart className="w-16 h-16 text-muted-foreground mb-6" />
          <h2 className="font-heading text-2xl font-bold uppercase mb-4">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">Save items you love to keep track of them.</p>
          <Link 
            to="/"
            className="px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {wishlistItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
