import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full pt-28 sm:pt-32 md:pt-36 pb-4 sm:pb-8 bg-white"
    >
      <img 
        src="/pranav bro.png" 
        alt="H&S Hero Banner" 
        className="w-full h-auto object-contain block"
      />
    </motion.div>
  );
}
