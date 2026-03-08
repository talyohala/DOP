import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Flame, X, Clock, CircleDollarSign, Medal } from 'lucide-react';
import { supabase } from '../supabase';

const Olympus = ({ onClose, onUserClick, currentUserId }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'drops'
  const [topUsers, setTopUsers] = useState([]);
  const [topDrops, setTopDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    
    // שליפת 10 המשתמשים העשירים ביותר
    const { data: usersData } = await supabase
      .from('dop_users')
      .select('id, username, avatar_url, dop_coins, has_halo')
      .order('dop_coins', { ascending: false })
      .limit(10);
      
    // שליפת 10 הסרטונים עם הכי הרבה זמן חיים נותר
    const now = new Date().toISOString();
    const { data: dropsData } = await supabase
      .from('dop_videos')
      .select('id, video_url, description, expires_at, user_id, users(username, avatar_url)')
      .gt('expires_at', now)
      .order('expires_at', { ascending: false })
      .limit(10);

    if (usersData) setTopUsers(usersData);
    if (dropsData) setTopDrops(dropsData);
    setLoading(false);
  };

  const getTimeLeftStr = (expiresAt) => {
    const hours = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
    return hours > 24 ? `${Math.floor(hours/24)} ימים` : `${hours} שעות`;
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col font-sans text-white animate-in slide-in-from-bottom duration-300" dir="rtl">
      
      {/* הדר מרשים */}
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-yellow-900/30 to-transparent border-b border-yellow-500/20 shrink-0 relative">
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">האולימפוס</h2>
              <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest">טבלת המובילים</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95"><X size={20}/></button>
        </div>
      </div>

      {/* טאבים לניווט */}
      <div className="flex px-4 mt-4 gap-2 shrink-0">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-white/5 text-gray-400 border border-white/5'}`}
        >
          <Crown size={16} /> אלי ההון
        </button>
        <button 
          onClick={() => setActiveTab('drops')}
          className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'drops' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border border-white/5'}`}
        >
          <Flame size={16} /> האלמוות
        </button>
      </div>

      {/* רשימות */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-28 mt-2">
        {loading ? (
          <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div></div>
        ) : activeTab === 'users' ? (
          topUsers.map((u, i) => (
            <div key={u.id} onClick={() => onUserClick(u.id)} className={`flex items-center gap-4 p-4 rounded-[1.5rem] border cursor-pointer transition-all active:scale-[0.98] ${u.id === currentUserId ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-zinc-900 border-white/5'}`}>
              <div className={`w-8 font-black text-lg text-center ${i === 0 ? 'text-yellow-400 text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,1)]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                {i === 0 ? <Crown size={28} className="mx-auto" /> : `#${i + 1}`}
              </div>
              <div className={`w-12 h-12 rounded-full bg-black border-2 flex-shrink-0 overflow-hidden ${u.has_halo ? 'border-yellow-400' : 'border-white/10'}`}>
                {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/30 font-black">@</div>}
              </div>
              <div className="flex-1">
                <p className={`font-black text-sm flex items-center gap-1 ${u.has_halo ? 'text-yellow-400' : 'text-white'}`}>@{u.username || 'אנונימי'} {u.id === currentUserId && <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white ml-1">אתה</span>}</p>
                <p className="text-yellow-500 text-xs font-bold flex items-center gap-1 mt-0.5"><CircleDollarSign size={12}/> {u.dop_coins?.toFixed(1) || 0}</p>
              </div>
            </div>
          ))
        ) : (
          topDrops.map((d, i) => {
            const isImage = d.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
            return (
              <div key={d.id} className="flex items-center gap-4 p-3 rounded-[1.5rem] bg-zinc-900 border border-white/5 overflow-hidden relative group">
                <div className={`absolute right-0 top-0 bottom-0 w-1 ${i === 0 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-white/10'}`}></div>
                <div className="w-6 font-black text-sm text-center text-gray-500 ml-1">#{i + 1}</div>
                <div className="w-16 h-20 rounded-xl bg-black flex-shrink-0 overflow-hidden relative border border-white/10">
                  {isImage ? <img src={d.video_url} className="w-full h-full object-cover opacity-80" /> : <video src={d.video_url} className="w-full h-full object-cover opacity-80" />}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <p className="font-bold text-white text-sm truncate">{d.description || 'ללא תיאור'}</p>
                  <p className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-white" onClick={() => onUserClick(d.user_id)}>@{d.users?.username || 'אנונימי'}</p>
                  <div className="flex items-center gap-1 mt-2 text-orange-400 text-[10px] font-black tracking-widest bg-orange-500/10 w-fit px-2 py-1 rounded-md border border-orange-500/20">
                    <Clock size={12} /> נותר: {getTimeLeftStr(d.expires_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Olympus;
