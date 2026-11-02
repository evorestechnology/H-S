import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementBanner() {
  const [copied, setCopied] = useState(false);
  const couponCode = 'WELCOME@H&S';

  const handleCopy = (e) => {
    e?.stopPropagation?.();
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success(`Coupon "${couponCode}" copied! 10% OFF on your cart value.`, {
      id: 'coupon-copy-toast',
      duration: 2500,
      icon: '✨',
      style: {
        background: '#0a0a0a',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.15)',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      role="region"
      aria-label="Promotional Offer"
      className="w-full bg-black text-white border-b border-white/10 py-1.5 sm:py-2 px-3 sm:px-6 relative z-40 transition-all duration-300 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        {/* Left Stylish Accent Icon */}
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0 animate-pulse hidden xs:inline-block" aria-hidden="true" />

        {/* Banner Text with Premium Styling */}
        <div className="text-[10px] xs:text-[11px] sm:text-xs font-medium tracking-wider uppercase text-neutral-200 flex items-center flex-wrap justify-center gap-x-1.5 gap-y-0.5">
          <span className="text-neutral-300">Use Cuppon</span>
          
          {/* Interactive Coupon Pill */}
          <button
            type="button"
            onClick={handleCopy}
            title="Click to copy coupon code WELCOME@H&S"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-white bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 hover:border-white/40 transition-all cursor-pointer shadow-xs normal-case group"
          >
            <span className="tracking-widest text-[10px] xs:text-[11px] sm:text-xs text-amber-200 group-hover:text-white transition-colors">{couponCode}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400 animate-in fade-in zoom-in" />
            ) : (
              <Copy className="w-2.5 h-2.5 text-neutral-400 group-hover:text-white transition-colors" />
            )}
          </button>

          <span className="text-neutral-300">to claim</span>
          <span className="font-extrabold text-amber-400 tracking-wider">10% OFF</span>
          <span className="text-neutral-300">on your cart value</span>
          <span className="normal-case text-xs">😉</span>
        </div>

        {/* Right Stylish Accent Icon */}
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0 animate-pulse hidden xs:inline-block" aria-hidden="true" />
      </div>
    </div>
  );
}
