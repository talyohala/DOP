import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, FaBell, FaCoins, FaUserPlus, 
  FaFire, FaShieldAlt, FaCheckDouble, FaCircle 
} from 'react-icons/fa';

export default function Notifications({ onClose }) {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'economy', title: 'זיכוי חשבון', desc: 'קיבלת 500 DOP מתמלוגי אלגוריתם.', time: 'לפני 2 דקות', unread: true },
    { id: 2, type: 'social', title: 'עוקב חדש', desc: 'TheKing2026 התחיל לעקוב אחריך.', time: 'לפני 15 דקות', unread: true },
    { id: 3, type: 'system', title: 'הגנת רשת', desc: 'השילדה הקוונטית חסמה ניסיון שאיבת זמן.', time: 'לפני שעה', unread: false },
    { id: 4, type: 'alert', title: 'אתגר רשת הופעל', desc: 'מישהו פתח חוזה התמודדות מול הסרטון המוביל שלך!', time: 'לפני שעתיים', unread: false }
  ]);

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.3 } }
  };

  const cardVariants = { 
    hidden: { opacity: 0, x: -20 }, 
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } 
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getStyle = (type) => {
    switch(type) {
      case 'economy': return { icon: <FaCoins className="text-emerald-400" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'social': return { icon: <FaUserPlus className="text-blue-400" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'system': return { icon: <FaShieldAlt className="text-purple-400" />, bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
      case 'alert': return { icon: <FaFire className="text-red-400" />, bg: 'bg-red-500/10', border: 'border-red-500/20' };
      default: return { icon: <FaBell className="text-white/40" />, bg: 'bg-white/5', border: 'border-white/10' };
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pb-32 font-sans px-4 pt-6 relative overflow-hidden" dir="rtl">
      
      {/* כותרת עליונה */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <FaBell className="text-2xl text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#050505] rounded-full"></span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">התראות</h1>
          </div>
          <p className="text-white/40 text-xs mt-1 font-medium">עדכונים שוטפים מהרשת</p>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-3 rounded-[16px] transition-colors border border-white/5 active:scale-95">
          <FaChevronLeft className="text-lg text-white/70" />
        </button>
      </div>

      {/* כפתור סמן הכל כנקרא */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4 relative z-10">
          <button onClick={markAllAsRead} className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full">
            <FaCheckDouble /> סמן הכל כנקרא
          </button>
        </div>
      )}

      {/* רשימת ההתראות */}
      <motion.div variants={fadeVariants} initial="hidden" animate="visible" className="space-y-3 relative z-10">
        <AnimatePresence>
          {notifications.map(notif => {
            const style = getStyle(notif.type);
            return (
              <motion.div 
                key={notif.id} 
                variants={cardVariants} 
                exit={{ opacity: 0, x: 20 }}
                className={`bg-[#0a0a0a] border rounded-[24px] p-4 flex items-start gap-4 relative overflow-hidden transition-all ${notif.unread ? 'border-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.03)]' : 'border-white/5 opacity-70'}`}
              >
                {/* נקודת חיווי שלא נקרא */}
                {notif.unread && (
                  <div className="absolute top-4 left-4">
                    <FaCircle className="text-[8px] text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  </div>
                )}

                <div className={`w-12 h-12 shrink-0 rounded-[16px] flex items-center justify-center border ${style.bg} ${style.border}`}>
                  {style.icon}
                </div>
                
                <div className="flex-1 pt-1">
                  <h3 className={`font-bold text-sm mb-1 pr-2 ${notif.unread ? 'text-white' : 'text-white/70'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-snug mb-2 pl-4">
                    {notif.desc}
                  </p>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                    {notif.time}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* מצב ריק */}
      {notifications.length === 0 && (
        <div className="text-center py-20 opacity-50 relative z-10">
          <FaBell className="text-4xl mx-auto mb-4 text-white/20" />
          <p className="text-sm font-bold">אין התראות חדשות</p>
        </div>
      )}

    </div>
  );
}
