import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Grid, Zap, Clock, Gem, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, totalBoosts: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: vids } = await supabase.from('dop_videos').select('*').eq('creator_id', user.id).order('created_at', { ascending: false });
      if (vids) setVideos(vids);
      const boosts = vids?.reduce((acc, curr) => acc + (curr.total_boosts || 0), 0) || 0;
      const { count: followersCount } = await supabase.from('dop_follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
      const { count: followingCount } = await supabase.from('dop_follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
      setStats({ followers: followersCount || 0, following: followingCount || 0, totalBoosts: boosts });
    };
    fetchData();
  }, [user]);

  return (
    <div style={{ 
      backgroundColor: '#000', 
      height: '100dvh', // גובה קבוע
      overflowY: 'auto', // הפעלת גלילה
      WebkitOverflowScrolling: 'touch', // גלילה חלקה באייפון
      direction: 'rtl', 
      padding: '40px 20px 120px', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>הפרופיל שלי</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button onClick={() => navigate('/settings')} whileTap={{ scale: 0.9 }} style={{ width: 40, height: 40, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Settings size={20} color="#fff" />
          </motion.button>
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#000', marginBottom: 16 }}>
          {profile?.display_name?.charAt(0) || 'U'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>@{profile?.display_name || 'user'}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.followers}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>עוקבים</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.following}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>נעקבים</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.totalBoosts}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>בוסטים</div></div>
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: 12, marginTop: 16, flexShrink: 0 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>זמן בקופה</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{profile?.time_balance || 0} דק'</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>DOP Coins</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{(profile?.dop_coins || 0).toFixed(1)}</div>
        </div>
      </motion.div>

      <div style={{ marginTop: 32, paddingBottom: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>הדרופים שלי</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {videos.map(vid => (
            <div key={vid.id} onClick={() => navigate(`/?v=${vid.id}`)} style={{ aspectRatio: '9/16', borderRadius: 20, background: '#111', overflow: 'hidden', position: 'relative' }}>
              {vid.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? <img src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
