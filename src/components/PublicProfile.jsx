import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, Check, Play, Coins, Gem, Users, 
  LayoutGrid, MessageCircle, UserPlus, UserMinus, 
  Link as LinkIcon, HeartPulse, Crown, Settings, Share2
} from 'lucide-react';
import EditProfile from './EditProfile';

export default function PublicProfile({ userId, currentUserId, onClose, onOpenChat }) {
  const [profile, setProfile] = useState(null);
  const [drops, setDrops] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // הבדיקה הקריטית - האם אני מסתכל על הפרופיל של עצמי?
  const isOwnProfile = String(currentUserId).trim() === String(userId).trim();

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('dop_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      const { data: dropsData, error: dropsError } = await supabase
        .from('dop_videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dropsError) throw dropsError;
      setDrops(dropsData || []);

      if (currentUserId && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('dop_followers')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
          .single();
        
        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error(error);
      toast.error("שגיאה בטעינת הפרופיל");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId) return toast.error("עליך להתחבר כדי לעקוב");
    if (isOwnProfile) return toast.error("אי אפשר לעקוב אחרי עצמך");

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('dop_followers').delete().eq('follower_id', currentUserId).eq('following_id', userId);
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) }));
      } else {
        await supabase.from('dop_followers').insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
        await supabase.from('dop_notifications').insert({ user_id: userId, type: 'follow', content: 'מישהו התחיל לעקוב אחריך!' });
      }
    } catch (error) { toast.error("הפעולה נכשלה"); } 
    finally { setFollowLoading(false); }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/?user=${userId}`;
    if (navigator.share) {
      try { await navigator.share({ title: `הפרופיל של ${profile.username} ב-DOP`, url: url }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('קישור הועתק!');
    }
  };

  const handleUpdateProfile = (updatedData) => {
    setProfile(updatedData);
    setShowEdit(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-[#030303] text-white overflow-y-auto" dir="rtl">
      
      {showEdit && <EditProfile user={profile} onClose={() => setShowEdit(false)} onUpdateUser={handleUpdateProfile} />}
      
      <div className="min-h-full pb-20">
        
        <button 
          onClick={onClose}
          className="fixed top-6 right-4 z-[160] w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ChevronRight size={24} />
        </button>

        <div 
          className="absolute top-0 left-0 w-full h-80 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${profile.custom_pulse_color || '#10b981'}, transparent 70%)` }}
        />

        <div className="relative z-10 px-4 pt-20">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-32 rounded-[40px] bg-[#0a0a0a] border-2 flex items-center justify-center text-5xl font-black shadow-2xl relative mb-6 overflow-hidden" style={{ borderColor: profile.custom_pulse_color || '#10b981' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profile.username?.charAt(0).toUpperCase()}</span>
              )}
              {profile.premium_tier !== 'free' && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-2 rounded-[12px] z-20 shadow-xl">
                  <Crown size={16} className="fill-black" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-black flex items-center gap-2">
              {profile.username || 'אנונימי'}
              {profile.has_halo && <Check size={22} className="text-blue-400" />}
            </h1>

            {profile.profile_link && (
              <a 
                href={profile.profile_link.startsWith('http') ? profile.profile_link : `https://${profile.profile_link}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 mt-2 text-blue-400 text-sm font-bold bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20"
              >
                <LinkIcon size={14} />
                {profile.profile_link.replace(/^https?:\/\//, '')}
              </a>
            )}

            <div className="flex gap-3 mt-8 w-full max-w-sm">
              {isOwnProfile ? (
                <>
                  <button onClick={() => setShowEdit(true)} className="flex-1 bg-white/10 text-white font-black py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform">
                    <Settings size={20} /> עריכה
                  </button>
                  <button onClick={handleShareProfile} className="flex-1 bg-white/10 text-white font-black py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform">
                    <Share2 size={20} /> שיתוף
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`flex-1 font-black py-4 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${isFollowing ? 'bg-white/10 text-white border border-white/10' : 'bg-white text-black'}`}
                  >
                    {followLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      <><UserMinus size={20} /> עוקב</>
                    ) : (
                      <><UserPlus size={20} /> עקוב</>
                    )}
                  </button>
                  <button 
                    onClick={() => onOpenChat && onOpenChat(userId)}
                    className="flex-1 bg-white/10 text-white font-black py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform"
                  >
                    <MessageCircle size={20} /> צ'אט
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[28px] text-center">
              <span className="block text-2xl font-black">{profile.followers_count || 0}</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">עוקבים</span>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[28px] text-center">
              <span className="block text-2xl font-black">{drops.length}</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">נכסים</span>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[28px] text-center">
              <span className="block text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
                {profile.dop_coins > 1000 ? (profile.dop_coins / 1000).toFixed(1) + 'k' : profile.dop_coins}
                <Coins size={14} />
              </span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">DOP</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black mb-6 px-2 flex items-center gap-2">
              <LayoutGrid size={20} className="text-white/40" />
              פורטפוליו נכסים
            </h2>
            
            {drops.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {drops.map(drop => (
                  <div key={drop.id} className="aspect-[9/16] bg-[#0a0a0a] rounded-[20px] relative overflow-hidden border border-white/5 group active:scale-95 transition-transform">
                    {drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || drop.video_url?.includes('image') ? (
                      <img src={drop.video_url} className="w-full h-full object-cover opacity-80" alt="drop" />
                    ) : (
                      <video src={drop.video_url} className="w-full h-full object-cover opacity-80" muted playsInline />
                    )}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-black flex items-center gap-1 border border-white/10 w-[85%] justify-center">
                      <HeartPulse size={10} className="text-emerald-400" />
                      <span>{drop.bounty_pool}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0a0a0a] rounded-[32px] border border-white/5">
                <Play size={40} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-black text-sm">היוצר טרם העלה נכסים</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
