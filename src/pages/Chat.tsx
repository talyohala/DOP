import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      // שולף משתמשים כדי להתחיל איתם שיחה (בגרסה מתקדמת נשלוף רק את מי שדיברת איתו)
      const { data } = await supabase
        .from('dop_users')
        .select('id, display_name')
        .neq('id', user?.id)
        .limit(20);
      
      if (data) setUsers(data);
    };
    if (user) fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#000', minHeight: '100dvh', direction: 'rtl', padding: '40px 20px 120px', display: 'flex', flexDirection: 'column' }}>
      
      {/* כותרת מודרנית */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <MessageCircle size={22} color="#fff" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>הודעות</h1>
      </div>

      {/* שורת חיפוש מזכוכית */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חיפוש"
          style={{ 
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            color: '#fff', padding: '16px 16px 16px 48px', paddingRight: 48, borderRadius: 20, 
            fontSize: 16, outline: 'none', backdropFilter: 'blur(10px)' 
          }}
        />
      </div>

      {/* רשימת השיחות */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={u.id}
              onClick={() => navigate(`/chat/${u.id}`)}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, 
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 900 }}>
                  {u.display_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{u.display_name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>הקש כדי להתחיל שיחה</div>
                </div>
              </div>
              <ChevronLeft size={20} color="rgba(255,255,255,0.3)" />
            </motion.div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 40, fontSize: 15 }}>
            לא נמצאו משתמשים
          </div>
        )}
      </div>

    </div>
  );
}
