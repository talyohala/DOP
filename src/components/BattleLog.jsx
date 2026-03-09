import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, History, TrendingUp, ShoppingCart, ShieldAlert, Coins, Gem, Zap } from 'lucide-react';

export default function BattleLog({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const floatAnimation = { 
    y: [0, -6, 0], 
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } 
  };

  const categories = [
    { id: 'income', title: 'הכנסות ותמלוגים', desc: 'רווחים מהאלגוריתם', icon: <TrendingUp size={48} />, color: 'emerald', hex: '#10b981', bg: 'from-emerald-900/40 to-[#050505]' },
    { id: 'expenses', title: 'רכישות ושדרוגים', desc: 'היסטוריית קניות', icon: <ShoppingCart size={48} />, color: 'blue', hex: '#3b82f6', bg: 'from-blue-900/40 to-[#050505]' },
    { id: 'security', title: 'אבטחה וסייבר', desc: 'הגנות ומתקפות רשת', icon: <ShieldAlert size={48} />, color: 'rose', hex: '#f43f5e', bg: 'from-rose-900/40 to-[#050505]' },
    { id: 'all', title: 'יומן מלא', desc: 'כלל הפעולות בחשבון', icon: <History size={48} />, color: 'purple', hex: '#a855f7', bg: 'from-purple-900/40 to-[#050505]' }
  ];

  // מאגר נתונים מדומה ליומן
  const allLogs = [
    { id: 1, category: 'income', type: 'dop', title: 'תמלוגי חשיפה אורגנית', desc: 'בונוס על סרטון ויראלי', amount: '+450 DOP', time: 'לפני 5 דקות' },
    { id: 2, category: 'security', type: 'alert', title: 'בלימת שאיבת זמן', desc: 'מגן היוצרים חסם מתקפה', amount: 'הגנה הופעלה', time: 'לפני שעה' },
    { id: 3, category: 'expenses', type: 'gem', title: 'רכישת פלטת ניאון', desc: 'התאמה אישית לפרופיל', amount: '-150 יהלומים', time: 'אתמול' },
    { id: 4, category: 'income', type: 'dop', title: 'ניצחון באתגר רשת', desc: 'עקפת את המתחרה שלך', amount: '+2,000 DOP', time: 'אתמול' }
  ];

  const getLogIcon = (type) => {
    switch(type) {
      case 'dop': return <Coins size={24} className="text-emerald-400" />;
      case 'gem': return <Gem size={24} className="text-blue-400" />;
      case 'alert': return <Zap size={24} className="text-rose-400" />;
      default: return <History size={24} className="text-white/40" />;
    }
  };

  const getLogStyle = (category) => {
    switch(category) {
      case 'income': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'expenses': return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      case 'security': return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      default: return 'border-white/10 bg-white/5 text-white';
    }
  };

  const displayedLogs = selectedCategory === 'all' ? allLogs : allLogs.filter(log => log.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-10 w-full h-full bg-[#030303] text-white pb-32 font-sans px-4 pt-6 overflow-y-auto" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e3a8a_0%,#030303_70%)] opacity-30 pointer-events-none"></div>

      {/* כותרת עליונה */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-8 flex justify-between items-center shadow-lg relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <History size={28} className="text-blue-400" />
            <h1 className="text-2xl font-black text-white">יומן פעילות</h1>
          </div>
          <p className="text-white/50 text-xs font-bold">
            {selectedCategory ? categories.find(c => c.id === selectedCategory).title : 'ניתוח כלכלי ואבטחה'}
          </p>
        </div>
        <button onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()} className="bg-white/10 hover:bg-white/20 p-4 rounded-[20px] transition-colors active:scale-95">
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          
          {/* מצב 1: דשבורד יומן (קוביות) */}
          {!selectedCategory && (
            <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <motion.div 
                  key={cat.id} 
                  variants={boxVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`bg-gradient-to-br ${cat.bg} border border-${cat.color}-500/40 rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer overflow-y-auto aspect-square justify-center`}
                >
                  <motion.div animate={floatAnimation} className={`text-${cat.color}-400 mb-4 drop-shadow-[0_0_15px_${cat.hex}80] z-10`}>
                    {cat.icon}
                  </motion.div>
                  <h3 className="text-base font-black text-white z-10 mb-1 leading-tight">{cat.title}</h3>
                  <p className={`text-[10px] text-${cat.color}-200/60 font-bold z-10 px-1`}>{cat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* מצב 2: רשימת היומן המפורטת */}
          {selectedCategory && (
            <motion.div key="logs" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-3">
              {displayedLogs.length > 0 ? (
                displayedLogs.map(log => {
                  const styleClass = getLogStyle(log.category);
                  return (
                    <motion.div key={log.id} variants={boxVariants} className="bg-[#0f0f0f] border border-white/10 rounded-[24px] p-5 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center border ${styleClass}`}>
                          {getLogIcon(log.type)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white mb-0.5">{log.title}</h3>
                          <p className="text-[10px] text-white/50 leading-snug">{log.desc}</p>
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2 block">{log.time}</span>
                        </div>
                      </div>
                      <div className={`font-black text-xs ${log.category === 'income' ? 'text-emerald-400' : log.category === 'expenses' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {log.amount}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 opacity-50">
                  <History size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="font-bold text-sm">אין רשומות בקטגוריה זו</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
