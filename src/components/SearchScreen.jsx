import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, UserCheck, Flame, Loader2, Crown } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const SearchScreen = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        fetchFollowing(session.user.id);
        fetchTrending(session.user.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) searchUsers();
    else setResults([]);
  }, [query]);

  const fetchFollowing = async (userId) => {
    const { data } = await supabase.from('dop_followers').select('following_id').eq('follower_id', userId);
    if (data) setFollowingIds(data.map(f => f.following_id));
  };

  const fetchTrending = async (userId) => {
    const { data } = await supabase.from('dop_users').select('id, username, avatar_url, has_halo').neq('id', userId).limit(5);
    if (data) setTrending(data);
  };

  const searchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('dop_users').select('id, username, avatar_url, has_halo').ilike('username', `%${query}%`).neq('id', currentUserId).limit(10);
    if (!error && data) setResults(data);
    setLoading(false);
  };

  const toggleFollow = async (targetId, isFollowing) => {
    if (!currentUserId) return;
    try {
      if (isFollowing) {
        setFollowingIds(prev => prev.filter(id => id !== targetId));
        await supabase.from('dop_followers').delete().match({ follower_id: currentUserId, following_id: targetId });
      } else {
        setFollowingIds(prev => [...prev, targetId]);
        await supabase.from('dop_followers').insert({ follower_id: currentUserId, following_id: targetId });
        await supabase.from('dop_notifications').insert({ user_id: targetId, actor_id: currentUserId, content: 'הוסיף אותך לכנופיה שלו! 🤝', type: 'follow' });
      }
    } catch (error) { toast.error('שגיאה בעדכון הכנופיה'); fetchFollowing(currentUserId); }
  };

  const renderUserCard = (user) => {
    const isFollowing = followingIds.includes(user.id);
    return (
      <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-sm transition-all active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-zinc-800 border-2 overflow-hidden flex items-center justify-center ${user.has_halo ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-white/10'}`}>
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="פרופיל" /> : <span className="text-xl font-black text-white/30">@</span>}
          </div>
          <div>
            <h3 className="font-black flex items-center gap-1.5 text-white">
              {user.has_halo && <Crown size={14} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />}
              {user.username}
            </h3>
            <p className="text-xs text-gray-500 font-bold mt-0.5">{isFollowing ? 'בכנופיה שלך' : 'משתמש Dop'}</p>
          </div>
        </div>
        <button onClick={() => toggleFollow(user.id, isFollowing)} className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-90 ${isFollowing ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
          {isFollowing ? <><UserCheck size={16} /> הוסר</> : <><UserPlus size={16} /> הוסף</>}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col font-sans text-white animate-in slide-in-from-bottom duration-300" dir="rtl">
      <div className="pt-12 pb-4 px-6 border-b border-white/10 bg-black/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש משתמשים..." className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pr-12 pl-4 text-white outline-none focus:border-emerald-500/50 transition-all font-bold placeholder-gray-500" />
            {loading && <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={18} />}
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
        {query.length > 1 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-4">תוצאות חיפוש</h3>
            {results.length > 0 ? results.map(renderUserCard) : !loading && <div className="text-center py-20 text-gray-500 font-bold">לא מצאנו אף אחד עם השם הזה 🕵️‍♂️</div>}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2 px-2 mb-4"><Flame size={18} /> חמים ב-Dop</h3>
            <div className="space-y-3">{trending.map(renderUserCard)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
