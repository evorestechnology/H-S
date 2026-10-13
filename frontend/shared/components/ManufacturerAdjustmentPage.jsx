import { useEffect, useState } from "react";
import { IndianRupee, Send } from "lucide-react";
import apiClient from "../services/apiClient";

const ManufacturerAdjustmentPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdjustments = async () => {
    const data = await apiClient.get("/manufacturer-adjustments");
    setAdjustments(Array.isArray(data) ? data : data.data || []);
  };

  useEffect(() => {
    loadAdjustments().catch((err) => setError(err.message));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiClient.post("/manufacturer-adjustments", { amount: Number(amount), reason: reason.trim() });
      setAmount("");
      setReason("");
      setMessage("Adjustment request submitted to Admin.");
      await loadAdjustments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Manufacturer portal</p>
        <h1 className="text-2xl font-semibold">Other adjustment requests</h1>
        <p className="text-sm text-neutral-500 mt-1">Request a payment for work that is not linked to an order.</p>
      </div>
      <form onSubmit={submit} className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (₹)</label>
          <div className="flex items-center border rounded-lg px-3">
            <IndianRupee size={16} />
            <input className="w-full p-2 outline-none" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea className="w-full border rounded-lg p-3 min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2" type="submit">
          <Send size={15} /> Submit request
        </button>
      </form>
      <div className="mt-6 bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b font-medium">Request history</div>
        {adjustments.length === 0 ? <p className="p-5 text-sm text-neutral-500">No adjustment requests yet.</p> : adjustments.map((item) => (
          <div key={item.id} className="px-5 py-4 border-b last:border-b-0 flex justify-between gap-4">
            <div><p className="font-medium">₹{Number(item.amount).toFixed(2)}</p><p className="text-sm text-neutral-500">{item.reason}</p></div>
            <div className="text-right text-sm"><p>{item.status}</p><p className="text-neutral-500">{item.paymentStatus === "PAID" ? "Paid" : "Payment pending"}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManufacturerAdjustmentPage;
