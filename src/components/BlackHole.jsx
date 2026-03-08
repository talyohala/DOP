import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, FaCoins, FaGem, FaBroom, FaAtom, 
  FaCircleNotch, FaMeteor, FaBiohazard, FaSync 
} from 'react-icons/fa';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function BlackHole({ onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [singularityLevel, setSingularityLevel] = useState(65); // מד התקדמות עולמי (דוגמה)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('dop_users').select('*').eq('id', user.id).single();
        setCurrentUser(data);
      }
    };
    fetchUser();
  }, []);

  const handleAction = (actionName) => {
    toast.success(`${actionName} - הפעולה הצליחה (סימולציה)`, { 
      icon: '💜',
      style: { background: '#1a1a1a', color: '#a855f7', borderRadius: '16px', border: '1px solid #a855f7' } 
    });
  };

  // אנימציית סיבוב וזוהר של החור השחור
  const blackHoleVariants = {
    animate: {
      rotate: 360,
      boxShadow: [
        "0 0 40px rgba(168, 85, 247, 0.4)",
        "0 0 80px rgba(168, 85, 247, 0.7)",
        "0 0 40px rgba(168, 85, 247, 0.4)"
      ],
      transition: {
        rotate: { repeat: Infinity, duration: 10, ease: "linear" },
        boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" }
      }
    }
  };

  // אנימציית חלקיקים נשאבים
  const particleVariants = {
    animate: (i) => ({
      x: [Math.cos(i) * 150, 0],
      y: [Math.sin(i) * 150, 0],
      scale: [1, 0],
      opacity: [1, 0],
      transition: { repeat: Infinity, duration: 2, delay: i * 0.1, ease: "easeIn" }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div className="min-h-[100dvh] bg-[#050505] text-white pb-32 font-sans px-4 pt-6 relative overflow-hidden" variants={containerVariants} initial="hidden" animate="visible" dir="rtl">
      
      {/* רקע סגול עמוק */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2e1065_0%,#050505_70%)] opacity-60"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FaCircleNotch className="text-2xl text-purple-400" />
            <h1 className="text-3xl font-black text-white tracking-tight">החור השחור</h1>
          </div>
          <p className="text-white/40 text-xs mt-1">כאן הכל נעלם... או משתנה</p>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-colors active:scale-95">
          <FaChevronLeft className="text-lg" />
        </button>
      </div>

      {/* יתרות מעוצבות בסגול */}
      <div className="grid grid-cols-2 gap-3 mb-10 relative z-10">
        <div className="bg-[#111] border border-purple-500/30 p-4 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">DOP</span>
            <FaCoins className="text-purple-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-white">{currentUser?.dop_coins?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="bg-[#111] border border-fuchsia-500/30 p-4 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">אבק כוכבים</span>
            <FaAtom className="text-fuchsia-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-white">450</span> {/* דוגמה */}
        </div>
      </div>

      {/* ויז'ואל של החור השחור - סגול מהפנט */}
      <div className="relative flex items-center justify-center h-64 mb-12 z-10">
        
        {/* החור השחור המרכזי */}
        <motion.div 
          className="w-40 h-40 rounded-full relative z-20 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, #000 40%, #2e1065 60%, #a855f7 100%)",
            border: "2px solid rgba(168, 85, 247, 0.5)"
          }}
          variants={blackHoleVariants}
          animate="animate"
        >
          <FaCircleNotch className="text-6xl text-purple-200/20" />
        </motion.div>

        {/* חלקיקים נשאבים */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full z-10"
            variants={particleVariants}
            animate="animate"
          />
        ))}
        
        {/* הילת זוהר חיצונית */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-60 h-60 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* אזור פעולות אינטראקטיביות */}
      <div className="space-y-4 relative z-10">
        
        {/* פעולה 1: הקרבת פריטים */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-3xl p-5 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-900/30 p-3.5 rounded-2xl"><FaBroom className="text-2xl text-purple-400" /></div>
            <div>
              <h3 className="text-lg font-black">הקרבת פריטים</h3>
              <p className="text-white/50 text-xs mt-0.5">הפוך ציוד מיותר ל"אבק כוכבים" נדיר.</p>
            </div>
          </div>
          <button onClick={() => handleAction('הקרבת פריט')} className="w-full bg-white/5 hover:bg-white text-white hover:text-black font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95">
            בחר פריט להקרבה
          </button>
        </motion.div>

        {/* פעולה 2: מד הסינגולריות הגלובלי */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-purple-900/30 p-3.5 rounded-2xl"><FaSync className="text-2xl text-purple-400" /></div>
            <div className="flex-1">
              <h3 className="text-lg font-black">מד הסינגולריות הגלובלי</h3>
              <p className="text-white/50 text-xs mt-0.5">תרום DOP כדי להפעיל אירוע עולמי.</p>
            </div>
          </div>
          
          {/* מד התקדמות עגול ומודרני */}
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-5 border border-white/5 relative">
            <motion.div 
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-purple-500 to-fuchsia-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${singularityLevel}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex gap-2">
            <input type="number" placeholder="כמות DOP לתרומה" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-center focus:border-purple-500 focus:ring-0" />
            <button onClick={() => handleAction('תרומת DOP')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm active:scale-95">הזן</button>
          </div>
        </motion.div>

        {/* פעולה 3: הימור כבידה */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-900/30 to-[#111] border border-purple-500/20 rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-900/30 p-3.5 rounded-2xl"><FaMeteor className="text-2xl text-purple-400" /></div>
            <div>
              <h3 className="text-lg font-black">הימור כבידה (High Risk)</h3>
              <p className="text-white/60 text-xs mt-0.5">זרוק DOP. אולי יחזור פי 5, אולי ייעלם.</p>
            </div>
          </div>
          <button onClick={() => handleAction('הימור כבידה')} className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black py-3.5 rounded-xl text-sm active:scale-95 transition-transform">
            נסה את מזלך
          </button>
        </motion.div>

      </div>

      <div className="h-10" />
    </motion.div>
  );
}
