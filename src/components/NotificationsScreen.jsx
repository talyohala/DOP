import React, { useState, useEffect } from 'react';
import { Bell, X, Zap, Ghost, CircleDollarSign, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

const NotificationsScreen = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userId) fetchNotifications(); }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('dop_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'boost': return <Zap size={20} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />;
      case 'attack': return <Ghost size={20} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />;
      case 'coin': return <CircleDollarSign size={20} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />;
      case 'follow': return <UserPlus size={20} className="text-emerald-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) + ' | ' + date.toLocaleDateString('he-IL');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col font-sans text-white animate-in slide-in-from-bottom duration-300" dir="rtl">
      <div className="pt-12 pb-4 px-6 border-b border-white/10 bg-black/50 shrink-0 flex justify-between items-center relative z-20">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-2"><Bell className="text-emerald-500" size={24} /> התראות</h2>
        <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-32">
        {loading ? (
          <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold flex flex-col items-center gap-3"><CheckCircle2 size={48} className="text-white/5" /> הכל שקט כאן... אין התראות חדשות</div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-sm transition-all active:scale-[0.98]">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-lg ${notif.type === 'attack' ? 'bg-red-500/10 border-red-500/30' : notif.type === 'coin' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-white font-bold leading-snug">{notif.content}</p>
                <span className="text-[10px] text-gray-500 font-bold mt-2 block tracking-wider uppercase">{formatTime(notif.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
