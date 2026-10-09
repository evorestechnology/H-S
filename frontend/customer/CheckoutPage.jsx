/**
 * @BACKEND_TEAM - CHECKOUT & PAYMENTS INTEGRATION:
 * 
 * 1. Payment Gateway:
 *    - Replace the hardcoded credit card inputs with Stripe Elements (or Razorpay/PayPal equivalent).
 *    - Do NOT pass raw credit card data to our backend. Use Stripe.js to tokenize it first.
 * 2. Order Creation (`handleSubmit`):
 *    - Wire up the form to send `POST /api/orders/checkout`.
 *    - Payload should include: `{ shippingAddress, paymentToken, cartItems }`.
 *    - The backend should verify stock, calculate totals on the server to prevent client-side tampering, charge the token, and return the `orderId`.
 * 3. Empty Cart:
 *    - Only clear the local cart (`clearCart()`) AFTER the backend successfully confirms the order creation.
 */
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../shared/store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Info, CheckCircle, Tag, X, Sparkles, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../shared/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASHFREE');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showGstInfo, setShowGstInfo] = useState(false);
  const gstInfoRef = useRef(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [publicCoupons, setPublicCoupons] = useState([]);

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const res = await axiosInstance.get('/coupons/public');
        if (res.data?.success && Array.isArray(res.data?.coupons)) {
          setPublicCoupons(res.data.coupons);
        }
      } catch (err) {
        console.error('Error fetching public coupons:', err);
      }
    };
    fetchPublicCoupons();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (gstInfoRef.current && !gstInfoRef.current.contains(event.target)) {
        setShowGstInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    firstName: '', lastName: '', street: '', apt: '', city: '', zipCode: '', country: 'India'
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axiosInstance.get('/addresses');
        setAddresses(res.data);
        const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else {
          setIsChangingAddress(true); // Force them to enter/choose address
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  // Tax & Shipping Settings State
  const [taxSettings, setTaxSettings] = useState({
    enableGst: true,
    indianThreshold: 2500,
    indianLowRate: 5,
    indianHighRate: 18,
    nonIndianRate: 0
  });

  const [shippingSettings, setShippingSettings] = useState({
    blockStepKg: 5,
    ratePerBlock: 5000,
    domesticFlatRate: 0,
    currency: 'INR (₹)'
  });

  useEffect(() => {
    const fetchTaxSettings = async () => {
      try {
        const res = await axiosInstance.get('/settings/public');
        if (res.data?.data?.taxSettings) {
          setTaxSettings(res.data.data.taxSettings);
        }
        if (res.data?.data?.shippingSettings) {
          setShippingSettings(res.data.data.shippingSettings);
        }
      } catch (error) {
        console.error('Error fetching tax settings:', error);
      }
    };
    fetchTaxSettings();
  }, []);

  const handleApplyCoupon = async (e, overrideCode = null) => {
    e?.preventDefault();
    const codeToApply = (overrideCode || couponInput).trim();
    if (!codeToApply) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await axiosInstance.post('/coupons/validate', {
        code: codeToApply,
        amount: subtotal
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setAppliedCoupon(data);
        setCouponInput(data.code);
        setCouponSuccess(`Coupon '${data.code}' applied! Saved ₹${data.discountAmount}`);
        setCouponError('');
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const baseSubtotalForCoupon = subtotal;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'Percentage') {
      discountAmount = (baseSubtotalForCoupon * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(baseSubtotalForCoupon, appliedCoupon.discountValue);
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));
  
  // Destination country determined from selected order shipping address
  const currentShippingCountry = (selectedAddress && !isChangingAddress
    ? selectedAddress.country
    : (newAddress.country || 'India')) || 'India';

  const isIndianDestination = currentShippingCountry.trim().toLowerCase() === 'india';

  const gst = cartItems.reduce((sum, item) => {
    if (!taxSettings.enableGst) return sum;
    if (isIndianDestination) {
      const rate = item.price > taxSettings.indianThreshold 
        ? (taxSettings.indianHighRate / 100) 
        : (taxSettings.indianLowRate / 100);
      return sum + (item.price * item.quantity * rate);
    } else {
      const nonIndianRate = Number(taxSettings.nonIndianRate) || 0;
      const rate = nonIndianRate / 100;
      return sum + (item.price * item.quantity * rate);
    }
  }, 0);
  
  let shipping = 0;
  if (isIndianDestination) {
    shipping = Number(shippingSettings?.domesticFlatRate) || 0;
  } else {
    // International shipping logic based on admin settings
    const totalWeightKg = cartItems.reduce((sum, item) => sum + (0.5 * item.quantity), 0);
    const blockStepKg = Number(shippingSettings?.blockStepKg) || 5;
    const ratePerBlock = Number(shippingSettings?.ratePerBlock) || 5000;
    const blocks = Math.ceil(totalWeightKg / blockStepKg);
    shipping = blocks * ratePerBlock;
  }
  
  const total = Math.max(0, subtotal - discountAmount + gst + shipping);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleSaveAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
      alert('Please fill out street, city, and postal code.');
      return;
    }
    setIsSavingAddress(true);
    try {
      const addressData = {
        street: `${newAddress.street}${newAddress.apt ? ` ${newAddress.apt}` : ''}`,
        city: newAddress.city,
        state: '', 
        zipCode: newAddress.zipCode,
        country: newAddress.country || 'India',
        isDefault: false
      };
      
      const res = await axiosInstance.post('/addresses', addressData);
      const savedAddr = res.data.data || res.data.address || res.data;
      
      setAddresses([...addresses, savedAddr]);
      setSelectedAddress(savedAddr);
      setIsChangingAddress(false);
      
      setNewAddress({
        firstName: '', lastName: '', street: '', apt: '', city: '', zipCode: '', country: 'India'
      });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCancellationModal(true);
  };

  const executePlaceOrder = async () => {
    setShowCancellationModal(false);
    setIsProcessing(true);
    
    try {
      const finalAddress = (selectedAddress && !isChangingAddress) ? {
        name: 'User',
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country || 'India'
      } : {
        name: `${newAddress.firstName} ${newAddress.lastName}`,
        street: `${newAddress.street} ${newAddress.apt}`,
        city: newAddress.city,
        zipCode: newAddress.zipCode,
        country: newAddress.country || 'India'
      };

      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          color: item.color
        })),
        shippingAddress: finalAddress,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || null
      };

      const res = await axiosInstance.post('/orders/checkout', orderData);
      
      const newOrderId = res.data?.id || res.data?.data?.id || res.data?.order?.id;

      // Broadcast order creation immediately to Admin Dashboard and Manufacturer portals
      try {
        const channel = new BroadcastChannel('hs_orders_sync_channel');
        channel.postMessage({ type: 'ORDER_CREATED', orderId: newOrderId });
        channel.close();
      } catch (e) {
        // Fallback if BroadcastChannel unavailable
      }
      try {
        localStorage.setItem('hs_orders_sync_event', JSON.stringify({ type: 'ORDER_CREATED', orderId: newOrderId, timestamp: Date.now() }));
      } catch (e) {
        // LocalStorage fallback
      }

      if (paymentMethod === 'CASHFREE') {
        try {
          const sessionRes = await axiosInstance.post('/orders/cashfree/create-session', { orderId: newOrderId });
          const sessionData = sessionRes.data?.data;

          if (sessionData && sessionData.payment_session_id) {
            clearCart();
            setIsProcessing(false);

            if (window.Cashfree) {
              const cashfreeEnv = (import.meta.env.VITE_CASHFREE_ENV || 'sandbox').toLowerCase();
              const cashfree = window.Cashfree({ mode: cashfreeEnv === 'production' ? 'production' : 'sandbox' });
              cashfree.checkout({
                paymentSessionId: sessionData.payment_session_id,
                redirectTarget: "_self"
              });
              return;
            } else {
              navigate(`/orders/${newOrderId}`);
              return;
            }
          }
        } catch (cfErr) {
          console.error('Cashfree session creation error:', cfErr);
          alert(cfErr.response?.data?.message || 'Error initializing Cashfree payment session');
          setIsProcessing(false);
          return;
        }
      }

      clearCart();
      setIsProcessing(false);
      
      // Show success animation instead of immediate redirect
      setCreatedOrderId(newOrderId || res.data.id);
      setShowSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate(`/track/${newOrderId}`);
      }, 3000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Error placing order');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <h1 className="font-heading text-4xl uppercase font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-8">Your cart is empty.</p>
        <Link to="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">Secure Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Order Summary */}
        <div className="w-full lg:w-1/2">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mb-6">Order Summary</h2>
          
          <div className="space-y-6 mb-8 lg:max-h-[820px] max-h-none sm:max-h-[60vh] overflow-y-auto pr-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 border-b border-border pb-6">
                <Link to={`/product/${item.id}`} className="w-24 h-32 bg-muted relative flex-shrink-0 hover:opacity-80 transition-opacity">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/product/${item.id}`} className="font-bold uppercase tracking-widest text-sm hover:underline underline-offset-4 line-clamp-1">{item.name}</Link>
                      <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-muted-foreground uppercase text-xs tracking-widest mb-1">Size: {item.size}</p>
                    <p className="text-muted-foreground uppercase text-xs tracking-widest mb-2">Color: {item.color || 'Default'}</p>
                    <p className="text-muted-foreground text-xs">₹{item.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Form & Payment */}
        <div className="w-full lg:w-1/2 bg-muted/20 p-8 border border-border rounded-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Delivery Address Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-bold uppercase tracking-widest">Delivery Address</h2>
                {addresses.length > 0 && !isChangingAddress && (
                  <button 
                    type="button" 
                    onClick={() => setIsChangingAddress(true)}
                    className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors"
                  >
                    Change Delivery Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="border border-border p-6 bg-white text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Loading addresses...
                </div>
              ) : selectedAddress && !isChangingAddress ? (
                <div className="border border-border p-6 bg-white relative">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-sm mb-2">{selectedAddress.street}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed uppercase tracking-widest">
                        {selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ''} {selectedAddress.zipCode}<br />
                        {selectedAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 border border-border">
                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-4 border-b border-border pb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest">Select Saved Address</h3>
                      {addresses.map(addr => (
                        <label key={addr.id} className="flex items-start gap-4 p-4 border border-border cursor-pointer hover:bg-muted/30">
                          <input 
                            type="radio" 
                            name="address" 
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => { setSelectedAddress(addr); setIsChangingAddress(false); }}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-bold uppercase tracking-widest text-xs mb-1">{addr.street}</p>
                            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
                              {addr.city}, {addr.zipCode}
                            </p>
                          </div>
                        </label>
                      ))}
                      <p className="text-center font-bold uppercase tracking-widest text-xs py-2">- OR ADD NEW -</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required={!selectedAddress} type="text" placeholder="First Name" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Last Name" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                    <input type="text" placeholder="Apartment (optional)" value={newAddress.apt} onChange={e => setNewAddress({...newAddress, apt: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                    <input required={!selectedAddress} type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Postal Code" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <select 
                      value={newAddress.country} 
                      onChange={e => setNewAddress({...newAddress, country: e.target.value})} 
                      className="w-full p-3 border border-border focus:outline-none focus:border-foreground uppercase text-xs tracking-widest bg-background col-span-2"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States (USA)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="UAE">United Arab Emirates (UAE)</option>
                      <option value="Other">Other / International</option>
                    </select>
                    
                    {isChangingAddress && (
                      <div className="col-span-2 flex gap-4 mt-2">
                        <button 
                          type="button" 
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                          className="text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-black/90 transition-colors flex-1"
                        >
                          {isSavingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                        {addresses.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setIsChangingAddress(false)} 
                            className="text-xs font-bold uppercase tracking-widest border border-border px-4 py-2 hover:bg-muted flex-1"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Bill Details */}
            <section className="bg-white border border-border p-6 mt-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Bill Details</h2>
              
              {/* Promo / Coupon Box */}
              <div className="mb-6 pb-6 border-b border-border">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Have a Coupon Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 text-green-800 rounded-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-green-600 font-normal">
                        ({appliedCoupon.discountType === 'Percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest underline underline-offset-2 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="ENTER COUPON CODE"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          className="w-full p-3 uppercase tracking-widest text-xs border border-border focus:outline-none focus:border-foreground bg-background pr-8"
                        />
                        <Tag className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest mt-2">{couponError}</p>
                    )}
                  </div>
                )}
                {couponSuccess && (
                  <p className="text-green-600 text-[11px] font-bold uppercase tracking-widest mt-2">{couponSuccess}</p>
                )}

                {/* Available Public Coupons List (Myntra/Nike/Shopify Style UX) */}
                {publicCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Available Offers & Coupons
                      </span>
                    </div>
                    
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {publicCoupons.map((coupon) => {
                        const isEligible = subtotal >= coupon.minSpend;
                        return (
                          <div 
                            key={coupon.id} 
                            className={`p-3 border rounded-sm transition-all flex items-center justify-between gap-3 ${
                              isEligible ? 'bg-white border-border hover:border-black' : 'bg-muted/30 border-dashed border-border/70 opacity-70'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-muted border border-border text-black rounded-xs">
                                  {coupon.code}
                                </span>
                                <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">
                                  {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                                {coupon.minSpend > 0 ? `On orders above ₹${coupon.minSpend.toLocaleString('en-IN')}` : 'No minimum spend required'}
                              </p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setCouponInput(coupon.code);
                                handleApplyCoupon(null, coupon.code);
                              }}
                              disabled={couponLoading || !isEligible}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                isEligible 
                                  ? 'bg-black text-white hover:bg-black/80' 
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                              }`}
                            >
                              {couponLoading && couponInput === coupon.code ? 'Applying...' : (isEligible ? 'Apply' : `Add ₹${(coupon.minSpend - subtotal).toFixed(0)} more`)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between relative items-center">
                  <div className="flex items-center gap-2" ref={gstInfoRef}>
                    <span className="text-muted-foreground uppercase tracking-widest">GST</span>
                    <button 
                      type="button"
                      onClick={() => setShowGstInfo(!showGstInfo)}
                      className="text-muted-foreground hover:text-black transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {showGstInfo && (
                      <div className="absolute top-6 left-0 bg-white border border-black p-3 text-[10px] uppercase font-bold tracking-widest z-10 shadow-lg w-52 text-black">
                        <p className="mb-2 border-b border-border pb-1">Tax Rules ({currentShippingCountry})</p>
                        {isIndianDestination ? (
                          <p className="text-muted-foreground leading-relaxed">
                            Item {'>'} ₹{taxSettings.indianThreshold}: {taxSettings.indianHighRate}% GST<br/>
                            Item {'<='} ₹{taxSettings.indianThreshold}: {taxSettings.indianLowRate}% GST
                          </p>
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">
                            International Order ({currentShippingCountry}):<br/>
                            Tax Rate: {taxSettings.nonIndianRate || 0}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="font-bold">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span className="uppercase tracking-widest flex items-center gap-1">
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-black pt-4">
                <span className="font-bold uppercase tracking-widest text-lg">Total</span>
                <span className="font-bold text-2xl">₹{total.toFixed(2)}</span>
              </div>

              {/* Billing Queries Note */}
              <div className="mt-4 pt-3 border-t border-border/60">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Note:</span> if any queries do refer to terms and conditions of <Link to="/terms" className="underline hover:text-black font-semibold">Billing policy</Link> and also do check <Link to="/help" className="underline hover:text-black font-semibold">Help</Link>
                </p>
              </div>
            </section>

            {/* Payment Section */}
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Cashfree Payment Gateway Option */}
                <label className={`block border p-5 cursor-pointer transition-all ${paymentMethod === 'CASHFREE' ? 'border-black bg-white shadow-sm ring-1 ring-black' : 'border-border bg-white hover:border-black/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="CASHFREE" 
                        checked={paymentMethod === 'CASHFREE'}
                        onChange={() => setPaymentMethod('CASHFREE')}
                        className="w-4 h-4 accent-black cursor-pointer"
                      />
                      <div>
                        <span className="font-bold uppercase text-sm tracking-wider block">Cashfree Payment Gateway</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Instant • Secure 256-Bit SSL Encrypted</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded uppercase tracking-widest">Recommended</span>
                  </div>

                  {paymentMethod === 'CASHFREE' && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pay securely using UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit Cards, Net Banking, or Digital Wallets powered by Cashfree.
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted border border-border text-foreground">UPI / GPay / PhonePe</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted border border-border text-foreground">Visa / Mastercard / RuPay</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted border border-border text-foreground">Net Banking (50+ Banks)</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted border border-border text-foreground">Wallets & PayLater</span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery Option */}
                <label className={`block border p-5 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-black bg-white shadow-sm ring-1 ring-black' : 'border-border bg-white hover:border-black/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="w-4 h-4 accent-black cursor-pointer"
                      />
                      <div>
                        <span className="font-bold uppercase text-sm tracking-wider block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Pay cash when package arrives</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isProcessing ? 'Processing...' : `Place Order • ₹${total.toFixed(2)}`}
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
              By placing your order, you agree to the H&S <Link to="/terms" target="_blank" className="underline font-semibold text-foreground hover:text-black">Terms & Conditions</Link> and <Link to="/terms#cancellation" target="_blank" className="underline font-semibold text-foreground hover:text-black">Cancellation Policy</Link>.
            </p>
          </form>
        </div>
      </div>
      
      {/* Cancellation Policy Popup Modal */}
      <AnimatePresence>
        {showCancellationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-border p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowCancellationModal(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase tracking-wider text-base text-foreground">
                    Cancellation Policy Notice
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                    Order Confirmation
                  </p>
                </div>
              </div>

              <div className="bg-muted/40 border border-border p-4 mb-6 rounded-sm">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  “I am aware that there is a 50% cancellation fee in first 36 hrs and 100% post 36 hrs as per <Link to="/terms" target="_blank" className="underline font-bold hover:text-black">Terms and Condition Policies of H&S</Link>”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCancellationModal(false)}
                  className="w-full sm:w-auto px-5 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executePlaceOrder}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
                className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4">Order Confirmed!</h2>
              <p className="text-muted-foreground uppercase tracking-widest text-sm mb-8">Thank you for your purchase.</p>
              
              <div className="w-12 h-1 bg-foreground/10 overflow-hidden relative rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-foreground"
                />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4 font-bold">Redirecting to tracking...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
