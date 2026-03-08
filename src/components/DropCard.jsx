import React, { useState } from 'react';
import { Zap, Clock, ShieldAlert, Crown, MessageCircle, Search, ChevronDown, ChevronUp, Ghost, Share2, CircleDollarSign, Plus } from 'lucide-react';
import CommentsOverlay from './CommentsOverlay';
import { toast } from 'react-hot-toast';

const DropCard = ({ drop, onBoost, onSearch, handleSiphon, setSelectedUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const timeLeftMs = new Date(drop.expires_at).getTime() - Date.now();
  const timeLeftMinutes = Math.max(0, Math.floor(timeLeftMs / 60000));
  const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const hasHalo = drop.users?.has_halo;
  const hasLongDesc = drop.description && drop.description.length > 50;

  const handleShare = async () => {
    const dropUrl = `${window.location.origin}/?drop=${drop.id}`;
    const shareData = { 
      title: 'Dop', 
      text: `צפו בדרופ המטורף הזה ב-Dop! 🔥\n`, 
      url: dropUrl 
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else { 
        await navigator.clipboard.writeText(dropUrl); 
        toast.success('הקישור הועתק בהצלחה! 🔗', { 
          style: { background: '#121212', color: '#fff', border: '1px solid #333' } 
        }); 
      }
    } catch (error) { 
      console.log('שיתוף בוטל:', error); 
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-zinc-900 flex items-center justify-center overflow-hidden" dir="rtl">
      {isImage ? (
        <img src={drop.video_url} alt="Drop" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <video src={drop.video_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* הדרגתיות רקע שחור לקריאות טקסט */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* קופת פרס - תמיד בזהב */}
      {drop.bounty_pool > 0 && (
        <div className="absolute top-20 left-4 z-30 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse">
          <CircleDollarSign size={16} className="text-yellow-400" />
          <span className="text-yellow-400 font-black text-sm tracking-wider">קופה: {drop.bounty_pool.toFixed(1)}</span>
        </div>
      )}

      {/* טקסטים בצד ימין למטה */}
      <div className="absolute bottom-24 right-4 z-20 pointer-events-auto w-[75%] max-w-[300px] flex flex-col items-start gap-1">
        <div 
          className="flex items-center cursor-pointer active:scale-95 transition-all w-fit"
          onClick={(e) => { e.stopPropagation(); setSelectedUserId && setSelectedUserId(drop.user_id); }}
        >
          {/* שם המשתמש הוקטן לגודל סטנדרטי (text-base) וכתר קטן יותר (16) */}
          <h3 className="font-black text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1.5 text-white text-right">
            {hasHalo && <Crown size={16} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />}
            @{drop.users?.username || 'אנונימי'}
          </h3>
        </div>

        <div className="flex flex-col items-start w-full">
          <p className={`text-white text-sm font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,1)] leading-snug w-full text-right ${isExpanded ? '' : 'line-clamp-2'}`}>
            {drop.description}
          </p>
          {hasLongDesc && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-white/90 hover:text-white mt-1 transition-all active:scale-90 self-start drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* שעון דקות אדום */}
      <div className="absolute bottom-24 left-4 z-20 flex flex-col items-center justify-center pointer-events-none">
        <span className={`font-black text-xl leading-none drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] ${timeLeftMinutes < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {timeLeftMinutes}
        </span>
        <span className={`font-bold text-[9px] uppercase tracking-widest mt-1 ${timeLeftMinutes < 60 ? 'text-red-500/90' : 'text-white/70'}`}>
          דקות
        </span>
      </div>

      {/* פלוס שמאלי-עליון (פעולות סרטון) */}
      <div className="absolute top-6 left-4 z-20 flex flex-col gap-4 items-center">
        
        <button
          onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
          className={`flex items-center justify-center w-16 h-10 rounded-full shadow-2xl transition-all duration-300 ${showActions ? 'bg-white/20 backdrop-blur-xl border border-white/40 text-white' : 'bg-black/60 backdrop-blur-xl border border-white/20 text-white'}`}
        >
          <Plus size={28} />
        </button>

        {showActions && (
          <div className="flex flex-col gap-4 items-center animate-in slide-in-from-top-2 fade-in duration-300 pt-1">
            
            <button onClick={(e) => { e.stopPropagation(); onBoost(e); setShowActions(false); }} className="group relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95 transition-all">
              <Zap size={20} className="text-black" />
            </button>

            {handleSiphon && (
              <button onClick={(e) => { e.stopPropagation(); handleSiphon(); setShowActions(false); }} className="group relative w-11 h-11 bg-black/60 border border-red-500/40 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-90 transition-all">
                <Ghost size={20} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </button>
            )}

            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowComments(true); setShowActions(false); }} className="group relative w-11 h-11 bg-black/60 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
              <MessageCircle size={20} className="text-white" />
            </button>

            <button onClick={(e) => { e.stopPropagation(); handleShare(); setShowActions(false); }} className="group relative w-11 h-11 bg-black/60 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
              <Share2 size={20} className="text-white" />
            </button>

            <button onClick={(e) => { e.stopPropagation(); onSearch(); setShowActions(false); }} className="group relative w-11 h-11 bg-black/60 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
              <Search size={20} className="text-white" />
            </button>

          </div>
        )}
      </div>

      {showComments && <CommentsOverlay videoId={drop.id} onClose={() => setShowComments(false)} />}
    </div>
  );
};

export default DropCard;
