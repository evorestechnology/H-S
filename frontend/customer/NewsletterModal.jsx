import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Show newsletter modal after 3 seconds if not already closed in this session
    const hasSeen = sessionStorage.getItem('hs_newsletter_dismissed');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hs_newsletter_dismissed', 'true');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md p-8 bg-black border border-neutral-800 rounded-none shadow-2xl text-white overflow-hidden"
          >
            {/* Top decorative gradient border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-neutral-200 to-red-600" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {!submitted ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 mb-1">
                  <Sparkles size={22} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold tracking-wider uppercase font-mono">
                  Join the H&S Inner Circle
                </h3>
                <p className="text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
                  Be the first to access limited street drops, exclusive discounts, and secret editorial releases.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-xs font-mono tracking-wider text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="text-2xl font-bold font-mono tracking-wider text-white">
                  THANK YOU!
                </div>
                <p className="text-sm font-medium text-neutral-300 tracking-wide leading-relaxed">
                  We appreciate your interest in our brand stay tuned for updates
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
