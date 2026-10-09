import "./WalletTable.css";
import { CheckCircle2, Clock, Sliders, XCircle } from "lucide-react";
const WalletTable = ({ records }) => {
    return (<div className="wallet-table-container">
            <div className="table-header-row">
                <h2>Manufacturing Earnings</h2>
            </div>
            <table className="wallet-table">
                <thead>
                    <tr>
                        <th>ORDER ID</th>
                        <th>ORDER DATE</th>
                        <th>ITEM DETAILS</th>
                        <th>MANUFACTURER PAYMENT</th>
                        <th>ADJUSTMENT STATUS</th>
                        <th>PAYMENT STATUS</th>
                        <th>PAID DATE</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (<tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                                No earnings records found matching the filter.
                            </td>
                        </tr>) : (records.map((rec) => {
            const isPaid = rec.paymentStatus === "Paid";
            const adjStatus = rec.adjustmentStatus || (rec.isAdjusted ? "Approved" : "None");
            return (<tr key={rec.id}>
                                    <td className="col-id">#{rec.orderId}</td>
                                    <td>{rec.orderedDate}</td>
                                    <td><strong>{rec.itemName}</strong> ({rec.size} • {rec.color})</td>
                                    <td className="credit-total">
                                        ₹{rec.manufacturerPayment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        {adjStatus === "Approved" || (rec.isAdjusted && adjStatus !== "Rejected" && adjStatus !== "Pending Approval") ? (<span className="badge-adj-mfg" title="Price adjustment approved by Master Admin">
                                                <Sliders size={12}/> Adjusted (+₹{rec.adjustmentAmount})
                                            </span>) : adjStatus === "Rejected" ? (<span className="badge-adj-mfg-rejected" title="Price adjustment request was rejected by Master Admin">
                                                <XCircle size={12}/> Rejected
                                            </span>) : adjStatus === "Pending Approval" ? (<span className="badge-adj-mfg-pending" title="Price adjustment request is awaiting Master Admin approval">
                                                <Clock size={12}/> Pending (+₹{rec.adjustmentAmount})
                                            </span>) : (<span className="badge-adj-mfg-none">Not Adjusted</span>)}
                                    </td>
                                    <td>
                                        {isPaid ? (<span className="badge-status-paid">
                                                <CheckCircle2 size={12}/> Paid [P]
                                            </span>) : (<span className="badge-status-unpaid">
                                                <Clock size={12}/> Not Paid [NP]
                                            </span>)}
                                    </td>
                                    <td className="col-notes">{rec.paidDate || "Pending"}</td>
                                </tr>);
        }))}
                </tbody>
            </table>
        </div>);
};
export default WalletTable;
