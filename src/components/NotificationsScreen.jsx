import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { 
  ChevronRight, Bell, Coins, UserPlus, 
  ShieldAlert, Flame, CheckCircle, Circle, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationsScreen({ userId, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const unsubscribe = subscribeToNotifications();
      return () => unsubscribe();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('dop_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dop_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          toast(payload.new.content, {
            icon: '🔔',
            style: { background: '#111', color: '#fff', border: '1px solid #3b82f6' }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('dop_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('dop_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('category', categoryId)
        .eq('read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.category === categoryId ? { ...n, read: true } : n));
      toast.success('כל ההתראות סומנו כנקראו', { style: { background: '#111', color: '#10b981'} });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase.from('dop_notifications').delete().eq('id', notificationId);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('ההתראה נמחקה', { style: { background: '#111', color: '#fff'} });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase.from('dop_notifications').delete().eq('user_id', userId);
      if (error) throw error;
      setNotifications([]);
      toast.success('כל ההתראות נמחקו', { style: { background: '#111', color: '#fff'} });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const floatAnimation = {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  const categories = [
    { id: 'economy', title: 'כלכלה ותמלוגים', desc: 'DOP ורכישות', icon: <Coins size={56} />, color: 'emerald', hex: '#10b981', bg: 'from-emerald-900/40 to-[#050505]' },
    { id: 'social', title: 'קהילה ועוקבים', desc: 'מעורבות קהל', icon: <UserPlus size={56} />, color: 'blue', hex: '#3b82f6', bg: 'from-blue-900/40 to-[#050505]' },
    { id: 'system', title: 'אבטחה והגנות', desc: 'התראות מערכת', icon: <ShieldAlert size={56} />, color: 'purple', hex: '#a855f7', bg: 'from-purple-900/40 to-[#050505]' },
    { id: 'alerts', title: 'אתגרים וחוזים', desc: 'איומים והזדמנויות', icon: <Flame size={56} />, color: 'rose', hex: '#f43f5e', bg: 'from-rose-900/40 to-[#050505]' }
  ];

  const getUnreadCount = (categoryId) => notifications.filter(n => n.category === categoryId && !n.read).length;
  const displayedNotifications = selectedCategory ? notifications.filter(n => n.category === selectedCategory) : [];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'economy': return <Coins size={24} className="text-emerald-400" />;
      case 'social': return <UserPlus size={24} className="text-blue-400" />;
      case 'system': return <ShieldAlert size={24} className="text-purple-400" />;
      case 'alerts': return <Flame size={24} className="text-rose-400" />;
      default: return <Bell size={24} className="text-white/40" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'economy': return 'emerald';
      case 'social': return 'blue';
      case 'system': return 'purple';
      case 'alerts': return 'rose';
      default: return 'gray';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays === 1) return 'אתמול';
    return `לפני ${diffDays} ימים`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#030303] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#030303] text-white overflow-y-auto font-sans" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a1a1a_0%,#030303_80%)] opacity-80 pointer-events-none"></div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-8 flex justify-between items-center shadow-lg sticky top-2 z-20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                <Bell size={28} className="text-white" />
              </motion.div>
              <h1 className="text-2xl font-black text-white">מרכז עדכונים</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.title : 'כל ההתראות מסווגות חכם'}
            </p>
          </div>
          <div className="flex gap-2">
            {!selectedCategory && notifications.length > 0 && (
              <button onClick={clearAll} className="bg-white/5 hover:bg-white/10 p-4 rounded-[20px] transition-colors active:scale-95">
                <Trash2 size={20} className="text-white/60" />
              </button>
            )}
            <button onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()} className="bg-white/10 hover:bg-white/20 p-4 rounded-[20px] transition-colors active:scale-95">
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {!selectedCategory && (
              <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
                {categories.map(cat => {
                  const unread = getUnreadCount(cat.id);
                  return (
                    <motion.div key={cat.id} variants={boxVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat.id)} className={`bg-gradient-to-br ${cat.bg} border border-${cat.color}-500/40 rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer relative overflow-hidden aspect-square justify-center shadow-lg`} style={{ boxShadow: `0 10px 30px ${cat.hex}15` }}>
                      {unread > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-[#050505] z-20">
                          {unread}
                        </div>
                      )}
                      <motion.div animate={floatAnimation} className={`text-${cat.color}-400 mb-4 drop-shadow-[0_0_15px_${cat.hex}80] z-10`}>
                        {cat.icon}
                      </motion.div>
                      <h3 className="text-lg font-black text-white z-10 mb-1 leading-tight">{cat.title}</h3>
                      <p className={`text-[10px] text-${cat.color}-200/60 font-bold z-10 leading-tight`}>{cat.desc}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {selectedCategory && (
              <motion.div key="list" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2">
                    {getUnreadCount(selectedCategory) > 0 && (
                      <button onClick={() => markAllAsRead(selectedCategory)} className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-[14px]">
                        <CheckCircle size={12} />
                        סמן הכל כנקרא
                      </button>
                    )}
                    <button onClick={() => {
                      const filtered = notifications.filter(n => n.category === selectedCategory);
                      filtered.forEach(n => deleteNotification(n.id));
                    }} className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-rose-400 transition-colors bg-white/5 px-4 py-2 rounded-[14px]">
                      <Trash2 size={12} />
                      נקה קטגוריה
                    </button>
                  </div>
                </div>

                {displayedNotifications.length > 0 ? (
                  displayedNotifications.map(notif => {
                    const catColor = getCategoryColor(notif.category);
                    return (
                      <motion.div key={notif.id} variants={boxVariants} className={`bg-[#0f0f0f] border rounded-[32px] p-5 flex flex-col relative overflow-hidden transition-all shadow-lg ${!notif.read ? `border-${catColor}-500/50 shadow-[0_0_20px_${categories.find(c => c.id === notif.category)?.hex}20]` : 'border-white/5 opacity-80'}`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 shrink-0 rounded-[20px] flex items-center justify-center border border-${catColor}-500/30 bg-${catColor}-500/10`}>
                            <div className={`text-${catColor}-400`}>
                              {getCategoryIcon(notif.category)}
                            </div>
                          </div>

                          <div className="flex-1 pt-1">
                            <h3 className={`font-black text-sm mb-1 flex items-center justify-between ${!notif.read ? 'text-white' : 'text-white/70'}`}>
                              <span>
                                {notif.type === 'boost' && '⚡ בוסט התקבל'}
                                {notif.type === 'attack' && '🧛‍♂️ מתקפת שאיבה'}
                                {notif.type === 'purchase' && '🛍️ רכישה בוצעה'}
                                {notif.type === 'system' && '🔧 עדכון מערכת'}
                                {!['boost', 'attack', 'purchase', 'system'].includes(notif.type) && 'התראה חדשה'}
                              </span>
                              {!notif.read && <Circle size={10} className={`text-${catColor}-500 fill-${catColor}-500`} />}
                            </h3>
                            <p className="text-[11px] text-white/50 leading-snug mb-3 font-medium">
                              {notif.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-[8px]">
                                {formatTime(notif.created_at)}
                              </span>
                              <div className="flex gap-3">
                                {!notif.read && (
                                  <button onClick={() => markAsRead(notif.id)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300">
                                    סמן כנקרא
                                  </button>
                                )}
                                <button onClick={() => deleteNotification(notif.id)} className="text-[10px] font-bold text-rose-400 hover:text-rose-300">
                                  מחק
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 opacity-50 bg-[#0a0a0a] rounded-[32px] border border-white/5">
                    <Bell size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="font-bold text-sm">אין התראות בקטגוריה זו</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
