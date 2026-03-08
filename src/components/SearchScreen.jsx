import React, { useState, useEffect } from 'react';
import { Search, X, Crown, Grid } from 'lucide-react';
import { supabase } from '../supabase';

const SearchScreen = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDrops, setUserDrops] = useState([]);

  // מנוע חיפוש בזמן אמת
  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    const search = async () => {
      setLoading(true);
      const { data } = await supabase.from('dop_users').select('*').ilike('username', `%${query}%`).limit(15);
      if (data) setUsers(data);
      setLoading(false);
    };
    const timeoutId = setTimeout(search, 400); // השהייה קלה כדי לא להעמיס על השרת בכל הקלדה
    return () => clearTimeout(timeoutId);
  }, [query]);

  // טעינת הפרופיל של המשתמש שנבחר
  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    const { data } = await supabase.from('dop_videos').select('*').eq('user_id', u.id).order('created_at', { ascending: false });
    if (data) setUserDrops(data);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-3xl z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200" dir="rtl">
      
      {/* אזור עליון - שורת חיפוש או חזרה למשול */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 pt-12 bg-white/5">
        <button onClick={() => selectedUser ? setSelectedUser(null) : onClose()} className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-all">
          <X size={20} />
        </button>
        
        {!selectedUser ? (
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חפש משתמשים..." className="w-full bg-black/50 border border-white/20 rounded-full py-3 pr-12 pl-4 text-white outline-none focus:border-white/50 transition-all shadow-inner" />
          </div>
        ) : (
          <h2 className={`font-black text-xl flex items-center gap-2 ${selectedUser.has_halo ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-white'}`}>
            @{selectedUser.username} {selectedUser.has_halo && <Crown size={20} className="text-yellow-400" />}
          </h2>
        )}
      </div>

      {/* אזור התוכן המרכזי */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {!selectedUser ? (
          <div className="space-y-3">
            {loading ? <div className="text-center text-gray-500 mt-10 animate-pulse font-mono">סורק רשת...</div> : 
             query && users.length === 0 ? <div className="text-center text-gray-500 mt-10">לא נמצאו משתמשים.</div> :
             users.map(u => (
              <div key={u.id} onClick={() => handleSelectUser(u)} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-all cursor-pointer hover:bg-white/10">
                <div className={`w-14 h-14 rounded-full bg-zinc-800 overflow-hidden shrink-0 border-2 ${u.has_halo ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-white/10'} flex items-center justify-center`}>
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white/50 text-xl font-bold">@</span>}
                </div>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-1 ${u.has_halo ? 'text-yellow-400' : 'text-white'}`}>
                    {u.username} {u.has_halo && <Crown size={16} />}
                  </h3>
                  <p className="text-xs text-gray-400 tracking-widest uppercase">הצג פרופיל</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex flex-col items-center justify-center mb-8 mt-4">
              <div className={`w-28 h-28 rounded-full bg-zinc-800 overflow-hidden mb-4 border-4 ${selectedUser.has_halo ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-white/10'} flex items-center justify-center relative`}>
                {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white/50 text-4xl font-bold">@</span>}
              </div>
              <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                 <Grid size={16} />
                 <span className="text-xs font-bold uppercase tracking-widest">{userDrops.length} דרופים הועלו</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              {userDrops.length === 0 ? <div className="col-span-3 text-center text-gray-500 mt-10">אין דרופים להצגה.</div> : userDrops.map(drop => {
                const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                return (
                  <div key={drop.id} className="aspect-[3/4] bg-zinc-900 relative border border-white/5">
                    {isImage ? <img src={drop.video_url} className="w-full h-full object-cover opacity-80" /> : <video src={drop.video_url} className="w-full h-full object-cover opacity-80" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchScreen;
