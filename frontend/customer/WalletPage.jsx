/**
 * @BACKEND_TEAM - WALLET INTEGRATION:
 * 
 * 1. Fetch Balance:
 *    - On mount, query `GET /api/user/wallet` to retrieve current store credit/balance.
 * 2. Add Funds:
 *    - "Add Funds" should open a payment modal (Stripe) to purchase store credit.
 *    - On success, `POST /api/user/wallet/add` to update the user's balance.
 */
export default function WalletPage() {
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 min-h-screen text-center">
      <h1 className="font-heading text-4xl uppercase font-bold mb-8">My Wallet</h1>
      <div className="border border-border p-12 bg-muted/30">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Current Balance</p>
        <p className="text-5xl font-bold font-heading mb-8">₹0.00</p>
        <button className="px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-sm hover:bg-black/80 transition-colors">
          Add Funds
        </button>
      </div>
    </div>
  );
}
