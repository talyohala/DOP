import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Skull, Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // בודק אם המשתמש כבר ראה את המסך הזה בעבר
    const hasSeen = localStorage.getItem('dop_onboarding_done');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  // העברה אוטומטית של שקפים כל 4 שניות (כמו סטורי)
  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev === 2) {
          // עוצר בשקף האחרון
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isVisible, currentSlide]);

  const finishOnboarding = () => {
    localStorage.setItem('dop_onboarding_done', 'true');
    setIsVisible(false);
    toast.success('ברוך הבא למשחק! 🚀', { icon: '🔥' });
  };

  if (!isVisible) return null;

  const slides = [
    {
      icon: <Clock size={80} color="#fff" />,
      title: 'ברוך הבא ל-Dopamine',
      subtitle: 'כאן, זמן הוא המטבע החדש שלך. כל דרופ שעולה מקבל קוצב חיים.',
      color: '#007AFF'
    },
    {
      icon: <Skull size={80} color="#fff" />,
      title: 'סרטונים גוססים',
      subtitle: 'אם הטיימר מגיע ל-00:00:00, הדרופ מת ונמחק לנצח. אין היסטוריה. אין חרטות.',
      color: '#FF3B30'
    },
    {
      icon: <Zap size={80} color="#fff" />,
      title: 'תציל ותרוויח',
      subtitle: 'תן בוסט כדי להציל דרופים שאהבת. תרוויח זמן לארנק, וקנה קופונים אמיתיים בחנות!',
      color: '#FFCC00'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#0a0a0c', direction: 'rtl', display: 'flex', flexDirection: 'column' }}
    >
      {/* פסי התקדמות של סטורי למעלה */}
      <div style={{ display: 'flex', gap: 6, padding: '20px 16px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: i < currentSlide ? '100%' : '0%' }}
              animate={{ width: i === currentSlide ? '100%' : i < currentSlide ? '100%' : '0%' }}
              transition={{ duration: i === currentSlide ? 4 : 0, ease: 'linear' }}
              style={{ height: '100%', background: '#fff' }}
            />
          </div>
        ))}
      </div>

      {/* אזור הלחיצה והתוכן */}
      <div 
        onClick={(e) => {
          const clickX = e.clientX;
          const screenW = window.innerWidth;
          // חלוקת המסך לחצי: לחיצה שמאלה מקדמת, ימינה מחזירה (כי אנחנו ב-RTL)
          if (clickX < screenW / 2) {
            if (currentSlide < 2) setCurrentSlide(prev => prev + 1);
          } else {
            if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
          }
        }}
        style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ width: 160, height: 160, borderRadius: '50%', background: slides[currentSlide].color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, boxShadow: `0 0 60px ${slides[currentSlide].color}60` }}>
              {slides[currentSlide].icon}
            </div>
            <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 900, marginBottom: 16, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              {slides[currentSlide].title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.5, fontWeight: 500 }}>
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* כפתור כניסה בשקף האחרון */}
      <AnimatePresence>
        {currentSlide === 2 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', bottom: 60, left: 24, right: 24 }}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); finishOnboarding(); }} 
              className="glass-button" 
              style={{ width: '100%', height: 64, borderRadius: 32, background: '#fff', color: '#000', fontSize: 20, fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 30px rgba(255,255,255,0.3)' }}
            >
              בוא נתחיל <ArrowLeft size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
