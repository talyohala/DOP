import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, User, Clock, Volume2, VolumeX, ChevronDown, ChevronUp, Rocket, Hourglass } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function DropCard({ drop, currentUserId, onBoost, onSiphon, onSearch, onUserClick }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(drop.likes_count || 0);

  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDesc = drop.description?.length > 40;
  
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  const isImage = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('unsplash') || url.includes('image');
  };

  const mediaIsImage = isImage(drop.video_url);

  useEffect(() => {
    if (!currentUserId || !drop.id) return;
    const fetchLikeStatus = async () => {
      try {
        const { data } = await supabase.from('dop_likes').select('id').eq('drop_id', drop.id).eq('user_id', currentUserId).single();
        if (data) setLiked(true);
      } catch (err) {}
    };
    fetchLikeStatus();
  }, [currentUserId, drop.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaIsImage) return;

    const handleTimeUpdate = () => setProgress((video.currentTime / video.duration) * 100);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [mediaIsImage]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const diffMs = new Date(drop.expires_at) - new Date();
      if (diffMs <= 0) return setTimeLeft('פג תוקף');
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(diffHours > 0 ? `${diffHours}ש ${diffMins}ד` : `${diffMins} דק'`);
    };
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [drop.expires_at]);

  // זיהוי לחיצה כפולה (Double Tap) לבוסט, או לחיצה יחידה לפליי/פאוז
  const handleMediaTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // לחיצה כפולה - מעניק בוסט!
      if(onBoost) onBoost(e);
      e.preventDefault();
    } else {
      // לחיצה רגילה - מנגן או עוצר
      if (!mediaIsImage && videoRef.current) {
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
        setIsPlaying(!isPlaying);
      }
    }
    lastTapRef.current = currentTime;
  };

  const handleLike = async () => {
    if (!currentUserId) return toast.error("עליך להתחבר לאפליקציה");
    
    const newLikedState = !liked;
    const newCount = newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    setLiked(newLikedState);
    setLikesCount(newCount);

    try {
      if (newLikedState) {
        await supabase.from('dop_likes').insert({ drop_id: drop.id, user_id: currentUserId });
      } else {
        await supabase.from('dop_likes').delete().eq('drop_id', drop.id).eq('user_id', currentUserId);
      }
      await supabase.from('dop_videos').update({ likes_count: newCount }).eq('id', drop.id);
    } catch (error) {
      setLiked(!newLikedState);
      setLikesCount(likesCount);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?drop=${drop.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: drop.title || 'Dop 2026', text: 'צפה בנכס התוכן הזה באפליקציית Dop!', url: url });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('קישור הועתק ללוח!', { style: { background: '#111', color: '#fff', borderRadius: '16px' } });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden" onClick={handleMediaTap}>
      
      {drop.video_url ? (
        mediaIsImage ? (
          <img src={drop.video_url} alt="Drop" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} src={drop.video_url} className="w-full h-full object-cover" loop autoPlay muted={isMuted} playsInline />
        )
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#050505] flex items-center justify-center">
          <div className="text-8xl font-black text-white/5">{drop.users?.username?.charAt(0)?.toUpperCase() || 'D'}</div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {!mediaIsImage && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/50 z-10">
          <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {!mediaIsImage && (
        <div className="absolute top-6 left-4 z-20">
          <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-all">
            {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
          </button>
        </div>
      )}

      {/* מידע צד שמאל */}
      <div className="absolute bottom-20 left-4 z-20 w-[75%] pointer-events-none">
        <div className="flex flex-col items-start gap-3 pointer-events-auto" dir="ltr">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-md" dir="rtl">
            <Clock size={12} className="text-emerald-400" />
            <span className="text-xs font-black text-white tracking-wide">{timeLeft}</span>
          </div>

          <div className="flex flex-col items-start w-full">
            <button onClick={(e) => { e.stopPropagation(); onUserClick?.(); }} className="flex items-center gap-2.5 transition-all active:opacity-70 group w-fit" dir="rtl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg border border-black/40 group-active:scale-95 transition-transform shrink-0">
                <span className="text-black font-black text-sm">{drop.users?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{drop.users?.username || 'אנונימי'}</span>
            </button>

            <div className="w-full mt-2 pl-4 text-left" dir="auto">
              {drop.title && <h2 className="text-base font-black text-white mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">{drop.title}</h2>}
              {drop.description && (
                <div className="relative">
                  <p className={`text-sm text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`} onClick={(e) => { e.stopPropagation(); hasLongDesc && setIsExpanded(!isExpanded); }}>
                    {drop.description}
                  </p>
                  {hasLongDesc && (
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 text-[10px] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {isExpanded ? 'הצג פחות' : 'קרא עוד'} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* כפתורי פעולה ימניים (לייק, בוסט, גניבת זמן, שיתוף) */}
      <div className="absolute bottom-28 right-4 flex flex-col gap-4 z-20">
        
        {/* לייק */}
        <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg">
            <Heart size={20} className={liked ? 'fill-rose-500 text-rose-500' : 'text-white'} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">{likesCount}</span>
        </button>

        {/* בוסט */}
        <button onClick={(e) => { e.stopPropagation(); onBoost?.(e); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-emerald-900/40 backdrop-blur-md rounded-full flex items-center justify-center border border-emerald-500/40 group-active:scale-90 transition-all shadow-lg">
            <Rocket size={18} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 drop-shadow-md">בוסט</span>
        </button>

        {/* גניבת זמן */}
        <button onClick={(e) => { e.stopPropagation(); onSiphon?.(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-purple-900/40 backdrop-blur-md rounded-full flex items-center justify-center border border-purple-500/40 group-active:scale-90 transition-all shadow-lg">
            <Hourglass size={18} className="text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-purple-400 drop-shadow-md">שאיבה</span>
        </button>

        {/* שיתוף */}
        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">שתף</span>
        </button>

      </div>
    </div>
  );
}
