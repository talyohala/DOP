import React, { useEffect } from 'react';
import { supabase } from '../supabase';
import { toast, Toaster } from 'react-hot-toast';
import { Zap, CircleDollarSign, Bell } from 'lucide-react';

const NotificationListener = ({ userId }) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dop_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notif = payload.new;
          
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-top-4' : 'animate-out fade-out'} max-w-sm w-full bg-[#121214] border border-white/10 p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 cursor-pointer`} dir="rtl" onClick={() => toast.dismiss(t.id)}>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/5">
                {notif.type === 'boost' ? <Zap size={20} className="text-blue-400" /> :
                 notif.type === 'coin' ? <CircleDollarSign size={20} className="text-yellow-400" /> :
                 <Bell size={20} className="text-white" />}
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-wide">התראה חדשה ⚡</p>
                <p className="text-gray-400 text-xs mt-0.5">{notif.content}</p>
              </div>
            </div>
          ), { duration: 4000, position: 'top-center' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <Toaster />;
};

export default NotificationListener;
