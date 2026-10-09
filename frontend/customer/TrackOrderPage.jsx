/**
 * @BACKEND_TEAM - ORDER HISTORY INTEGRATION:
 * 
 * 1. Order History:
 *    - Query `GET /api/orders/me` to populate the `mockOrders` array.
 *    - The API should return full order details including `status`, `total`, `items` (with images/sizes).
 * 2. Track Order Action:
 *    - The "Track Order" button should trigger a modal or redirect to a dedicated tracking page: `/orders/track?orderId={id}`.
 */
import { Package } from 'lucide-react';
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
    <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-12 text-center border-b border-border pb-6">Order History</h1>
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold">
            Loading Orders...
          </div>
        ) : orders.length > 0 ? orders.map(order => (
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
                <div className="flex flex-col items-start">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              {/* Right Side: Order ID & Actions */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-border/50 md:border-0 pt-4 md:pt-0">
                <div className="text-sm">
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order #</p>
                  <p className="font-bold uppercase tracking-widest">{order.id}</p>
                </div>
                <div className="h-10 w-px bg-border hidden md:block"></div>
                <Link to={`/track/${order.id}`} className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                  Track Order
                </Link>
              </div>
            </div>
            
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
        )) : (
          <div className="p-12 text-center border border-border border-dashed text-muted-foreground text-sm uppercase tracking-widest">
            No previous orders found.
          </div>
        )}
      </div>
    </div>
  );
}
