import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Gem, ShoppingBag, ShieldAlert, Sparkles, Gift, CreditCard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STORE_ITEMS = [
  { id: 'mystery', title: 'קופסת הפתעה', desc: 'יכולה להכיל בוסטים, מטבעות או כלום', price: 2, icon: Gift, color: '#fff' },
  { id: 'freeze', title: 'מקפיא זמן', desc: 'נועל דרופ אישי ל-24 שעות', price: 5, icon: ShieldAlert, color: '#fff' },
  { id: 'halo', title: 'הילה זוהרת', desc: 'מסגרת VIP לפרופיל (שבוע)', price: 15, icon: Sparkles, color: '#fff' },
];

export default function Wallet() {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [confirmItem, setConfirmItem] = useState<any>(null);

  const handlePurchase = async () => {
    if (!user || !confirmItem) return;
    if ((profile?.dop_coins || 0) < confirmItem.price) {
      setConfirmItem(null);
      return toast.error('אין מספיק מטבעות DOP');
    }
    
    const newCoins = (profile?.dop_coins || 0) - confirmItem.price;
    await supabase.from('dop_users').update({ dop_coins: newCoins }).eq('id', user.id);
    fetchProfile(user.id);
    setConfirmItem(null);
    toast.success('נרכש בהצלחה!');
  };

  return (
    <div style={{ background: '#000', height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', direction: 'rtl', padding: '40px 20px 120px', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30, flexShrink: 0, gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={24} color="#fff" />
        </button>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>החנות</h1>
      </div>

      <motion.div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 24, marginBottom: 32, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <CreditCard color="#fff" /> <Zap color="#fff" />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>יתרה זמינה</div>
        <div style={{ color: '#fff', fontSize: 40, fontWeight: 900, fontFamily: 'monospace' }}>{(profile?.dop_coins || 0).toFixed(1)} DOP</div>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexShrink: 0 }}>
        <ShoppingBag size={24} color="#fff" />
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>פריטים</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
        {STORE_ITEMS.map((item) => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={24} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.desc}</div>
            </div>
            <button onClick={() => setConfirmItem(item)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 16px', borderRadius: 16, fontWeight: 900, fontSize: 16 }}>
              {item.price} DOP
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {confirmItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, direction: 'rtl' }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 30, width: '100%', maxWidth: 340 }}>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>אישור רכישה</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 24 }}>לרכוש "{confirmItem.title}" ב-{confirmItem.price} DOP?</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setConfirmItem(null)} style={{ flex: 1, padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 800 }}>בטל</button>
                <button onClick={handlePurchase} style={{ flex: 1, padding: 16, borderRadius: 20, background: '#fff', color: '#000', border: 'none', fontWeight: 900 }}>אשר</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
