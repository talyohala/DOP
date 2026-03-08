import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CrystalBoost = ({ triggerId, x, y, onComplete }) => {
  if (!triggerId) return null;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        key={triggerId}
        initial={{ scale: 0, opacity: 1, rotate: -20 }}
        animate={{ scale: 2, opacity: 0, rotate: 20 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute z-50 pointer-events-none drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
        style={{ left: x - 50, top: y - 50 }} // מיקום מדויק לפי הלחיצה
      >
        {/* אייקון הקריסטל (יהלום) */}
        <svg width="100" height="100" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 22 22 7 12 2" />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrystalBoost;
