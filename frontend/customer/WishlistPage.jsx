import { useWishlistStore } from '../shared/store/useWishlistStore';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems } = useWishlistStore();

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex items-center gap-4 mb-12 border-b border-border pb-6">
        <Heart className="w-8 h-8" />
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight">Your Wishlist</h1>
        <span className="text-muted-foreground font-bold ml-auto">{wishlistItems.length} Items</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {wishlistItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
