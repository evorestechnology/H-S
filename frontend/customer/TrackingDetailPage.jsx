/**
 * @BACKEND_TEAM - ORDER TRACKING INTEGRATION:
 * 
 * 1. Fetch Tracking Data:
 *    - Query `GET /api/orders/track?orderId={id}` using the ID from the URL params.
 *    - The API should return full details: { orderId, date, status, estimatedDelivery, shipperName, trackingId, trackingLink, address, items, history }
 */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Package, MapPin, ExternalLink, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../shared/lib/axios';

const formatOrderDate = (dateVal) => {
  if (!dateVal) return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    const parts = dateVal.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return new Date(dateVal).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

export default function TrackingDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const cashfreeOrderId = searchParams.get('cashfree_order_id');
        if (cashfreeOrderId && orderId) {
          try {
            await axiosInstance.post('/orders/cashfree/verify', { orderId });
          } catch (verifyErr) {
            console.error('Error verifying Cashfree payment:', verifyErr);
          }
        }
        const res = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(res.data.data || res.data.order || res.data);
      } catch (error) {
        console.error('Error fetching order tracking:', error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="pt-32 text-center text-muted-foreground uppercase tracking-widest font-bold text-sm">Loading Tracking Data...</div>;
  }

  if (!order || !order.id) {
    return <div className="pt-32 text-center text-red-500 uppercase tracking-widest font-bold text-sm">Order Not Found</div>;
  }

  let address = order.shippingAddress;
  if (typeof order.shippingAddress === 'string') {
    try {
      address = JSON.parse(order.shippingAddress);
    } catch (e) {
      console.warn("Failed to parse shippingAddress JSON, falling back to string:", e);
      address = { street: order.shippingAddress };
    }
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8">
        <Link to="/track-orders" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-muted-foreground transition-colors w-fit border-b border-black pb-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </Link>
      </div>

      <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl uppercase font-bold tracking-tight">Order Tracking</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Order #{order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tracking Hero & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking Card */}
          <div className="bg-white border border-border shadow-sm p-8 sm:p-10">

            {/* Horizontal Timeline */}
            <div className="relative mb-16 px-2 sm:px-8">
              {(() => {
                const status = (order.status || '').toUpperCase();
                const isDelivered = status === 'DELIVERED';
                const isShipping = status === 'SHIPPING' || status === 'SHIPPED';
                const isInProgress = !isDelivered && !isShipping;
                
                const validDate = order.createdAt || order.orderedDate || order.date;
                const deliveryDate = order.completedDate || order.updatedAt || order.deliveredAt || validDate;

                return (
                  <>
                    {/* Background dotted line */}
                    <div className="absolute top-4 left-10 right-10 h-0.5 border-t-2 border-dashed border-border z-0"></div>
                    {/* Active solid line */}
                    <div className="absolute top-4 left-10 h-1 bg-black transition-all duration-1000 z-0" style={{ width: isDelivered ? '100%' : (isShipping ? '50%' : '0%'), marginTop: '-1px' }}></div>
                    <div className="flex justify-between relative z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-4 border-black bg-black text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                          <Check className="w-4 h-4" />
                        </div>
                        <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center">In Progress</p>
                        <p className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold text-center">{formatOrderDate(validDate)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-4 ${(isShipping || isDelivered) ? 'border-black bg-black' : 'border-border bg-white'} flex items-center justify-center ${(isShipping || isDelivered) ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)]' : ''}`}>
                          {isShipping && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                          {isDelivered && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`mt-4 text-[10px] uppercase tracking-widest font-bold text-center ${isInProgress && 'text-muted-foreground'}`}>Shipping</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-4 ${isDelivered ? 'border-black bg-black' : 'border-border bg-white'} flex items-center justify-center ${isDelivered ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)]' : ''}`}>
                          {isDelivered && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`mt-4 text-[10px] uppercase tracking-widest font-bold text-center ${!isDelivered && 'text-muted-foreground'}`}>Delivered</p>
                        {isDelivered && (
                          <p className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold text-center">{formatOrderDate(deliveryDate)}</p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Courier & Live Tracking Info */}
            {((order.shipperName && order.shipperName !== 'None') || (order.trackingId && order.trackingId !== 'None')) && (
              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-neutral-50 p-6 rounded-lg border">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Carrier / Courier</p>
                  <p className="text-base font-bold text-black tracking-wide">
                    {order.shipperName && order.shipperName !== 'None' ? order.shipperName : 'Standard Delivery'}
                  </p>
                  {order.trackingId && order.trackingId !== 'None' && (
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      Tracking ID: <span className="text-black font-bold select-all">{order.trackingId}</span>
                    </p>
                  )}
                </div>

                {order.trackingLink && order.trackingLink !== 'None' && (
                  <div>
                    <a
                      href={order.trackingLink.startsWith('http') ? order.trackingLink : `https://${order.trackingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm rounded-sm"
                    >
                      <span>Track on {order.shipperName && order.shipperName !== 'None' ? order.shipperName : 'Carrier'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Shipment Details */}
        <div className="space-y-8">
          
          {/* Items Card */}
          <div className="bg-white border border-border shadow-sm p-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Items in Shipment
            </h3>
            <div className="space-y-4">
              {(order.orderItems || order.items || []).map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted relative flex-shrink-0">
                    <img 
                      src={item.image || item.productDetails?.frontViewUrl || item.product?.coverPhoto || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <Link to={`/product/${item.productId}`} className="font-bold uppercase tracking-widest text-xs hover:underline underline-offset-4 line-clamp-2">{item.name}</Link>
                    <div className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2 font-bold space-y-1">
                      <p>Size: {item.size}</p>
                      {item.color && <p>Color: {item.color}</p>}
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white border border-border shadow-sm p-6">
             <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Address
            </h3>
            <div className="text-sm font-medium uppercase tracking-widest leading-relaxed text-muted-foreground">
              <p className="text-black font-bold mb-2">{address?.name}</p>
              <p>{address?.street}</p>
              <p>{address?.city}</p>
              <p>{address?.country}</p>
            </div>
          </div>

          {/* Payment & Coupon Summary Card */}
          <div className="bg-white border border-border shadow-sm p-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Payment Status</span>
                <span className="font-bold text-black uppercase tracking-wider text-xs">{order.paymentStatus || 'PENDING'}</span>
              </div>
              {(order.couponApplied || order.couponCode) && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon ({order.couponCode || 'Applied'})</span>
                  <span>-₹{(Number(order.couponDiscount) || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 font-bold text-base">
                <span>Total Amount</span>
                <span>₹{(Number(order.totalPrice || order.amountPaid) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
