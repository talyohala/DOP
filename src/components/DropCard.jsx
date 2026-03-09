import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Clock, Volume2, VolumeX, ChevronDown, ChevronUp, Rocket, Hourglass, X, Send } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function DropCard({ drop, currentUserId, onBoost, onSiphon, onSearch, onUserClick }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  
  // States: Gamification & Economy
  const [localBounty, setLocalBounty] = useState(drop.bounty_pool || 0);
  const [isSiphoning, setIsSiphoning] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  // נתוני שרת חמים
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(drop.likes_count || 0);

  // מערכת תגובות
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(drop.comments_count || 0);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDesc = drop.description?.length > 40;
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  
  const mediaIsImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || drop.video_url?.includes('image') || drop.video_url?.includes('unsplash');

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

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('dop_comments')
        .select(`id, content, created_at, dop_users (id, username, avatar_url, has_halo)`)
        .eq('drop_id', drop.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;
    const commentText = newComment.trim();
    setNewComment('');

    try {
      const { data, error } = await supabase
        .from('dop_comments')
        .insert({ drop_id: drop.id, user_id: currentUserId, content: commentText })
        .select(`id, content, created_at, dop_users (id, username, avatar_url, has_halo)`).single();
      
      if (error) throw error;
      setComments(prev => [...prev, data]);
      setCommentsCount(prev => prev + 1);
      await supabase.from('dop_videos').update({ comments_count: commentsCount + 1 }).eq('id', drop.id);
      
      if(drop.user_id !== currentUserId) {
        await supabase.from('dop_notifications').insert({ 
          user_id: drop.user_id, 
          type: 'comment', 
          category: 'social',
          content: `הגיבו לך על הדרופ: "${commentText}"` 
        });
      }
    } catch (err) {
      toast.error('שגיאה בשליחת תגובה');
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return toast.error("עליך להתחבר");
    const newLikedState = !liked;
    const newCount = newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(newLikedState);
    setLikesCount(newCount);
    try {
      if (newLikedState) {
        await supabase.from('dop_likes').insert({ drop_id: drop.id, user_id: currentUserId });
        if(drop.user_id !== currentUserId) {
          await supabase.from('dop_notifications').insert({ 
            user_id: drop.user_id, 
            type: 'like', 
            category: 'social',
            content: `מישהו אהב את הנכס שלך!` 
          });
        }
      } else {
        await supabase.from('dop_likes').delete().eq('drop_id', drop.id).eq('user_id', currentUserId);
      }
      await supabase.from('dop_videos').update({ likes_count: newCount }).eq('id', drop.id);
    } catch (error) {
      setLiked(!newLikedState); setLikesCount(likesCount);
    }
  };

  const handleBoostClick = async (e) => {
    e.stopPropagation();
    if (!currentUserId) return toast.error("עליך להתחבר");
    if (currentUserId === drop.user_id) return toast.error("אי אפשר לתת בוסט לעצמך");
    if (isBoosting) return;

    setIsBoosting(true);
    try {
      const { data: userData } = await supabase.from('dop_users').select('dop_coins').eq('id', currentUserId).single();
      if (!userData || userData.dop_coins < 10) throw new Error("אין מספיק DOP לבוסט (נדרש 10)");

      await supabase.from('dop_users').update({ dop_coins: userData.dop_coins - 10 }).eq('id', currentUserId);
      await supabase.from('dop_videos').update({ bounty_pool: localBounty + 10 }).eq('id', drop.id);

      setLocalBounty(prev => prev + 10);

      await supabase.from('dop_notifications').insert({
        user_id: drop.user_id,
        type: 'boost',
        category: 'economy',
        content: `קיבלת בוסט של 10 DOP לנכס שלך!`
      });

      if (onBoost) onBoost();
    } catch (err) {
      toast.error(err.message || 'שגיאה בביצוע הבוסט', { id: 'boost-error' });
    } finally {
      setTimeout(() => setIsBoosting(false), 1200);
    }
  };

  const handleSiphonClick = async (e) => {
    e.stopPropagation();
    if (!currentUserId) return toast.error("עליך להתחבר");
    if (currentUserId === drop.user_id) return toast.error("אי אפשר לשאוב זמן לעצמך");
    if (isSiphoning) return;

    setIsSiphoning(true);
    try {
      const { data: userData } = await supabase.from('dop_users').select('dop_coins').eq('id', currentUserId).single();
      if (!userData || userData.dop_coins < 50) throw new Error("אין מספיק DOP לשאיבה (נדרש 50)");

      const dropData = await supabase.from('dop_videos').select('expires_at').eq('id', drop.id).single();
      const currentExpires = new Date(dropData.data.expires_at);
      const newExpires = new Date(currentExpires.getTime() - 30 * 60000);

      await supabase.from('dop_users').update({ dop_coins: userData.dop_coins - 50 }).eq('id', currentUserId);
      await supabase.from('dop_videos').update({ expires_at: newExpires.toISOString() }).eq('id', drop.id);

      await supabase.from('dop_notifications').insert({
        user_id: drop.user_id,
        type: 'attack',
        category: 'alerts',
        content: `מתקפת שאיבה! משתמש חתך לך 30 דקות מזמן האוויר.`
      });

      if (onSiphon) onSiphon();
    } catch (err) {
      toast.error(err.message || 'שגיאה בביצוע השאיבה', { id: 'siphon-error' });
    } finally {
      setTimeout(() => setIsSiphoning(false), 1200);
    }
  };

  const handleMediaTap = (e) => {
    if (showComments) { setShowComments(false); return; }
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 300 && tapLength > 0) {
      handleBoostClick(e);
      e.preventDefault();
    } else {
      if (!mediaIsImage && videoRef.current) {
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
        setIsPlaying(!isPlaying);
      }
    }
    lastTapRef.current = currentTime;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?drop=${drop.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: drop.title || 'Dop 2026', url: url }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('קישור הועתק ללוח!', { style: { background: '#111', color: '#fff' } });
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
        <div className="absolute top-6 right-4 z-20">
          <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-all relative">
            {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
          </button>
        </div>
      )}

      <div className="absolute bottom-20 right-4 z-20 w-[70%] pointer-events-none">
        <div className="flex flex-col items-start gap-3 pointer-events-auto" dir="rtl">
          <div className={`flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border shadow-md transition-colors ${isSiphoning ? 'border-purple-500/50' : 'border-white/10'}`}>
            <Clock size={12} className={isSiphoning ? "text-purple-400 animate-spin" : "text-emerald-400"} />
            <span className={`text-xs font-black tracking-wide transition-colors ${isSiphoning ? "text-purple-400" : "text-white"}`}>{timeLeft}</span>
          </div>

          <div className="flex flex-col items-start w-full">
            <button onClick={(e) => { e.stopPropagation(); onUserClick?.(); }} className="flex items-center gap-2.5 transition-all active:opacity-70 group w-fit relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg border border-black/40 overflow-hidden relative z-10">
                {drop.users?.avatar_url ? <img src={drop.users.avatar_url} className="w-full h-full object-cover" /> : <span className="text-black font-black text-sm">{drop.users?.username?.charAt(0)?.toUpperCase() || 'U'}</span>}
              </div>
              <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] relative z-10">{drop.users?.username || 'אנונימי'}</span>
            </button>

            <div className="w-full mt-2 pl-4">
              {drop.title && <h2 className="text-base font-black text-white mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">{drop.title}</h2>}
              {drop.description && (
                <div className="relative">
                  <p className={`text-sm text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium transition-all ${!isExpanded ? 'line-clamp-2' : ''}`} onClick={(e) => { e.stopPropagation(); hasLongDesc && setIsExpanded(!isExpanded); }}>
                    {drop.description}
                  </p>
                  {hasLongDesc && (
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 text-[10px] font-black">
                      {isExpanded ? 'הצג פחות' : 'קרא עוד'} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 left-4 flex flex-col gap-4 z-20">
        <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg relative">
            <Heart size={20} className={liked ? 'fill-rose-500 text-rose-500' : 'text-white'} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">{likesCount}</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); setShowComments(true); fetchComments(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg relative">
            <MessageCircle size={20} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">{commentsCount}</span>
        </button>

        {/* כפתור בוסט משופר עם אנימציית "בועות טיל" עדינה */}
        <button onClick={handleBoostClick} disabled={isBoosting} className="flex flex-col items-center gap-1 group relative">
          <div className={`w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center border group-active:scale-90 shadow-lg disabled:opacity-50 relative transition-all duration-300 ${isBoosting ? 'bg-emerald-500/20 border-emerald-400' : 'bg-emerald-900/40 border-emerald-500/40'}`}>
            <Rocket size={18} className="text-emerald-400" />
            
            {/* בועות אנרגיה עדינות */}
            {isBoosting && (
              <div className="absolute inset-0 flex justify-center items-end pointer-events-none">
                <div className="animate-in fade-in zoom-in-75 duration-200 fill-mode-both">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute -bottom-1 left-3"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping absolute -bottom-3 left-1"></span>
                    <span className="w-1 h-1 bg-emerald-200 rounded-full animate-ping absolute -bottom-2 right-2"></span>
                </div>
              </div>
            )}
          </div>
          <span className={`text-[10px] font-bold drop-shadow-md transition-colors ${isBoosting ? 'text-emerald-300' : 'text-emerald-400'}`}>{localBounty.toLocaleString()}</span>
        </button>

        {/* כפתור שאיבה משופר עם אנימציית פעימה עדינה */}
        <button onClick={handleSiphonClick} disabled={isSiphoning} className="flex flex-col items-center gap-1 group relative">
          <div className={`w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center border group-active:scale-90 shadow-lg disabled:opacity-50 relative transition-all duration-300 ${isSiphoning ? 'bg-purple-500/20 border-purple-400' : 'bg-purple-900/40 border-purple-500/40'}`}>
            <Hourglass size={18} className={`transition-transform duration-300 ${isSiphoning ? 'text-purple-300 rotate-180' : 'text-purple-400'}`} />
            
            {/* פעימת אנרגיה סגולה */}
            {isSiphoning && (
                <div className="absolute inset-0 animate-pulse bg-purple-500/30 rounded-full"></div>
            )}
          </div>
          <span className={`text-[10px] font-bold drop-shadow-md transition-colors ${isSiphoning ? 'text-purple-300' : 'text-purple-400'}`}>שאיבה</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg relative">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">שתף</span>
        </button>
      </div>

      {showComments && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={(e) => { e.stopPropagation(); setShowComments(false); }}>
          <div className="bg-[#111] w-full h-[65%] rounded-t-[32px] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-black text-lg text-white">{commentsCount} תגובות</h3>
              <button onClick={() => setShowComments(false)} className="bg-white/10 p-2 rounded-full active:scale-95"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5 hide-scrollbar relative">
               <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#111] to-transparent z-10"></div>
              {loadingComments ? (
                <div className="flex justify-center mt-10"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#10b981]"></div></div>
              ) : comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-500/30 shadow-md">
                      {comment.dop_users?.avatar_url ? <img src={comment.dop_users.avatar_url} className="w-full h-full object-cover" /> : <span className="text-emerald-400 font-black text-[10px]">{comment.dop_users?.username?.charAt(0)?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5"><span className="font-bold text-[11px] text-white/50">{comment.dop_users?.username}</span></div>
                      <p className="text-sm text-white mt-0.5 leading-snug">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/30 font-black mt-10">אין עדיין תגובות. היה הראשון!</div>
              )}
               <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#111] to-transparent z-10"></div>
            </div>
            <div className="p-4 bg-[#0a0a0a] border-t border-white/5 pb-8">
              <form onSubmit={handlePostComment} className="flex items-center gap-2">
                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="הוסף תגובה..." className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-full px-5 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors shadow-inner" />
                <button type="submit" disabled={!newComment.trim()} className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform shrink-0 shadow-lg"><Send size={18} className="text-white -ml-1" /></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
