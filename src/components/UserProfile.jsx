import React, { useState, useEffect } from 'react';
import { Crown, Check, Play, Coins, Gem, Users, LayoutGrid, Settings, ChevronRight, Link as LinkIcon, Instagram, HeartPulse } from 'lucide-react';
import SettingsScreen from './SettingsScreen';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function UserProfile({ user, drops, onClose, onUpdateUser }) {
  const [showSettings, setShowSettings] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // פונקציה לשליפת כמות העוקבים העדכנית
    const fetchFollowStats = async () => {
      const { count: followers } = await supabase.from('dop_followers').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
      const { count: following } = await supabase.from('dop_followers').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
      
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    };

    fetchFollowStats();

    // האזנה בזמן אמת - אם מישהו עוקב (או מסיר עוקב), המספר מתעדכן מיד!
    const followChannel = supabase.channel('custom-followers-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dop_followers', filter: `following_id=eq.${user.id}` },
        () => {
          fetchFollowStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(followChannel);
    };
  }, [user]);

  if (!user) return null;

  const pulseColor = user.custom_pulse_color || '#10b981';

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] text-white overflow-y-auto" dir="rtl">
      {showSettings && <SettingsScreen user={user} onClose={() => setShowSettings(false)} onUpdateUser={onUpdateUser} />}
      
      <div className="min-h-full pb-32">
        <div className="absolute top-0 left-0 w-full h-72 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${pulseColor}, transparent 70%)` }}></div>

        <div className="absolute top-6 left-4 right-4 z-50 flex justify-between items-center">
          <button onClick={() => setShowSettings(true)} className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Settings size={24} className="text-white" />
          </button>
          <button onClick={onClose} className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="relative z-10 px-4 pt-20">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-32 h-32 rounded-[32px] bg-[#0a0a0a] border-2 flex items-center justify-center text-5xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.2)] relative mb-5 overflow-hidden" style={{ borderColor: pulseColor }}>
              {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover relative z-10" alt="Avatar" /> : <span className="relative z-10">{user.username?.charAt(0).toUpperCase()}</span>}
              {user.premium_tier !== 'free' && <div className="absolute -top-3 -right-3 bg-amber-500 text-black p-2 rounded-[12px] z-20"><Crown size={16} className="fill-black" /></div>}
            </div>

            <h1 className="text-3xl font-black flex items-center gap-2">
              {user.username || 'אנונימי'}
              {user.has_halo && <Check size={22} className="text-blue-400" />}
            </h1>

            <div className="flex gap-2 flex-wrap justify-center mt-3">
              {user.profile_link && (
                <a href={user.profile_link.startsWith('http') ? user.profile_link : `https://${user.profile_link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <LinkIcon size={14} /> אתר
                </a>
              )}
              {user.instagram_url && (
                <a href={user.instagram_url.startsWith('http') ? user.instagram_url : `https://${user.instagram_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-fuchsia-400 text-sm font-bold bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20">
                  <Instagram size={14} /> Instagram
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="bg-[#0a0a0a] border border-emerald-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
              <Coins size={32} className="text-emerald-400 mb-3" />
              <span className="text-2xl font-black mb-1">{user.dop_coins?.toLocaleString() || 0}</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">DOP</span>
            </div>
            <div className="bg-[#0a0a0a] border border-blue-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
              <Gem size={32} className="text-blue-400 mb-3" />
              <span className="text-2xl font-black mb-1">{user.mint_gems?.toLocaleString() || 0}</span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">יהלומים</span>
            </div>
            
            {/* הקוביה שמתעדכנת בזמן אמת */}
            <div className="bg-[#0a0a0a] border border-fuchsia-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
              <Users size={32} className="text-fuchsia-400 mb-3" />
              <span className="text-2xl font-black mb-1">{followersCount}</span>
              <span className="text-[10px] text-fuchsia-500 font-bold uppercase tracking-widest">עוקבים</span>
            </div>
            
            <div className="bg-[#0a0a0a] border border-amber-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
              <LayoutGrid size={32} className="text-amber-400 mb-3" />
              <span className="text-2xl font-black mb-1">{drops?.length || 0}</span>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">נכסים</span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-base font-black flex items-center gap-2 mb-4 px-2 opacity-80"><Play size={16} /> תיק נכסי וידאו</h2>
            {drops && drops.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {drops.map(drop => {
                  const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                  return (
                    <div key={drop.id} className="aspect-[9/16] bg-black rounded-[24px] relative overflow-hidden border border-gray-800 shadow-md">
                      {drop.video_url ? (
                        isImage ? <img src={drop.video_url} className="w-full h-full object-cover opacity-80" alt="drop" /> : <video src={drop.video_url} className="w-full h-full object-cover opacity-80" muted loop playsInline />
                      ) : <LayoutGrid size={32} className="text-white/20 mx-auto mt-10" />}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-[12px] text-[10px] font-black flex items-center gap-1.5 border border-white/10 w-[85%] justify-center">
                        <HeartPulse size={12} className="text-emerald-400" />
                        <span>{drop.bounty_pool?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-[#0a0a0a] text-center py-16 rounded-[32px] border border-white/10">
                <Play size={32} className="opacity-20 mx-auto mb-3" />
                <p className="opacity-60 font-black">אין נכסים פעילים</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
