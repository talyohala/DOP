import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // רישום ה-Service Worker כדי שהדפדפן יאפשר התקנה
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // בודקים אם המשתמש סגר את ההודעה לאחרונה (לא נחפור לו שוב היום)
      const lastPrompt = localStorage.getItem('dop_install_prompt');
      if (!lastPrompt || Date.now() - parseInt(lastPrompt) > 86400000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.setItem('dop_install_prompt', Date.now().toString());
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('dop_install_prompt', Date.now().toString()); // השתק ל-24 שעות
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 150, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 150, opacity: 0 }}
          style={{ position: 'fixed', bottom: 90, left: 20, right: 20, background: 'rgba(28,28,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: '16px 20px', zIndex: 99999, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 16, direction: 'rtl' }}
        >
          <div style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#000' }}>
            <img src="/icon.png" alt="DOP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>התקן את DOP</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>למהירות שיא וחוויה מלאה!</div>
          </div>

          <button onClick={handleInstall} style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 20, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={16} style={{ marginLeft: -4 }} /> התקן
          </button>

          <button onClick={handleClose} style={{ position: 'absolute', top: -10, right: -10, width: 28, height: 28, background: '#333', borderRadius: '50%', border: '2px solid rgba(28,28,30,1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
