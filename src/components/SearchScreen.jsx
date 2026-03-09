import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, ChevronRight, User, Check } from 'lucide-react';
import PublicProfile from './PublicProfile';

export default function SearchScreen({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setCurrentUserId(data.session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const searchUsers = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('dop_users')
        .select('id, username, avatar_url, has_halo')
        .ilike('username', `%${query}%`)
        .limit(10);
        
      setResults(data || []);
      setLoading(false);
    };

    // השהייה קלה כדי לא להפציץ את השרת בכל אות
    const timeoutId = setTimeout(searchUsers, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#030303] text-white flex flex-col font-sans" dir="rtl">
      {/* כותרת */}
      <div className="bg-[#0a0a0a] border-b border-white/10 p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Search size={24} className="text-emerald-400" />
          <h1 className="text-xl font-black">גילוי יוצרים</h1>
        </div>
        <button onClick={onClose} className="bg-white/10 p-3 rounded-[16px] active:scale-95"><ChevronRight size={20} /></button>
      </div>

      {/* שורת חיפוש */}
      <div className="p-4">
        <div className="relative">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="חפש לפי שם משתמש..." 
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 transition-all" 
          />
          {loading && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>
      </div>

      {/* תוצאות */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.length > 0 ? results.map(user => (
          <div key={user.id} onClick={() => setSelectedUser(user.id)} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[24px] flex items-center gap-4 active:scale-95 transition-all cursor-pointer shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden border border-emerald-500/20">
              {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User className="text-emerald-400" />}
            </div>
            <div className="flex-1">
              <span className="font-black text-base flex items-center gap-1">
                {user.username} {user.has_halo && <Check size={14} className="text-blue-400" />}
              </span>
            </div>
          </div>
        )) : query.trim() && !loading ? (
          <div className="text-center mt-10 text-white/40 font-black">לא מצאנו את "{query}"</div>
        ) : (
          <div className="text-center mt-20 opacity-20">
            <Search size={48} className="mx-auto mb-4" />
            <p className="font-black">הקלד שם כדי להתחיל</p>
          </div>
        )}
      </div>

      {/* הצגת פרופיל מעל החיפוש */}
      {selectedUser && (
        <PublicProfile 
          userId={selectedUser} 
          currentUserId={currentUserId} 
          onClose={() => setSelectedUser(null)} 
          onOpenChat={() => {}} // צ'אט ייפתח מהמסך הראשי
        />
      )}
    </div>
  );
}
