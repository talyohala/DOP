import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, UserPlus, UserMinus, MessageCircle, Grid, Zap, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sounds } from '../utils/sounds';

export default function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, totalBoosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPublicData = async () => {
      const { data: userData } = await supabase.from('dop_users').select('*').eq('id', id).single();
      if (userData) setProfile(userData);

      const { data: vids } = await supabase.from('dop_videos').select('*').eq('creator_id', id).order('created_at', { ascending: false });
      if (vids) setVideos(vids);

      const boosts = vids?.reduce((acc, curr) => acc + (curr.total_boosts || 0), 0) || 0;
      const { count: followersCount } = await supabase.from('dop_follows').select('*', { count: 'exact', head: true }).eq('following_id', id);
      const { count: followingCount } = await supabase.from('dop_follows').select('*', { count: 'exact', head: true }).eq('follower_id', id);

      setStats({ followers: followersCount || 0, following: followingCount || 0, totalBoosts: boosts });

      if (user) {
        const { data: followData } = await supabase.from('dop_follows').select('*').eq('follower_id', user.id).eq('following_id', id).single();
        setIsFollowing(!!followData);
      }
      setLoading(false);
    };
    fetchPublicData();
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!user) return toast.error('יש להתחבר כדי לעקוב');
    if (user.id === id) return;
    sounds.playZap();
    if (isFollowing) {
      await supabase.from('dop_follows').delete().eq('follower_id', user.id).eq('following_id', id);
      setIsFollowing(false);
      setStats(s => ({ ...s, followers: s.followers - 1 }));
    } else {
      await supabase.from('dop_follows').insert([{ follower_id: user.id, following_id: id }]);
      setIsFollowing(true);
      setStats(s => ({ ...s, followers: s.followers + 1 }));
    }
  };

  if (loading) return <div style={{ background: '#050508', height: '100vh' }} />;

  const isMe = user?.id === id;

  return (
    <div style={{ 
      backgroundColor: '#000', 
      backgroundImage: `radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
      height: '100dvh', // גובה קבוע
      overflowY: 'auto', // הפעלת גלילה
      WebkitOverflowScrolling: 'touch', // גלילה חלקה
      direction: 'rtl', 
      padding: '40px 20px 120px', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16, flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowRight size={24} color="#fff" />
        </button>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>פרופיל יוצר</h1>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #3b82f6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
          {profile?.display_name?.charAt(0) || 'U'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>@{profile?.display_name || 'user'}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, paddingBottom: 20, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.followers}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>עוקבים</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.following}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>נעקבים</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{stats.totalBoosts}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>בוסטים</div></div>
        </div>

        {!isMe && (
          <div style={{ display: 'flex', gap: 12, width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleFollowToggle} style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isFollowing ? 'rgba(255,255,255,0.1)' : '#fff', color: isFollowing ? '#fff' : '#000' }}>
              {isFollowing ? <><UserMinus size={18} /> בטל מעקב</> : <><UserPlus size={18} /> עקוב</>}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(`/chat/${id}`)} style={{ width: 48, height: 48, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <MessageCircle size={22} color="#fff" />
            </motion.button>
          </div>
        )}
      </motion.div>

      <div style={{ marginTop: 32, paddingBottom: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>הדרופים של {profile?.display_name}</h3>
        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>אין דרופים עדיין.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {videos.map(vid => (
              <div key={vid.id} onClick={() => navigate(`/?v=${vid.id}`)} style={{ aspectRatio: '9/16', borderRadius: 20, background: '#111', overflow: 'hidden', position: 'relative' }}>
                {vid.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? <img src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
