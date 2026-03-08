import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Bell, ArrowRight, Zap, Crown, CircleDollarSign, CheckCircle2 } from 'lucide-react';

const NotificationsScreen = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchNotifs();
  }, [userId]);

  const fetchNotifs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('dop_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await supabase.from('dop_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'boost': return <Zap size={20} className="text-blue-400" />;
      case 'coin': return <CircleDollarSign size={20} className="text-yellow-400" />;
      case 'system': return <Crown size={20} className="text-purple-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col font-sans text-white animate-in slide-in-from-right duration-300" dir="rtl">
      <div className="pt-12 pb-4 px-6 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={24} className="text-white" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">התראות</h2>
        </div>
        <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95"><ArrowRight size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-28">
        {loading ? (
          <div className="flex justify-center mt-10"><div className="w-8 h-8 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div></div>
        ) : notifications.length === 0 ? (
          <div className="text-center mt-20 flex flex-col items-center opacity-50">
            <Bell size={48} className="mb-4 text-white/20" />
            <p className="font-bold tracking-widest uppercase">אין לך התראות כרגע</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markAsRead(n.id)} className={`relative flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all cursor-pointer overflow-hidden ${n.is_read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-zinc-900/80 border-white/10 shadow-lg'}`}>
              {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
              <div className="w-12 h-12 rounded-full bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${n.is_read ? 'text-gray-400' : 'text-white font-bold'}`}>{n.content}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(n.created_at).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              {!n.is_read && <CheckCircle2 size={16} className="text-blue-500 shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
