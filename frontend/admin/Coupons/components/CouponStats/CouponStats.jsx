import "./CouponStats.css";
import { Ticket, Eye, Lock, CheckCircle2 } from "lucide-react";
const CouponStats = ({ summary }) => {
    if (!summary)
        return null;
    return (<div className="coupon-stats">
            <div className="coupon-card">
                <div>
                    <span className="card-title">TOTAL COUPONS</span>
                    <h2>{summary.totalCoupons}</h2>
                </div>
                <div className="card-icon total">
                    <Ticket size={22}/>
                </div>
            </div>

            <div className="coupon-card">
                <div>
                    <span className="card-title">PUBLIC COUPONS</span>
                    <h2>{summary.publicCoupons}</h2>
                </div>
                <div className="card-icon public">
                    <Eye size={22}/>
                </div>
            </div>

            <div className="coupon-card">
                <div>
                    <span className="card-title">PRIVATE COUPONS</span>
                    <h2>{summary.privateCoupons}</h2>
                </div>
                <div className="card-icon private">
                    <Lock size={22}/>
                </div>
            </div>

            <div className="coupon-card">
                <div>
                    <span className="card-title">ACTIVE COUPONS</span>
                    <h2>{summary.activeCoupons}</h2>
                </div>
                <div className="card-icon active">
                    <CheckCircle2 size={22}/>
                </div>
            </div>
        </div>);
};
export default CouponStats;
