import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MessageCircle, Send, Share, Search, Flame, X, ChevronDown, ChevronUp, Skull } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/sounds';

export const CrystalDopIcon = ({ size = 20, color = "#fff", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <path d="M12 2L19 9L12 16L5 9L12 2Z" fill={color} />
    <path d="M12 22L5 15L12 8L19 15L12 22Z" fill={color} fillOpacity="0.5" />
    <path d="M12 2L19 9L12 16L5 9L12 2Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M12 22L5 15L12 8L19 15L12 22Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

const FeedItem = ({ video, isActive, user, profile, fetchProfile, onNavigateProfile, onNavigateTrending }: any) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isDead, setIsDead] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  let lastTap = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = new Date(video.expires_at).getTime() - new Date().getTime();
      if (distance <= 0) {
        clearInterval(timer);
        setTimeRemaining('00:00:00');
        setIsDead(true);
      } else {
        setIsDead(false);
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [video.expires_at]);

  useEffect(() => {
    if (!showComments) return;
    const fetchComments = async () => {
      const { data } = await supabase.from('dop_comments').select('*, user:dop_users(display_name)').eq('video_id', video.id).order('created_at', { ascending: true });
      if (data) setComments(data);
    };
    fetchComments();
  }, [showComments, video.id]);

  useEffect(() => { if (commentsEndRef.current) commentsEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const handleGiveTime = async () => {
    if (isDead || !user) return;
    if (user.id === video.creator_id) return toast.error('לא ניתן להציל דרופ אישי');
    if ((profile?.time_balance || 0) < 5) return toast.error('אין מספיק דקות');
    
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
    sounds.playZap();
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

    const { error } = await supabase.rpc('boost_video_time', { v_id: video.id, u_id: user.id, minutes_to_add: 5 });
    if (!error) fetchProfile(user.id);
  };

  const handleDoubleTap = (e: any) => {
    const now = Date.now();
    if (now - lastTap.current < 300) handleGiveTime();
    lastTap.current = now;
  };

  const shareVideo = async () => {
    const url = `https://y-mu-green.vercel.app/?v=${video.id}`;
    if (user) {
      await supabase.from('dop_users').update({ dop_coins: (profile?.dop_coins || 0) + 0.5 }).eq('id', user.id);
      fetchProfile(user.id);
      toast.success('+0.5 DOP Coins!');
      sounds.playCoin();
    }
    if (navigator.share) navigator.share({ title: 'DOP Drop', url });
  };

  const postComment = async () => {
    if (!newComment.trim() || !user || isDead) return;
    const tempText = newComment;
    setNewComment('');
    const { data } = await supabase.from('dop_comments').insert([{ video_id: video.id, user_id: user.id, text: tempText }]).select('*, user:dop_users(display_name)').single();
    if (data) setComments(prev => [...prev, data]);
    await supabase.rpc('add_video_seconds', { v_id: video.id, seconds_to_add: 30 });
    sounds.playCoin();
  };

  const isImage = video.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
  const description = video.description || '';
  const isLongText = description.length > 50;

  return (
    <div style={{ height: '100%', width: '100vw', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '65px 8px 95px', boxSizing: 'border-box' }}>
      
      <motion.div 
        onClick={handleDoubleTap}
        style={{ width: '100%', height: '100%', borderRadius: 32, background: '#111', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
      >
        {isDead ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skull size={60} color="#ff453a" opacity={0.3} /></div>
        ) : (
          isImage ? <img src={video.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <video src={video.video_url} autoPlay={isActive} loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        <AnimatePresence>
          {showHeartAnim && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
              <CrystalDopIcon size={120} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'absolute', top: 0, width: '100%', height: '25%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none' }} />

        {!isDead && (
          <>
            {/* שם המשתמש בפינה הימנית העליונה */}
            <div onClick={(e) => { e.stopPropagation(); onNavigateProfile(video.creator_id); }} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 20, color: '#fff', fontWeight: 800, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              @{video.creator?.display_name || 'user'}
            </div>

            {/* שעון הזמן בפינה השמאלית העליונה */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'rgba(255,69,58,0.2)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,69,58,0.3)', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="#ff453a" />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>{timeRemaining}</span>
            </div>
          </>
        )}

        {/* כפתורים בצד ימין למטה */}
        {!isDead && (
          <div style={{ position: 'absolute', bottom: 20, right: 12, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 30, alignItems: 'center' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleGiveTime(); }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', width: 46, height: 46, borderRadius: 23, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <CrystalDopIcon size={20} color="#fff" />
              <span style={{ fontSize: 10, fontWeight: 900, marginTop: 2 }}>{video.total_boosts}</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setShowComments(true); }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', width: 46, height: 46, borderRadius: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <MessageCircle size={20} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onNavigateTrending(); }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', width: 46, height: 46, borderRadius: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <Flame size={20} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); shareVideo(); }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', width: 46, height: 46, borderRadius: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <Share size={18} />
            </motion.button>
          </div>
        )}

        {/* תיאור הסרטון בצד שמאל למטה מעוגן ומיושר לשמאל */}
        {!isDead && (
          <div style={{ position: 'absolute', bottom: 20, left: 16, width: 'calc(100% - 80px)', zIndex: 10, direction: 'ltr', textAlign: 'left', pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.4, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', textAlign: 'left' }}>
                {description}
              </p>
              {isLongText && (
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: 0.8 }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'פחות' : 'עוד'}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '65dvh', zIndex: 99999, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>הודעות מתפוצצות</span>
               <button onClick={() => setShowComments(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color="#fff" /></button>
             </div>
             
             <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comments.length === 0 ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>תהיה הראשון להגיב!</div> : comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span onClick={() => onNavigateProfile(c.user_id)} style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>@{c.user?.display_name || 'user'}</span>
                    <span style={{ fontSize: 15, color: '#fff', lineHeight: 1.4 }}>{c.text}</span>
                  </div>
                ))}
                <div ref={commentsEndRef} />
             </div>

             <div style={{ padding: '16px 24px calc(30px + env(safe-area-inset-bottom))', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 8, alignItems: 'center' }}>
                  <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && postComment()} placeholder="הוסף הודעה..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '0 12px', fontSize: 15 }} />
                  <button onClick={postComment} style={{ width: 36, height: 36, background: '#fff', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={16} color="#000" style={{ transform: 'translateX(-1px)' }} /></button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Feed() {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from('dop_videos').select('*, creator:dop_users(display_name)').gt('expires_at', new Date().toISOString()).order('expires_at', { ascending: true });
      if (data) setVideos([...data, ...data]);
    };
    fetchVideos();
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    setActiveIndex(index);
    if (index >= videos.length - 2 && videos.length > 0) {
      setVideos(prev => [...prev, ...prev.slice(0, 5)]);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      
      {/* חיפוש iOS Standard */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 20px)', left: 24, right: 24, zIndex: 100, display: 'flex', justifyContent: 'center' }}>
         <motion.div 
           whileTap={{ scale: 0.98 }}
           onClick={() => navigate('/search')}
           style={{ width: '100%', maxWidth: 320, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', border: '1px solid rgba(255,255,255,0.1)', height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
         >
           <Search size={14} />
           <span style={{ fontSize: 14, fontWeight: 600 }}>חיפוש ב-DOP</span>
         </motion.div>
      </div>

      <div ref={containerRef} onScroll={handleScroll} style={{ height: '100%', width: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}>
        {videos.map((v, idx) => (
          <FeedItem key={`${v.id}-${idx}`} video={v} isActive={idx === activeIndex} user={user} profile={profile} fetchProfile={fetchProfile} onNavigateProfile={(id: string) => navigate(`/u/${id}`)} onNavigateTrending={() => navigate('/trending')} />
        ))}
      </div>
    </div>
  );
}
