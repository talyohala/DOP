import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CrystalDopIcon } from './Feed';

export default function Trending() {
  const navigate = useNavigate();
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase.from('dop_videos').select('*, creator:dop_users(display_name)').gt('expires_at', new Date().toISOString()).order('total_boosts', { ascending: false }).limit(50);
      if (data) setTrendingVideos(data);
    };
    fetchTrending();
  }, []);

  return (
    <div style={{ background: '#000', height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '40px 20px 120px', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: '22px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={24} color="#fff" /></button>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>הכי חמים <Flame size={26} color="#ff453a" /></h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {trendingVideos.map((vid, idx) => (
          <motion.div key={vid.id} onClick={() => navigate(`/?v=${vid.id}`)} style={{ aspectRatio: '9/16', borderRadius: 24, background: '#111', overflow: 'hidden', position: 'relative', border: idx === 0 ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)' }}>
            {vid.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? <img src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={vid.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
            {idx === 0 && <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 24 }}>👑</div>}
            <div style={{ position: 'absolute', top: 12, right: 12, background: idx < 3 ? '#fff' : 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 12, color: idx < 3 ? '#000' : '#fff', fontSize: 13, fontWeight: 900 }}>#{idx + 1}</div>
            <div style={{ position: 'absolute', bottom: 12, right: 12, left: 12 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 4 }}>@{vid.creator?.display_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 12, fontWeight: 700 }}>
                <CrystalDopIcon size={14} color="#fff" /> {vid.total_boosts}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
