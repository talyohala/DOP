import React, { useState, useEffect } from 'react';
import { Bell, Swords, Trophy, ShoppingCart, Plus, Briefcase } from 'lucide-react';
import { supabase, executeBoost } from './supabase';
import { playCoinSound, playSwordSound, playGhostSound } from './utils/sounds';
import AuthScreen from './components/AuthScreen';
import FloatingNav from './components/FloatingNav';
import DropCard from './components/DropCard';
import PublicProfile from './components/PublicProfile';
import UserProfile from './components/UserProfile';
import Store from './components/Store';
import UploadScreen from './components/UploadScreen';
import BlackHole from './components/BlackHole';
import SearchScreen from './components/SearchScreen';
import CrystalBoost from './components/CrystalBoost';
import NotificationListener from './components/NotificationListener';
import NotificationsScreen from './components/NotificationsScreen';
import Olympus from './components/Olympus';
import Vendettas from './components/Vendettas';
import Onboarding from './components/Onboarding';
import BlackMarket from './components/BlackMarket'; // הייבוא החדש של השוק השחור
import { toast } from 'react-hot-toast';

function App() {
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

    const dropsChannel = supabase.channel('public:dop_videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dop_videos' }, () => fetchActiveDrops())
      .subscribe();

    const userChannel = supabase.channel(`public:dop_users:${session.user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dop_users', filter: `id=eq.${session.user.id}` }, (payload) => {
        setCurrentUser(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dropsChannel);
      supabase.removeChannel(userChannel);
    };
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
    const { data: videos, error: vidError } = await supabase
      .from('dop_videos')
      .select('*')
      .gte('expires_at', now)
      .order('created_at', { ascending: false });

    if (vidError || !videos) return;
    const userIds = [...new Set(videos.map(v => v.user_id).filter(Boolean))];
    let usersMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('dop_users').select('id, username, has_halo').in('id', userIds);
      if (users) users.forEach(u => { usersMap[u.id] = u; });
    }
    let combinedDrops = videos.map((v, index) => ({
      ...v,
      uniqueKey: `${v.id}_${index}`,
      users: usersMap[v.user_id] || { username: 'אנונימי' }
    }));

    const urlParams = new URLSearchParams(window.location.search);
    const sharedDropId = urlParams.get('drop');

    if (sharedDropId) {
      const sharedIndex = combinedDrops.findIndex(d => d.id === sharedDropId);
      if (sharedIndex > -1) {
        const sharedDrop = combinedDrops.splice(sharedIndex, 1)[0];
        combinedDrops.unshift(sharedDrop);
      } else {
        const { data: specificVideo } = await supabase.from('dop_videos').select('*').eq('id', sharedDropId).single();
        if (specificVideo) {
          let specificUser = { username: 'אנונימי' };
          if (specificVideo.user_id) {
            const { data: u } = await supabase.from('dop_users').select('id, username, has_halo').eq('id', specificVideo.user_id).single();
            if (u) specificUser = u;
          }
          combinedDrops.unshift({ ...specificVideo, uniqueKey: `${specificVideo.id}_shared`, users: specificUser });
        }
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setBaseDrops(combinedDrops);
    setDrops(combinedDrops);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 2 && baseDrops.length > 0) {
      const shuffled = [...baseDrops].sort(() => 0.5 - Math.random());
      const newDrops = shuffled.map((d, i) => ({ ...d, uniqueKey: `${d.id}_loop_${Date.now()}_${i}` }));
      setDrops((prev) => [...prev, ...newDrops]);
    }
  };

  const handleNavigation = (tab) => {
    if (tab === 'create') setShowUpload(true);
    else setActiveTab(tab);
  };

  const handleBoost = async (dropId, event) => {
    if (navigator.vibrate) navigator.vibrate(50);
    playCoinSound();
    const newBoost = { id: Date.now(), x: event?.clientX || window.innerWidth / 2, y: event?.clientY || window.innerHeight / 2 };
    setBoosts((prev) => [...prev, newBoost]);
    try {
      await executeBoost(dropId, 5);
      const targetDrop = drops.find(d => d.id === dropId);
      if (targetDrop && targetDrop.bounty_pool > 0 && targetDrop.user_id !== session?.user?.id) {
        const reward = Math.min(10.0, targetDrop.bounty_pool);
        await supabase.from("dop_users").update({ dop_coins: (currentUser.dop_coins || 0) + reward }).eq("id", currentUser.id);
        await supabase.from("dop_videos").update({ bounty_pool: targetDrop.bounty_pool - reward }).eq("id", dropId);
        playCoinSound();
        toast.success(`שדדת ${reward} DOP מקופת הסרטון! 💰`, { style: { background: "#18181b", color: "#fbbf24", border: "1px solid #f59e0b" } });
      }

      if (targetDrop && targetDrop.user_id !== session?.user?.id) {
        await supabase.from("dop_notifications").insert({
          user_id: targetDrop.user_id,
          content: `${currentUser?.username || "משתמש אנונימי"} נתן בוסט לדרופ שלך ⚡`,
          type: "boost"
        });
      }
    } catch (error) { console.error('שגיאה במתן בוסט:', error.message); }
  };

  const handleSiphon = async (targetDrop) => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    playGhostSound();
    try {
      const newTime = new Date(new Date(targetDrop.expires_at).getTime() - 30 * 60000).toISOString();
      await supabase.from("dop_videos").update({ expires_at: newTime }).eq("id", targetDrop.id);
      if (targetDrop.user_id !== session?.user?.id) {
        await supabase.from("dop_notifications").insert({
          user_id: targetDrop.user_id,
          content: `${currentUser?.username || "מישהו"} שאב לך 30 דקות מהדרופ! 🧛‍♂️`,
          type: "attack"
        });
      }
      fetchActiveDrops();
    } catch (error) { console.error("שגיאה בשאיבת זמן:", error); }
  };

  const handlePurchase = async (item) => {
    if (!currentUser) return;
    if (currentUser.dop_coins < item.price) return toast.error("אין לך מספיק מטבעות לפעולה זו.", { style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }, icon: '❌' });
    try {
      const newBalance = currentUser.dop_coins - item.price;
      if (item.id === 'shield') {
        const { data: userDrops } = await supabase.from('dop_videos').select('id, expires_at').eq('user_id', currentUser.id);
        if (!userDrops || userDrops.length === 0) return toast.error("אין לך דרופים פעילים להגן עליהם!", { style: { background: '#18181b', color: '#fff' } });
        for (const drop of userDrops) {
          const newTime = new Date(new Date(drop.expires_at).getTime() + 8 * 60 * 60 * 1000).toISOString();
          await supabase.from('dop_videos').update({ expires_at: newTime }).eq('id', drop.id);
        }
      } else if (item.id === 'halo') {
        await supabase.from('dop_users').update({ has_halo: true }).eq('id', currentUser.id);
      } else if (item.id === 'mass_siphon') {
        const { data: otherDrops } = await supabase.from('dop_videos').select('id, expires_at').neq('user_id', currentUser.id);
        if (otherDrops) {
          for (const drop of otherDrops) {
            const newTime = new Date(new Date(drop.expires_at).getTime() - 10 * 60000).toISOString();
            await supabase.from('dop_videos').update({ expires_at: newTime }).eq('id', drop.id);
          }
        }
      }

      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      setCurrentUser(prev => ({ ...prev, dop_coins: newBalance, has_halo: item.id === 'halo' ? true : prev.has_halo }));
      playCoinSound();
      toast.success(`רכשת בהצלחה את: ${item.name}!`, { style: { background: '#18181b', color: '#10b981', border: '1px solid #059669', fontWeight: 'bold' }, icon: '🛍️' });

      await supabase.from('dop_notifications').insert({ user_id: currentUser.id, content: `הפעלת את היכולת: ${item.name}. יתרתך: ${newBalance.toFixed(1)} DOP.`, type: 'system' });
      fetchActiveDrops();
    } catch (error) { toast.error("שגיאה בביצוע הרכישה.", { style: { background: '#18181b', color: '#fff' } }); }
  };

  const removeBoostAnimation = (id) => setBoosts((prev) => prev.filter((b) => b.id !== id));

  if (!session) return <AuthScreen onLoginSuccess={() => console.log('התחברות הצליחה')} />;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        const currentFeed = feedFilter === 'all' ? drops : drops.filter(d => followingIds.includes(d.user_id) || d.user_id === session?.user?.id);
        return (
          <div className="absolute inset-0 w-full h-[100dvh] bg-black overflow-y-auto snap-y snap-mandatory hide-scrollbar z-0" onScroll={handleScroll} style={{ touchAction: 'pan-y' }}>
            {currentFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 font-bold text-lg px-6 text-center">
                {feedFilter === 'gang' ? 'הכנופיה שלך עדיין לא העלתה כלום.' : 'אין דרופים פעילים. הגיע הזמן להעלות!'}
              </div>
            ) : (
              currentFeed.map((drop) => (
                <div key={drop.uniqueKey} className="relative w-full h-[100dvh] snap-start snap-always" onDoubleClick={(e) => handleBoost(drop.id, e)}>
                  <DropCard drop={drop} onBoost={(e) => handleBoost(drop.id, e)} onSearch={() => setShowSearch(true)} handleSiphon={() => handleSiphon(drop)} setSelectedUserId={setSelectedUserId} />
                </div>
              ))
            )}
            {boosts.map((boost) => <CrystalBoost key={boost.id} triggerId={boost.id} x={boost.x} y={boost.y} onComplete={() => removeBoostAnimation(boost.id)} />)}
          </div>
        );
      case 'blackhole': return <BlackHole drops={drops} onBoost={handleBoost} />;
      case 'profile': return <UserProfile user={currentUser} drops={drops.filter(d => d.user_id === session.user.id)} />;
      case 'notifications': return <NotificationsScreen userId={session.user.id} onClose={() => setActiveTab('home')} />;
      case 'olympus': return <Olympus onClose={() => setActiveTab('home')} onUserClick={setSelectedUserId} currentUserId={session?.user?.id} />;
      case 'vendettas': return <Vendettas userId={session?.user?.id} onClose={() => setActiveTab('home')} onOpenStore={() => setActiveTab('store')} />;
      case 'store': return <BlackMarket userCoins={currentUser?.dop_coins} onPurchase={handlePurchase} onClose={() => setActiveTab('home')} />;
      case 'market': return <BlackMarket onClose={() => setActiveTab('home')} />; // החיבור לשוק השחור
      default: return null;
    }
  };

  return (
    <>
      <NotificationListener userId={session?.user?.id} />
      <div className="bg-black min-h-[100dvh] w-full font-sans overflow-hidden text-white relative" dir="rtl">
        {activeTab === 'home' && !showSearch && (
          <>
            <div className="fixed top-6 right-4 z-30 flex flex-col gap-3 items-center">
              <button
                onClick={() => setShowAppMenu(!showAppMenu)}
                className={`flex items-center justify-center w-16 h-10 rounded-full shadow-2xl transition-all duration-300 ${showAppMenu ? 'bg-white/20 backdrop-blur-xl border border-white/40 text-white' : 'bg-black/60 backdrop-blur-xl border border-white/20 text-white'}`}
              >
                <Plus size={24} />
              </button>
              {showAppMenu && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
                  {/* כפתור למכולת הרגילה */}
                  <button onClick={() => { setActiveTab('store'); setShowAppMenu(false); }} className="flex items-center justify-center w-11 h-11 bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-full text-green-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <ShoppingCart size={20} />
                  </button>
                   {/* כפתור לשוק השחור */}
                  <button onClick={() => { setActiveTab('market'); setShowAppMenu(false); }} className="flex items-center justify-center w-11 h-11 bg-black/60 backdrop-blur-xl border border-emerald-500/30 rounded-full text-emerald-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Bell size={20} />
                  </button>
                  <button onClick={() => { setActiveTab('vendettas'); setShowAppMenu(false); }} className="flex items-center justify-center w-11 h-11 bg-black/60 backdrop-blur-xl border border-red-500/30 rounded-full text-red-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Swords size={20} />
                  </button>
                  <button onClick={() => { setActiveTab('olympus'); setShowAppMenu(false); }} className="flex items-center justify-center w-11 h-11 bg-black/60 backdrop-blur-xl border border-yellow-500/30 rounded-full text-yellow-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <Trophy size={20} />
                  </button>
                </div>
              )}
            </div>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl">
              <button onClick={() => setFeedFilter('all')} className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${feedFilter === 'all' ? 'bg-white text-black' : 'text-gray-400'}`}>עולמי</button>
              <button onClick={() => setFeedFilter('gang')} className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${feedFilter === 'gang' ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'text-gray-400'}`}>כנופיה</button>
            </div>
          </>
        )}
        {renderScreen()}
        <FloatingNav activeTab={activeTab} setActiveTab={handleNavigation} />
        {showUpload && <UploadScreen onClose={() => setShowUpload(false)} onUploadComplete={() => { setShowUpload(false); fetchActiveDrops(); }} />}
        {showSearch && <SearchScreen onClose={() => setShowSearch(false)} />}
        {selectedUserId && <PublicProfile userId={selectedUserId} currentUserId={session?.user?.id} onClose={() => setSelectedUserId(null)} />}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </div>
    </>
  );
}

export default App;
