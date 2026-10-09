import "./CouponsHeader.css";
import { TicketPlus } from "lucide-react";
const CouponsHeader = ({ onCreateCoupon }) => {
    return (<div className="coupons-header">
            <div className="coupons-header-left">
                <h1>Coupons</h1>
                <p>Create and manage public store discount codes and exclusive private promos.</p>
            </div>

            <button className="create-coupon-btn" onClick={onCreateCoupon}>
                <TicketPlus size={18}/>
                <span>Create a Coupon</span>
            </button>
        </div>);
};
export default CouponsHeader;
