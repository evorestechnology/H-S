import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ChevronDown, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const InstagramIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const [email, setEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const toggleSection = (section) => {
    setOpenMobileSection(openMobileSection === section ? null : section);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setShowPopup(true);
    toast.success('Thank You For Joining the H&S Exclusive Club, Stay Tuned for the Updates');
    setEmail('');
  };

  const shopLinks = [
    { name: 'New Arrivals', path: '/category/new-arrivals' },
    { name: 'Best Sellers', path: '/category/best-sellers' },
  ];

  const careLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'Terms & Conditions', path: '/terms' },
  ];

  return (
    <footer className="bg-foreground text-background pt-12 md:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Layout (md:hidden) */}
        <div className="block md:hidden space-y-6 mb-8">
          {/* Brand Info */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-3 tracking-tighter">H&S</h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
              UNISEX STREETWEAR COLLECTIVE PREMIERE INDIAN STREET FASHION STUDIO.<br />
              Designed for the fearless.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/your-page" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-background transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-muted-foreground/20 pt-6">
            <h4 className="font-heading font-bold mb-2 uppercase tracking-wider text-xs">Join The Collective</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Subscribe to our newsletter for exclusive drops and know what's Trending.
            </p>
            <form className="flex border border-muted-foreground/30 focus-within:border-background transition-colors" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full p-3 text-xs focus:outline-none text-background placeholder:text-muted-foreground"
                required
              />
              <button 
                type="submit" 
                className="p-3 bg-foreground text-background border-l border-muted-foreground/30 hover:bg-white hover:text-black transition-colors"
                aria-label="Subscribe"
              >
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Accordion 1: Shop */}
          <div className="border-t border-muted-foreground/20 pt-3">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full flex justify-between items-center py-2 text-left"
            >
              <h4 className="font-heading font-bold uppercase tracking-wider text-xs">Shop</h4>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openMobileSection === 'shop' ? 'rotate-180' : ''}`} />
            </button>
            {openMobileSection === 'shop' && (
              <ul className="space-y-3 pt-3 pb-2 pl-1">
                {shopLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs text-muted-foreground hover:text-background transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accordion 2: Customer Care */}
          <div className="border-t border-b border-muted-foreground/20 py-3">
            <button
              type="button"
              onClick={() => toggleSection('care')}
              className="w-full flex justify-between items-center py-2 text-left"
            >
              <h4 className="font-heading font-bold uppercase tracking-wider text-xs">Customer Care</h4>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openMobileSection === 'care' ? 'rotate-180' : ''}`} />
            </button>
            {openMobileSection === 'care' && (
              <ul className="space-y-3 pt-3 pb-2 pl-1">
                {careLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs text-muted-foreground hover:text-background transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Desktop Layout (hidden md:grid) */}
        <div className="hidden md:grid grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1">
            <h3 className="font-heading text-2xl font-bold mb-4 tracking-tighter">H&S</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              UNISEX STREETWEAR COLLECTIVE PREMIERE INDIAN STREET FASHION STUDIO.<br />
              Designed for the fearless.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/your-page" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-background transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-background transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Customer Care</h4>
            <ul className="space-y-3">
              {careLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-background transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Join The Collective</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for exclusive drops and know what's Trending
            </p>
            <form className="flex border border-muted-foreground/30 focus-within:border-background transition-colors" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full p-3 text-sm focus:outline-none text-background placeholder:text-muted-foreground"
                required
              />
              <button 
                type="submit" 
                className="p-3 bg-foreground text-background border-l border-muted-foreground/30 hover:bg-white hover:text-black transition-colors"
                aria-label="Subscribe"
              >
                <Mail className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-muted-foreground/20 md:border-transparent flex justify-center items-center text-xs text-muted-foreground text-center">
          <p>&copy; 2026 H&S COLLECTIVE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>

      {/* Subscription Success Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-black border border-neutral-200 p-8 max-w-md w-full shadow-2xl relative text-center">
            <button 
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase tracking-tight mb-3">
              H&S Exclusive Club
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6 font-medium leading-relaxed uppercase tracking-wider">
              Thank You For Joining the H&S Exclusive Club, Stay Tuned for the Updates
            </p>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
