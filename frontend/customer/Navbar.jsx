import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Home, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/store/useAuthStore';
import { useCatalogStore } from '../shared/store/useCatalogStore';
import { useWishlistStore } from '../shared/store/useWishlistStore';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const productsRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();
  const { categories: storeCategories, fetchCategories } = useCatalogStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProductsOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (productsRef.current && !productsRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = storeCategories.map(cat => {
    const catName = typeof cat === 'string' ? cat : cat.name;
    return {
      name: catName,
      path: `/category/${catName}`
    };
  });

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const profileLinks = [
    { name: 'Profile', path: '/account' },
    { name: 'Addresses', path: '/addresses' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Cart', path: '/checkout' }, // Using checkout as cart/bag view since Cart Drawer icon is removed
    { name: 'Order History & Track', path: '/track-orders' },
    // { name: 'Wallet', path: '/wallet' },
    { name: 'Help', path: '/help' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Logout', action: () => setShowLogoutConfirm(true) }
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md py-3 border-border' : 'bg-white py-5 border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-full">
          
          {/* Mobile Left: Hamburger */}
          <div className="flex-1 flex justify-start md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-muted rounded-full transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Left: Products Dropdown */}
          <div className="flex-1 hidden md:flex justify-start" ref={productsRef}>
            <div 
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button 
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors py-2"
                onClick={() => setIsProductsOpen(!isProductsOpen)}
              >
                Products <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white border border-border shadow-xl py-4 flex flex-col gap-1 z-50"
                  >
                    {categories.map((cat) => (
                      <Link 
                        key={cat.name} 
                        to={cat.path}
                        className="px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-muted hover:text-black transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex-shrink-0 flex items-center justify-center">
            <Link to="/" className="flex items-center justify-center" onClick={() => window.scrollTo(0,0)}>
              <img 
                src={logoImg} 
                alt="H&S - Hi & Shi" 
                className={`w-auto object-contain transition-all duration-300 hover:opacity-85 ${isScrolled ? 'h-9 md:h-10' : 'h-10 md:h-12'}`}
              />
            </Link>
          </div>

          {/* Right: Profile Dropdown, Wishlist & Desktop Home */}
          <div className="flex-1 flex justify-end items-center gap-2" ref={profileRef}>
            <Link 
              to="/" 
              className="p-2 hover:bg-muted rounded-full transition-colors hidden md:flex items-center justify-center" 
              aria-label="Home"
              onClick={() => window.scrollTo(0,0)}
            >
              <Home className="w-5 h-5" />
            </Link>

            <Link
              to="/wishlist"
              className="p-2 hover:bg-muted rounded-full transition-colors relative flex items-center justify-center"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-black text-black' : ''}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            <div className="relative">
              <button 
                className="p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Profile Menu"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-white border border-border shadow-2xl py-4 flex flex-col z-50"
                  >
                    <div className="px-6 py-3 border-b border-border/50 mb-2">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                        {isAuthenticated ? `Welcome ${user?.fullName ? user.fullName.split(' ')[0] : ''}` : 'My Account'}
                      </p>
                    </div>
                    {isAuthenticated ? (
                      profileLinks.map((link) => (
                        link.path ? (
                          <Link 
                            key={link.name} 
                            to={link.path}
                            onClick={() => setIsProfileOpen(false)}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-muted hover:text-black transition-colors"
                          >
                            {link.name}
                          </Link>
                        ) : (
                          <button
                            key={link.name}
                            onClick={() => {
                              link.action();
                              setIsProfileOpen(false);
                            }}
                            className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest hover:bg-muted text-red-500 hover:text-red-600 border-t border-border/50 mt-2 pt-4 transition-colors"
                          >
                            {link.name}
                          </button>
                        )
                      ))
                    ) : (
                      <div className="flex flex-col gap-2 px-4 py-2">
                        <Link 
                          to="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-center bg-foreground text-background py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link 
                          to="/signup"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-center border border-foreground text-foreground py-3 text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col pt-24 px-8 overflow-y-auto"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col gap-10 pb-20">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Shop</h3>
                <div className="flex flex-col gap-6">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.name} 
                      to={cat.path}
                      className="text-2xl font-black uppercase tracking-tighter hover:text-muted-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-screen h-[100dvh] bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 max-w-sm w-full shadow-2xl relative"
            >
              <h3 className="font-heading text-2xl font-bold uppercase tracking-widest mb-4">Confirm Logout</h3>
              <p className="text-muted-foreground text-sm mb-8">Are you sure you want to log out of your account?</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-black/90 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
