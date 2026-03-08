import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, LogOut, User, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bioLink, setBioLink] = useState(profile?.bio_link || '');

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('dop_users').update({ display_name: displayName, bio_link: bioLink }).eq('id', user.id);
    if (!error) {
      toast.success('הפרופיל עודכן בהצלחה');
      fetchProfile(user.id);
    } else {
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div style={{ background: '#000', height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '40px 20px 120px', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowRight size={24} color="#fff" />
        </button>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>הגדרות</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 12 }}><User size={18} /> שם תצוגה</div>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: 16, borderRadius: 16, outline: 'none' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 12 }}><LinkIcon size={18} /> קישור לפרופיל (אינסטגרם/אתר)</div>
          <input value={bioLink} onChange={e => setBioLink(e.target.value)} placeholder="www.instagram.com/user" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: 16, borderRadius: 16, outline: 'none', direction: 'ltr' }} />
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} style={{ background: '#fff', color: '#000', padding: 18, borderRadius: 24, fontWeight: 900, fontSize: 16, border: 'none', marginTop: 10 }}>
          שמור שינויים
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} style={{ background: 'rgba(255,69,58,0.1)', color: '#ff453a', padding: 18, borderRadius: 24, fontWeight: 900, fontSize: 16, border: '1px solid rgba(255,69,58,0.2)', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <LogOut size={20} /> התנתק מהחשבון
        </motion.button>
      </div>
    </div>
  );
}
