import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) { setResults([]); return; }
      const { data } = await supabase.from('dop_users').select('*').ilike('display_name', `%${query}%`).limit(10);
      if (data) setResults(data);
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ background: '#000', minHeight: '100dvh', overflowY: 'auto', padding: '40px 20px 120px', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={24} color="#fff" />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchIcon size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש יוצרים ב-DOP..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 48px 16px 16px', borderRadius: 24, fontSize: 16, outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((u) => (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            key={u.id}
            onClick={() => navigate(`/u/${u.id}`)}
            style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 900 }}>
              {u.display_name?.charAt(0)}
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>@{u.display_name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
