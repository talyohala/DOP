import React, { useState, useEffect } from 'react';
import { Swords, X, Skull, Loader2, Zap } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const Vendettas = ({ userId, onClose, onOpenStore }) => {
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttacks();
  }, [userId]);

  const fetchAttacks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('dop_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'attack')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setAttacks(data);
    setLoading(false);
  };

  const handleRevenge = () => {
    toast('זמן לנקמה! פותח את השוק השחור...', { icon: '⚔️', style: { background: '#18181b', color: '#ef4444' } });
    onOpenStore();
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col font-sans text-white animate-in slide-in-from-bottom duration-300" dir="rtl">
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-red-900/30 to-transparent border-b border-red-500/20 shrink-0 relative">
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Swords size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">יומן קרבות</h2>
              <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">רשימת חיסול</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95"><X size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-28 mt-2">
        <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed bg-red-500/5 p-4 rounded-2xl border border-red-500/10 text-center">
          כאן מופיעים כל המשתמשים ששאבו זמן מהדרופים שלך. אל תישאר חייב - הכנס לשוק השחור ונקום!
        </p>

        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
        ) : attacks.length === 0 ? (
          <div className="text-center mt-20 opacity-30">
            <Skull size={64} className="mx-auto mb-4" />
            <p className="font-black text-xl tracking-widest">אף אחד לא תקף אותך. עדיין.</p>
          </div>
        ) : (
          attacks.map((attack) => (
            <div key={attack.id} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-zinc-900 border border-red-500/20 relative overflow-hidden group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500">
                <Skull size={20} />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="font-bold text-white text-sm truncate">{attack.content}</p>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">{new Date(attack.created_at).toLocaleString('he-IL')}</p>
              </div>
              <button onClick={handleRevenge} className="bg-red-600/80 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all flex items-center gap-2 text-xs">
                <Zap size={14} /> נְקוֹם
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Vendettas;
