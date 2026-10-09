import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Heart } from 'lucide-react';
import { useCartStore } from '../shared/store/useCartStore';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart } = useCartStore();
  const { wishlistItems, toggleWishlist } = useWishlistStore();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Your Cart ({cartItems.length})
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading font-bold text-lg uppercase">Your cart is empty</h3>
                  <p className="text-muted-foreground text-sm">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-4 px-8 py-3 bg-foreground text-background font-bold uppercase text-sm tracking-wider hover:bg-black/80 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-border/50 pb-6 last:border-0 last:pb-0">
                    <Link to={`/product/${item.id}`} onClick={closeCart} className="w-24 h-32 bg-muted flex-shrink-0 hover:opacity-80 transition-opacity">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/product/${item.id}`} onClick={closeCart} className="font-bold text-sm uppercase leading-tight hover:underline underline-offset-4 line-clamp-1">{item.name}</Link>
                          <p className="text-muted-foreground text-sm mt-1">Size: {item.size}</p>
                          <p className="text-muted-foreground text-sm">Color: {item.color || 'Default'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const isWishlisted = wishlistItems.some(w => w.id === item.id);
                              if (!isWishlisted) {
                                toggleWishlist(item);
                              }
                              removeFromCart(item.id, item.size);
                            }}
                            className="text-muted-foreground hover:text-black transition-colors"
                            title="Move to Wishlist"
                          >
                            <Heart className={`w-4 h-4 ${wishlistItems.some(w => w.id === item.id) ? 'fill-black text-black' : ''}`} />
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/20">
                <div className="flex justify-between mb-4 font-bold text-lg">
                  <span className="uppercase">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">
                  Shipping & taxes calculated at checkout.
                </p>
                <Link 
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full block text-center py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
