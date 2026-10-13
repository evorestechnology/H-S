import { useEffect, useState } from "react";
import apiClient from "../../shared/services/apiClient";

const Adjustments = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await apiClient.get("/manufacturer-adjustments");
    setItems(Array.isArray(data) ? data : data.data || []);
  };

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const review = async (id, action) => {
    try { await apiClient.patch(`/manufacturer-adjustments/${id}/review`, { action }); await load(); }
    catch (err) { setError(err.message); }
  };

  const pay = async (id) => {
    try { await apiClient.post(`/manufacturer-adjustments/${id}/pay`); await load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6"><p className="text-xs uppercase tracking-widest text-neutral-500">Admin finance</p><h1 className="text-2xl font-semibold">Other manufacturer payments</h1><p className="text-sm text-neutral-500 mt-1">Approve adjustment requests and record payments outside order settlements.</p></div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="bg-white border rounded-xl overflow-hidden">
        {items.length === 0 ? <p className="p-5 text-sm text-neutral-500">No manufacturer adjustment requests.</p> : items.map((item) => (
          <div key={item.id} className="p-5 border-b last:border-b-0 flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-medium">{item.manufacturerName} · ₹{Number(item.amount).toFixed(2)}</p><p className="text-sm text-neutral-600 mt-1">{item.reason}</p><p className="text-xs text-neutral-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p></div>
            <div className="flex items-center gap-2">
              {item.status === "PENDING" && <><button className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm" onClick={() => review(item.id, "APPROVE")}>Accept</button><button className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm" onClick={() => review(item.id, "REJECT")}>Reject</button></>}
              {item.status === "APPROVED" && item.paymentStatus !== "PAID" && <button className="px-3 py-2 rounded-lg bg-black text-white text-sm" onClick={() => pay(item.id)}>Mark paid</button>}
              {item.status !== "PENDING" && <span className="text-sm text-neutral-500">{item.status === "APPROVED" ? (item.paymentStatus === "PAID" ? "Paid" : "Approved · unpaid") : "Rejected"}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Adjustments;
