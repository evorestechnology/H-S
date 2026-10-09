import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './shared/store/useAuthStore';
import { useCartStore } from './shared/store/useCartStore';
import { useWishlistStore } from './shared/store/useWishlistStore';

import Navbar from './customer/Navbar';
import Footer from './customer/Footer';
import CartDrawer from './customer/CartDrawer';
import NewsletterModal from './customer/NewsletterModal';

// Customer Pages
import Home from './customer/Home';
import CategoryPage from './customer/CategoryPage';
import ProductDetailPage from './customer/ProductDetailPage';
import AccountProfile from './customer/AccountProfile';
import WalletPage from './customer/WalletPage';
import HelpPage from './customer/HelpPage';
import TermsPage from './customer/TermsPage';
import TrackOrderPage from './customer/TrackOrderPage';
import WishlistPage from './customer/WishlistPage';
import CheckoutPage from './customer/CheckoutPage';
import AuthPage from './customer/AuthPage';
import AddressPage from './customer/AddressPage';
import TrackingDetailPage from './customer/TrackingDetailPage';
import ResetPasswordPage from './customer/ResetPasswordPage';

// Shared Security Guard & Auth
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLogin from './auth/AdminLogin';

// Lazy-loaded Admin & Manufacturer Portals
const DashboardLayout = lazy(() => import('./admin/layout/DashboardLayout'));
const AdminDashboard = lazy(() => import('./admin/Dashboard/Dashboard'));
const AdminCatalog = lazy(() => import('./admin/Catalog/Catalog'));
const AdminOrders = lazy(() => import('./admin/Orders/Orders'));
const AdminWallet = lazy(() => import('./admin/Wallet/Wallet'));
const AdminUsers = lazy(() => import('./admin/Users/Users'));
const AdminCoupons = lazy(() => import('./admin/Coupons/Coupons'));
const AdminSettings = lazy(() => import('./admin/Settings/Settings'));

const ManufacturerOrders = lazy(() => import('./manufacturer/Orders/Orders'));
const ManufacturerWallet = lazy(() => import('./manufacturer/Wallet/Wallet'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono tracking-widest uppercase text-neutral-500">Loading view...</span>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Hide customer navbar & footer on administrative, manufacturer, or login routes
  const isPortalRoute = path.startsWith('/master') || path.startsWith('/manufacturer') || path.startsWith('/login/admin') || path.startsWith('/login/manufacturer');
  const hideCustomerFooter = isPortalRoute || path === '/login' || path === '/signup';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isPortalRoute && <Navbar />}
      {!isPortalRoute && <CartDrawer />}
      {!isPortalRoute && <NewsletterModal />}

      <main className="flex-grow">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Customer Public & Private Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/new-arrivals" element={<CategoryPage />} />
            <Route path="/best-sellers" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CheckoutPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/account" element={<AccountProfile />} />
            <Route path="/profile" element={<AccountProfile />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/profile/address" element={<AddressPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/orders" element={<TrackOrderPage />} />
            <Route path="/orders/:orderId" element={<TrackingDetailPage />} />
            <Route path="/track-orders" element={<TrackOrderPage />} />
            <Route path="/track/:orderId" element={<TrackingDetailPage />} />

            {/* Public Portal Auth Routes */}
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/manufacturer" element={<AdminLogin />} />

            {/* Protected Administrator Routes (/master/*) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR']} portal="admin" />}>
              <Route path="/master" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<Navigate to="/master" replace />} />
                <Route path="catalogue" element={<AdminCatalog />} />
                <Route path="catalogue/:dropId" element={<AdminCatalog />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderId" element={<AdminOrders />} />
                <Route path="wallet" element={<AdminWallet />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="settings/products" element={<AdminSettings />} />
                <Route path="settings/shipping" element={<AdminSettings />} />
                <Route path="settings/gst" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Legacy Admin Redirections */}
            <Route path="/dashboard" element={<Navigate to="/master" replace />} />

            {/* Protected Manufacturer Routes (/manufacturer/*) */}
            <Route element={<ProtectedRoute allowedRoles={['MANUFACTURER', 'ADMIN', 'ADMINISTRATOR']} portal="manufacturer" />}>
              <Route path="/manufacturer" element={<DashboardLayout />}>
                <Route index element={<ManufacturerOrders />} />
                <Route path="orders" element={<ManufacturerOrders />} />
                <Route path="orders/:orderId" element={<ManufacturerOrders />} />
                <Route path="settlements" element={<ManufacturerWallet />} />
                <Route path="profile" element={<AccountProfile />} />
              </Route>
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!hideCustomerFooter && <Footer />}
    </div>
  );
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ className: 'uppercase text-xs font-mono font-bold tracking-widest rounded-none border border-black shadow-none' }} />
      <AppContent />
    </Router>
  );
}

export default App;
