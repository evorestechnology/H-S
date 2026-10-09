import "./WalletTable.css";
import { CheckCircle2, Clock, Sliders, IndianRupee, Sparkles, XCircle } from "lucide-react";
const WalletTable = ({ transactions, onMarkAsPaid, onToggleAdjustment }) => {
    return (<div className="wallet-table-card">
            <div className="table-card-header">
                <div>
                    <h2>Financial Transaction Ledger</h2>
                    <p className="header-subtitle">Manufacturer payments, price adjustments, settlement dates, and net earnings</p>
                </div>
                <div className="header-badge">
                    <Sparkles size={14}/>
                    <span>{transactions.length} Records Shown</span>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="wallet-ledger-table">
                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>GROSS SALE</th>
                            <th>GST COLLECTED</th>
                            <th>MANUFACTURER PAYMENT</th>
                            <th>ADJUSTMENT STATUS</th>
                            <th>PAYMENT STATUS</th>
                            <th>PAID DATE</th>
                            <th>OUR EARNINGS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (<tr>
                                <td colSpan={9} className="empty-state-cell">
                                    <div className="empty-table-state">
                                        <Clock size={32}/>
                                        <p>No financial ledger records match the selected filter.</p>
                                    </div>
                                </td>
                            </tr>) : (transactions.map((txn) => {
            const isPaid = txn.paymentStatus === "Paid";
            return (<tr key={txn.id} className={isPaid ? "row-paid" : "row-unpaid"}>
                                        {/* 1. Order ID */}
                                        <td className="col-order-id">
                                            <div className="order-id-wrapper">
                                                <span className="order-id-badge">#{txn.orderId}</span>
                                                <span className="tx-id-sub">{txn.id}</span>
                                            </div>
                                        </td>

                                        {/* Gross Sale Value */}
                                        <td className="col-gross">
                                            <span className="amount-val">₹{txn.grossSaleValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </td>

                                        {/* GST Collected */}
                                        <td className="col-gst">
                                            <span className="amount-val gst-val">₹{(txn.gstCollected ?? txn.gstAmount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </td>

                                        {/* 2. Manufacturer Payment */}
                                        <td className="col-mfg-payment">
                                            <div className="mfg-payment-info">
                                                <span className="amount-val mfg-val">₹{txn.manufacturerPayment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                                <span className="mfg-name">{txn.manufacturerName}</span>
                                            </div>
                                        </td>

                                        {/* 3. Adjusted / Not Adjusted */}
                                        <td className="col-adjusted">
                                            {(() => {
                    const status = txn.adjustmentStatus || (txn.isAdjusted ? "Approved" : "None");
                    if (status === "Approved" || (txn.isAdjusted && status !== "Rejected" && status !== "Pending Approval")) {
                        return (<div className="adj-badge-container">
                                                            <span className="badge-adj-adjusted" title="Price adjustment approved">
                                                                <Sliders size={12}/> Adjusted
                                                            </span>
                                                            {txn.adjustmentAmount > 0 && (<span className="adj-amount-tag">+₹{txn.adjustmentAmount.toFixed(2)}</span>)}
                                                        </div>);
                    }
                    if (status === "Rejected") {
                        return (<div className="adj-badge-container">
                                                            <span className="badge-adj-rejected" title="Price adjustment request was rejected">
                                                                <XCircle size={12}/> Rejected
                                                            </span>
                                                        </div>);
                    }
                    if (status === "Pending Approval") {
                        return (<div className="adj-badge-container">
                                                            <span className="badge-adj-pending" title="Price adjustment request is awaiting approval">
                                                                <Clock size={12}/> Pending (+₹{txn.adjustmentAmount.toFixed(2)})
                                                            </span>
                                                        </div>);
                    }
                    return (<span className="badge-adj-none">
                                                        Not Adjusted
                                                    </span>);
                })()}
                                        </td>

                                        {/* 4. Payment Status [P / NP] */}
                                        <td className="col-status">
                                            {isPaid ? (<span className="status-badge-paid" title="Paid (Settled)">
                                                    <CheckCircle2 size={13}/> Paid [P]
                                                </span>) : (<span className="status-badge-unpaid" title="Not Paid (Pending)">
                                                    <Clock size={13}/> Not Paid [NP]
                                                </span>)}
                                        </td>

                                        {/* 5. Paid Date */}
                                        <td className="col-paid-date">
                                            {txn.paidDate ? (<div className="paid-date-info">
                                                    <span className="date-val">{txn.paidDate}</span>
                                                </div>) : (<span className="date-pending">Pending Settlement</span>)}
                                        </td>

                                        {/* Our Earnings */}
                                        <td className="col-our-earnings">
                                            <span className="earnings-tag">
                                                +₹{txn.ourEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="col-actions text-right">
                                            <div className="action-buttons">
                                                {!isPaid && (<button className="btn-action-pay" onClick={() => onMarkAsPaid(txn.id)} title="Mark Payout as Paid to Manufacturer">
                                                        <IndianRupee size={13}/> Mark Paid
                                                    </button>)}

                                                <button className={`btn-action-toggle-adj ${txn.isAdjusted ? "active-adj" : ""}`} onClick={() => onToggleAdjustment(txn.id)} title={txn.isAdjusted ? "Remove Price Adjustment" : "Apply Price Adjustment Bonus"}>
                                                    <Sliders size={13}/> {txn.isAdjusted ? "Edit Adj" : "Add Adj"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>);
        }))}
                    </tbody>
                </table>
            </div>
        </div>);
};
export default WalletTable;
