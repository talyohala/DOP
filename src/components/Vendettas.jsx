import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { 
  ChevronRight, Swords, Target, Clock, Coins, 
  Shield, Flame, User, Trophy, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Vendettas({ userId, onClose, onOpenMarket }) {
  const [vendettas, setVendettas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendettas();
  }, [userId]);

  const fetchVendettas = async () => {
    try {
      // נתוני דמו
      const demoVendettas = [
        {
          id: '1',
          challenger: 'TheKing',
          challenger_id: '101',
          target: 'AnnaVlogs',
          target_id: '102',
          bounty: 5000,
          timeLeft: '2:30:00',
          status: 'active',
          type: 'engagement'
        },
        {
          id: '2',
          challenger: 'CryptoNinja',
          challenger_id: '103',
          target: 'You',
          target_id: userId,
          bounty: 2500,
          timeLeft: '5:45:00',
          status: 'active',
          type: 'views'
        }
      ];

      setVendettas(demoVendettas);
    } catch (error) {
      console.error('Error fetching vendettas:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptVendetta = async (vendettaId) => {
    toast.success('האתגר התקבל! בהצלחה!', {
      icon: '⚔️',
      style: { background: '#111', border: '1px solid #ef4444' }
    });
  };

  const declineVendetta = async (vendettaId) => {
    toast('האתגר נדחה', {
      icon: '🛡️',
      style: { background: '#111', border: '1px solid #6b7280' }
    });
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#030303] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#030303] text-white overflow-y-auto" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">

        {/* רקע */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3b0a0a_0%,#030303_70%)] opacity-60 pointer-events-none"></div>

        {/* כותרת */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg sticky top-2 z-20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Swords size={28} className="text-red-500" />
              <h1 className="text-2xl font-black text-white">אתגרים ונקמות</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">
              אתגרי תוכן וחוזי ענק
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-[20px] transition-colors active:scale-95"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key="vendettas"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >

              {/* אתגרים פעילים */}
              {vendettas.length > 0 ? (
                vendettas.map(v => (
                  <motion.div
                    key={v.id}
                    variants={boxVariants}
                    className="bg-[#0f0f0f] border border-red-500/30 rounded-[32px] p-6 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-br-[16px] uppercase tracking-widest">
                      {v.target === 'You' ? 'נגדך' : 'אתגר פעיל'}
                    </div>

                    <div className="flex items-center gap-4 mt-4 mb-4">
                      <div className="w-14 h-14 rounded-[16px] bg-red-950/50 border border-red-500/50 flex items-center justify-center text-red-500">
                        <Target size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {v.challenger} ⚔️ {v.target}
                        </h3>
                        <p className="text-[11px] text-red-300/70 font-bold">
                          סוג: {v.type === 'engagement' ? 'מעורבות' : 'צפיות'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/40 rounded-[16px] p-3 text-center border border-white/5">
                        <Coins size={16} className="text-amber-400 mx-auto mb-1" />
                        <span className="text-sm font-black text-amber-400">{v.bounty.toLocaleString()}</span>
                        <span className="text-[9px] text-white/40 block">פרס</span>
                      </div>
                      <div className="bg-black/40 rounded-[16px] p-3 text-center border border-white/5">
                        <Clock size={16} className="text-blue-400 mx-auto mb-1" />
                        <span className="text-sm font-black text-blue-400">{v.timeLeft}</span>
                        <span className="text-[9px] text-white/40 block">נותר</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {v.target === 'You' ? (
                        <>
                          <button
                            onClick={() => acceptVendetta(v.id)}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-[20px] text-sm transition-all active:scale-95"
                          >
                            קבל אתגר
                          </button>
                          <button
                            onClick={() => declineVendetta(v.id)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-black py-4 rounded-[20px] text-sm transition-all active:scale-95 border border-white/10"
                          >
                            דחה
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onOpenMarket?.()}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-[20px] text-sm transition-all active:scale-95"
                        >
                          הצטרף לאתגר ({v.bounty / 10} DOP)
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 opacity-70 bg-[#0a0a0a] rounded-[32px] border border-white/5">
                  <Shield size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="font-bold text-sm">אין אתגרים פעילים כרגע</p>
                  <button
                    onClick={onOpenMarket}
                    className="mt-6 bg-red-600/20 text-red-400 border border-red-500/30 font-black px-6 py-3 rounded-[20px] text-sm hover:bg-red-600 hover:text-white transition-all"
                  >
                    פתח אתגר חדש
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
