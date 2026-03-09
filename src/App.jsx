import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Swords, Trophy, Search, ChevronDown, Briefcase, History } from 'lucide-react';
import { supabase, executeBoost } from './supabase';
import { playCoinSound, playSwordSound, playGhostSound } from './utils/sounds';
import { toast } from 'react-hot-toast';

import AuthScreen from './components/AuthScreen';
import FloatingNav from './components/FloatingNav';
import DropCard from './components/DropCard';
import PublicProfile from './components/PublicProfile';
import SearchScreen from './components/SearchScreen';
import CrystalBoost from './components/CrystalBoost';
import NotificationListener from './components/NotificationListener';
import Onboarding from './components/Onboarding';

import UploadDrop from './components/UploadDrop';
import UserProfile from './components/UserProfile';
import BlackMarket from './components/BlackMarket'; 
import BlackHole from './components/BlackHole';
import Olympus from './components/Olympus';
import BattleLog from './components/BattleLog';
import NotificationsScreen from './components/NotificationsScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [drops, setDrops] = useState([]);
  const [baseDrops, setBaseDrops] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [boosts, setBoosts] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [followingIds, setFollowingIds] = useState([]);

  const scrollLock = useRef(false);
  const lastScrollTime = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    if (!localStorage.getItem('dop_onboarded')) setShowOnboarding(true);
    fetchUserProfile();
    fetchFollowing();
    fetchActiveDrops();
  }, [session]);

  const fetchUserProfile = async () => {
    const { data } = await supabase.from('dop_users').select('*').eq('id', session.user.id).single();
    if (data) setCurrentUser(data);
  };

  const fetchFollowing = async () => {
    const { data } = await supabase.from('dop_followers').select('following_id').eq('follower_id', session.user.id);
    if (data) setFollowingIds(data.map(d => d.following_id));
  };

  const fetchActiveDrops = async () => {
    const now = new Date().toISOString();
    const { data: videos } = await supabase.from('dop_videos').select('*').gte('expires_at', now).order('created_at', { ascending: false }).limit(20);
    if (!videos) return;

    const userIds = [...new Set(videos.map(v => v.user_id).filter(Boolean))];
    let usersMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('dop_users').select('id, username, has_halo').in('id', userIds);
      if (users) users.forEach(u => { usersMap[u.id] = u; });
    }
    
    const combinedDrops = videos.map((v, index) => ({
      ...v, uniqueKey: `drop_${v.id}_${index}`, users: usersMap[v.user_id] || { username: 'אנונימי' }
    }));

    setBaseDrops(combinedDrops);
    setDrops(combinedDrops);
  };

  const handleScroll = useCallback((e) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 200) return;
    lastScrollTime.current = now;

    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && baseDrops.length > 0 && !scrollLock.current) {
      scrollLock.current = true;
      const shuffled = [...baseDrops].sort(() => 0.5 - Math.random());
      const newDrops = shuffled.slice(0, 3).map((d, i) => ({ ...d, uniqueKey: `loop_${d.id}_${Date.now()}_${i}` }));
      setDrops(prev => [...prev, ...newDrops]);
      setTimeout(() => { scrollLock.current = false; }, 1000);
    }
  }, [baseDrops]);

  const handleBoost = async (dropId, event) => {
    if (navigator.vibrate) navigator.vibrate(50);
    playCoinSound();
    
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || window.innerHeight / 2;
    
    const newBoost = { id: Date.now(), x, y };
    setBoosts((prev) => [...prev, newBoost]);

    try {
      await executeBoost(dropId, 5);
      const targetDrop = drops.find(d => d.id === dropId);
      if (targetDrop && targetDrop.bounty_pool > 0 && targetDrop.user_id !== session?.user?.id) {
        const reward = Math.min(10.0, targetDrop.bounty_pool);
        await supabase.from("dop_users").update({ dop_coins: (currentUser.dop_coins || 0) + reward }).eq("id", currentUser.id);
        await supabase.from("dop_videos").update({ bounty_pool: targetDrop.bounty_pool - reward }).eq("id", dropId);
        setCurrentUser(prev => ({...prev, dop_coins: prev.dop_coins + reward}));
        toast.success(`שאבת ${reward} DOP מהנכס! ⚡`, { style: { background: '#111', color: '#10b981', border: '1px solid #10b981' } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSiphon = async (targetDrop) => {
    if (!currentUser) return;
    if ((currentUser.dop_coins || 0) < 50) return toast.error("צריך 50 DOP לשאיבת זמן");
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    playGhostSound();

    try {
      const newTime = new Date(new Date(targetDrop.expires_at).getTime() - 30 * 60000).toISOString();
      await supabase.from("dop_videos").update({ expires_at: newTime }).eq("id", targetDrop.id);
      
      const newBalance = currentUser.dop_coins - 50;
      await supabase.from("dop_users").update({ dop_coins: newBalance }).eq("id", currentUser.id);
      setCurrentUser(prev => ({...prev, dop_coins: newBalance}));

      toast.success("זמן נשאב בהצלחה! ⏳", { style: { background: '#111', color: '#a855f7', border: '1px solid #a855f7' } });
      fetchActiveDrops();
    } catch (error) { 
      toast.error("שגיאה בשאיבת זמן"); 
    }
  };

  const handleNavigation = (tab) => {
    if (tab === 'create') {
      setShowUpload(true);
    } else {
      setActiveTab(tab);
      setShowSearch(false);
      setShowUpload(false);
      setSelectedUserId(null);
    }
  };

  if (!session) return <AuthScreen onLoginSuccess={() => {}} />;

  const renderScreen = () => {
    switch (activeTab) {
      case 'market': 
      case 'store':
        return <BlackMarket currentUser={currentUser} onUpdateUser={setCurrentUser} onClose={() => setActiveTab('home')} />;
      case 'blackhole': 
        return <BlackHole currentUser={currentUser} onUpdateUser={setCurrentUser} onClose={() => setActiveTab('home')} />;
      case 'olympus': 
        return <Olympus currentUserId={session?.user?.id} onClose={() => setActiveTab('home')} onUserClick={setSelectedUserId} />;
      case 'battlelog': 
      case 'vendettas':
        return <BattleLog onClose={() => setActiveTab('home')} />;
      case 'notifications': 
      case 'activity':
        return <NotificationsScreen userId={session.user.id} onClose={() => setActiveTab('home')} />;
      case 'profile': 
        return <UserProfile user={currentUser} drops={drops.filter(d => d.user_id === session.user.id)} onUpdateUser={setCurrentUser} onDropsUpdate={fetchActiveDrops} onClose={() => setActiveTab('home')} />;
      default: 
        return null;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#050505] text-white font-sans overflow-hidden" dir="rtl">
      
      <NotificationListener userId={session?.user?.id} />

      {activeTab === 'home' && !showSearch && !selectedUserId && (
        <>
          <div className="fixed top-6 right-4 z-40 flex flex-col gap-3 items-center">
            <button onClick={() => setShowAppMenu(!showAppMenu)} className={`flex items-center justify-center w-14 h-9 rounded-full shadow-2xl transition-all duration-300 ${showAppMenu ? 'bg-white text-black' : 'bg-black/60 backdrop-blur-md border border-white/20 text-white'}`}>
              <ChevronDown size={22} className={`transition-transform duration-300 ${showAppMenu ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {showAppMenu && (
              <div className="flex flex-col gap-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  // חיפוש במקום חנות!
                  { id: 'search', icon: Search, color: 'emerald', action: () => { setShowSearch(true); setShowAppMenu(false); } },
                  { id: 'blackhole', icon: Briefcase, color: 'purple', action: () => { setActiveTab('blackhole'); setShowAppMenu(false); } },
                  { id: 'battlelog', icon: History, color: 'blue', action: () => { setActiveTab('battlelog'); setShowAppMenu(false); } },
                  { id: 'olympus', icon: Trophy, color: 'amber', action: () => { setActiveTab('olympus'); setShowAppMenu(false); } },
                  { id: 'notifications', icon: Bell, color: 'rose', action: () => { setActiveTab('notifications'); setShowAppMenu(false); } }
                ].map((item) => (
                  <button key={item.id} onClick={item.action} className={`flex items-center justify-center w-11 h-11 bg-black/80 border border-${item.color}-500/30 rounded-full text-${item.color}-500 active:scale-95 shadow-lg hover:bg-${item.color}-500/10 transition-colors`}>
                    <item.icon size={20} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center bg-black/60 backdrop-blur-xl border border-white/20 rounded-full p-1 shadow-2xl">
            <button onClick={() => setFeedFilter('all')} className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${feedFilter === 'all' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>עולמי</button>
            <button onClick={() => setFeedFilter('gang')} className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${feedFilter === 'gang' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-gray-400 hover:text-emerald-400'}`}>כנופיה</button>
          </div>

          <div className="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar pb-24" onScroll={handleScroll}>
            {feedFilter === 'all' ? (
              drops.length > 0 ? (
                drops.map((drop) => (
                  <div key={drop.uniqueKey} className="relative w-full h-[100dvh] snap-start snap-always">
                    <DropCard 
                      drop={drop} 
                      currentUserId={session?.user?.id} 
                      onBoost={(e) => handleBoost(drop.id, e)}
                      onSiphon={() => handleSiphon(drop)}
                      onSearch={() => setShowSearch(true)} 
                      onUserClick={() => setSelectedUserId(drop.user_id)} 
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 font-black">אין דרופים זמינים כרגע</div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-emerald-500/50 font-black">הכנופיה שלך טרם העלתה דרופים</div>
            )}
          </div>
        </>
      )}

      {renderScreen()}

      {(!selectedUserId && !showSearch && !showUpload && activeTab === 'home') && (
         <FloatingNav activeTab={activeTab} setActiveTab={handleNavigation} />
      )}
      
      {showUpload && <UploadDrop currentUser={currentUser} onClose={() => setShowUpload(false)} onUploadComplete={() => { setShowUpload(false); fetchActiveDrops(); }} />}
      {showSearch && <SearchScreen onClose={() => setShowSearch(false)} />}
      
      {selectedUserId && <PublicProfile userId={selectedUserId} currentUserId={session?.user?.id} onClose={() => setSelectedUserId(null)} />}
      
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      
      {boosts.map((boost) => <CrystalBoost key={boost.id} x={boost.x} y={boost.y} onComplete={() => setBoosts(prev => prev.filter(b => b.id !== boost.id))} />)}
      
    </div>
  );
}
