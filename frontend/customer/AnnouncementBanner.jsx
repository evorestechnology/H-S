import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function PromoItem({ couponCode, onCopy, copied }) {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 text-[10.5px] sm:text-xs tracking-wider whitespace-nowrap px-4 sm:px-6 leading-none">
      <span className="text-amber-400 text-xs" aria-hidden="true">✦</span>
      <span className="text-neutral-300 font-medium">Use Cuppon</span>
      
      <button
        type="button"
        onClick={onCopy}
        title="Click to copy coupon code WELCOME@H&S"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono font-bold text-amber-200 bg-amber-400/10 hover:bg-amber-400/25 active:scale-95 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-xs normal-case group"
      >
        <span className="tracking-widest">{couponCode}</span>
        {copied ? (
          <Check className="w-3 h-3 text-emerald-400 animate-in fade-in zoom-in" />
        ) : (
          <Copy className="w-2.5 h-2.5 text-amber-300/70 group-hover:text-amber-100 transition-colors" />
        )}
      </button>

      <span className="text-neutral-300 font-medium">to claim</span>
      <span className="font-extrabold text-amber-400 tracking-wider">10% OFF</span>
      <span className="text-neutral-300 font-medium">on your cart value</span>
      <span className="normal-case text-xs">😉</span>
      <span className="text-white/20 text-xs font-mono ml-2 sm:ml-4" aria-hidden="true">•</span>
    </div>
  );
}

export default function AnnouncementBanner({ isScrolled = false }) {
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
        background: '#09090b',
        color: '#ffffff',
        border: '1px solid rgba(251,191,36,0.3)',
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
      aria-label="Trending Promotional Marquee Announcement"
      className={`w-full bg-neutral-950 text-white overflow-hidden transition-all duration-300 ease-in-out relative z-10 select-none flex items-center ${
        isScrolled 
          ? 'h-0 opacity-0 -translate-y-full pointer-events-none border-b-0' 
          : 'h-7 sm:h-8 opacity-100 translate-y-0 border-b border-white/10 shadow-xs'
      }`}
    >
      <div 
        className="w-full overflow-hidden cursor-pointer flex items-center"
        onClick={handleCopy}
        title="Tap to copy coupon code WELCOME@H&S"
      >
        <div className="animate-marquee-smooth flex items-center">
          {/* Track A */}
          <div className="flex items-center flex-shrink-0">
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
          </div>
          {/* Track B (Identical for seamless infinite scroll) */}
          <div className="flex items-center flex-shrink-0">
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
            <PromoItem couponCode={couponCode} onCopy={handleCopy} copied={copied} />
          </div>
        </div>
      </div>
    </div>
  );
}
