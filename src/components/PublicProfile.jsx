import React, { useState, useEffect } from 'react';
import { X, Crown, Shield, UserPlus, UserCheck, Loader2, Zap, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const PublicProfile = ({ userId, currentUserId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    
    // שליפת פרטי המשתמש
    const { data: userData } = await supabase.from('dop_users').select('*').eq('id', userId).single();
    if (userData) setProfile(userData);

    // שליפת הדרופים הפעילים שלו
    const now = new Date().toISOString();
    const { data: userDrops } = await supabase
      .from('dop_videos')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
    if (userDrops) setDrops(userDrops);

    // סטטיסטיקות מעקבים
    const { count: followers } = await supabase.from('dop_followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: following } = await supabase.from('dop_followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    // האם אני עוקב אחריו?
    if (currentUserId && currentUserId !== userId) {
      const { data: followData } = await supabase
        .from('dop_followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();
      if (followData) setIsFollowing(true);
    }

    setLoading(false);
  };

  const handleToggleFollow = async () => {
    if (!currentUserId) return;
    setActionLoading(true);

    try {
      if (isFollowing) {
        // הסרת עוקב
        await supabase.from('dop_followers').delete().eq('follower_id', currentUserId).eq('following_id', userId);
        setFollowersCount(prev => prev - 1);
        setIsFollowing(false);
      } else {
        // הוספת עוקב
        await supabase.from('dop_followers').insert({ follower_id: currentUserId, following_id: userId });
        setFollowersCount(prev => prev + 1);
        setIsFollowing(true);
        toast.success(`הצטרפת לכנופיה של ${profile.username}!`, { style: { background: '#18181b', color: '#10b981' } });

        // שליחת התראה לנעקב
        const { data: currentUserData } = await supabase.from('dop_users').select('username').eq('id', currentUserId).single();
        await supabase.from('dop_notifications').insert({
          user_id: userId,
          content: `${currentUserData?.username || 'מישהו'} התחיל לעקוב אחריך והצטרף לכנופיה שלך! 🤝`,
          type: 'system'
        });
      }
    } catch (error) {
      console.error('שגיאה בפעולת מעקב:', error);
      toast.error('שגיאה. נסה שוב.', { style: { background: '#18181b', color: '#fff' } });
    }
    setActionLoading(false);
  };

  const totalBoosts = drops.reduce((sum, drop) => sum + (drop.boosts || 0), 0);

  return (
    <div className="fixed inset-0 bg-[#050505] z-[110] flex flex-col font-sans text-white animate-in slide-in-from-right duration-300 overflow-y-auto" dir="rtl">
      {/* הדר עליון */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-zinc-800/60 to-transparent z-0"></div>
      
      <button onClick={onClose} className="absolute top-12 right-6 z-20 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full transition-all active:scale-95">
        <X size={20} />
      </button>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="relative z-10 flex flex-col items-center pt-24 px-6 pb-28">
          
          <div className={`w-32 h-32 rounded-full bg-black border-4 ${profile.has_halo ? 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]' : 'border-white/10 shadow-2xl'} overflow-hidden relative mb-4`}>
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-white/20 font-black">@</div>}
          </div>

          <h2 className={`text-3xl font-black flex items-center gap-2 tracking-tighter ${profile.has_halo ? 'text-yellow-400' : 'text-white'}`}>
            {profile.has_halo && <Crown size={24} className="text-yellow-400" />}
            @{profile.username || 'אנונימי'}
          </h2>

          <div className="flex gap-6 mt-6 bg-zinc-900/80 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white/5 shadow-xl">
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">{followersCount}</span>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">עוקבים</span>
             </div>
             <div className="w-px bg-white/10"></div>
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">{followingCount}</span>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">נעקבים</span>
             </div>
             <div className="w-px bg-white/10"></div>
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-blue-400">{totalBoosts}</span>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">בוסטים</span>
             </div>
          </div>

          {currentUserId !== userId && (
            <button 
              onClick={handleToggleFollow}
              disabled={actionLoading}
              className={`mt-6 w-full max-w-[200px] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isFollowing ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500'}`}
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : isFollowing ? (
                <><UserCheck size={18} /> חבר כנופיה</>
              ) : (
                <><UserPlus size={18} /> עקוב</>
              )}
            </button>
          )}

          <div className="w-full mt-12">
            <h3 className="text-white font-black text-lg tracking-widest uppercase mb-4 px-2">דרופים פעילים ({drops.length})</h3>
            
            {drops.length === 0 ? (
              <div className="text-center mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <Shield size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 font-bold text-sm">אין דרופים פעילים כרגע.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {drops.map(drop => {
                  const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                  const timeLeftMinutes = Math.max(0, Math.floor((new Date(drop.expires_at).getTime() - Date.now()) / 60000));
                  
                  return (
                    <div key={drop.id} className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 relative group shadow-lg">
                      {isImage ? <img src={drop.video_url} className="w-full h-full object-cover opacity-80" /> : <video src={drop.video_url} className="w-full h-full object-cover opacity-80" />}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                         <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] font-black text-yellow-400 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm"><Zap size={10}/> {drop.boosts || 0}</span>
                            <span className={`flex items-center gap-1 text-[10px] font-black bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm ${timeLeftMinutes < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}><Clock size={10}/> {timeLeftMinutes} דק'</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default PublicProfile;
