import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageLightboxModal({ isOpen, onClose, images = [], currentIndex = 0, setCurrentIndex }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex?.((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex?.((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose, setCurrentIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex?.(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex?.(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none"
      >
        {/* Top Header Controls */}
        <div className="w-full max-w-7xl flex items-center justify-between z-10 text-white/90 pt-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            {currentIndex + 1} / {images.length}
          </span>
          
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-white/60 hidden sm:inline-block font-mono">Press ESC to close</span>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 hover:scale-105"
              aria-label="Close Large View"
              title="Close Full Image View"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Image Display - Uncropped full height & width */}
        <div 
          className="relative flex-1 w-full max-w-7xl flex items-center justify-center my-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/30 transition-all z-20 hover:scale-110 shadow-2xl"
              aria-label="Previous Image"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.img
            key={currentImg}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            src={currentImg}
            alt="Full size view"
            className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl border border-white/10 bg-black/20"
          />

          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/30 transition-all z-20 hover:scale-110 shadow-2xl"
              aria-label="Next Image"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto max-w-full p-2 z-10 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex?.(idx);
                }}
                className={`w-14 h-18 sm:w-16 sm:h-20 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 bg-black/40 ${
                  idx === currentIndex ? 'border-white scale-105 shadow-xl ring-2 ring-white/50' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
