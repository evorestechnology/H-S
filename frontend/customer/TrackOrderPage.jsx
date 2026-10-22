/**
 * @BACKEND_TEAM - ORDER HISTORY INTEGRATION:
 * 
 * 1. Order History:
 *    - Query `GET /api/orders/me` to populate the `mockOrders` array.
 *    - The API should return full order details including `status`, `total`, `items` (with images/sizes).
 * 2. Track Order Action:
 *    - The "Track Order" button should trigger a modal or redirect to a dedicated tracking page: `/orders/track?orderId={id}`.
 */
import { Package, Download, FileText, RotateCcw, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export default function TrackOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/orders/myorders');
        setOrders(res.data.data || res.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 max-w-5xl mx-auto px-4 sm:px-6 min-h-[100dvh]">
      <h1 className="font-heading text-2xl sm:text-4xl uppercase font-bold mb-8 sm:mb-12 text-center border-b border-border pb-6">Order History</h1>
      
      {/* Optional image preview modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 w-full h-[100dvh] z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white max-w-xl w-[95vw] sm:w-full p-4 rounded-lg shadow-2xl relative max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Refund Receipt Proof
              </span>
              <button 
                type="button" 
                onClick={() => setPreviewImage(null)} 
                className="text-gray-500 hover:text-black font-bold text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-neutral-100 p-2 rounded">
              <img src={previewImage} alt="Refund Receipt" className="max-h-[65vh] w-auto object-contain rounded" />
            </div>
            <div className="mt-4 flex justify-end">
              <a 
                href={previewImage} 
                download="Refund-Receipt.png"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold">
            Loading Orders...
          </div>
        ) : orders.length > 0 ? orders.map(order => {
          const isCancelled = order.status === 'CANCELED' || order.status === 'Cancelled';
          const refundStatus = order.refundStatus || (isCancelled ? 'Refund Pending' : null);
          const isRefunded = refundStatus === 'Refunded';

          return (
          <div key={order.id} className="border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
            
            {/* Card Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/20 p-5 border-b border-border gap-6">
              
              {/* Left Side: Details & Status */}
              <div className="flex flex-wrap gap-8 text-sm items-center">
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order Placed</p>
                  <p className="font-bold">{formatOrderDate(order.createdAt || order.orderedDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Total</p>
                  <p className="font-bold">₹{(order.totalPrice || order.amountPaid || 0).toFixed(2)}</p>
                </div>
                {(order.couponApplied || order.couponCode) && (
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Coupon Applied</p>
                    <p className="font-bold text-emerald-600 flex items-center gap-1">
                      <span>{order.couponCode || 'Yes'}</span>
                      {order.couponDiscount > 0 && <span className="text-[11px]">(-₹{Number(order.couponDiscount).toFixed(2)})</span>}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  {isCancelled && refundStatus && (
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1 ${
                      isRefunded ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <RotateCcw className="w-3 h-3" />
                      Refund: {refundStatus}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Right Side: Order ID & Actions */}
              <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t border-border/50 md:border-0 pt-4 md:pt-0">
                <div className="text-sm min-w-0">
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order #</p>
                  <p className="font-bold uppercase tracking-widest text-xs sm:text-sm break-all">{order.id}</p>
                </div>
                <div className="h-10 w-px bg-border hidden md:block"></div>
                <Link to={`/track/${order.id}`} className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
                  Track Order
                </Link>
              </div>
            </div>

            {/* Cancelled & Refund Alert Banner */}
            {isCancelled && (
              <div className="bg-rose-50/60 border-b border-rose-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Order Cancelled</span>
                    {order.cancelReason && (
                      <span className="text-rose-600 font-normal normal-case">
                        — Reason: "{order.cancelReason}"
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-rose-700">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Refund Status: <strong className={isRefunded ? 'text-emerald-700' : 'text-amber-700'}>{refundStatus}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[11px]">
                      Amount: ₹{(Number(order.refundAmount ?? order.totalPrice) || 0).toFixed(2)}
                    </span>
                    {order.refundNote && (
                      <>
                        <span>•</span>
                        <span className="text-[11px] italic text-neutral-600">"{order.refundNote}"</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Refund Proof Image Download / View */}
                {order.refundImage ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(order.refundImage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-900 text-[11px] font-bold uppercase tracking-wider hover:bg-rose-100/50 transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Receipt
                    </button>
                    <a
                      href={order.refundImage}
                      download={`Refund-Receipt-Order-${order.id}.png`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Receipt
                    </a>
                  </div>
                ) : (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    {isRefunded ? 'Refund Processed' : 'Receipt Pending Processing'}
                  </div>
                )}
              </div>
            )}
            
            {/* Card Body */}
            <div className="p-6">
              <div className="space-y-6">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-6 border-b border-border/40 pb-6 last:border-0 last:pb-0">
                    <div className="w-20 h-24 bg-muted relative flex-shrink-0">
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
                      <Link to={`/product/${item.productId}`} className="font-bold uppercase tracking-widest text-sm hover:underline underline-offset-4 w-fit line-clamp-1">{item.name}</Link>
                      <div className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2 font-bold space-y-1">
                        <p>Size: {item.size}</p>
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center hidden sm:flex">
                      <Link to={`/product/${item.productId}`} className="text-[10px] font-bold uppercase tracking-widest border border-border px-4 py-2 hover:bg-muted transition-colors whitespace-nowrap">
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }) : (
          <div className="p-12 text-center border border-border border-dashed text-muted-foreground text-sm uppercase tracking-widest">
            No previous orders found.
          </div>
        )}
      </div>
    </div>
  );
}
