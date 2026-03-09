import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { 
  Crown, Check, Play, Coins, Gem, Users, LayoutGrid, 
  Settings, ChevronRight, Edit3, Link as LinkIcon, Image as ImageIcon, 
  Volume2, VolumeX, Moon, FileText, Info, 
  LogOut, Shield, MessageCircle, UserPlus, HeartPulse, Bell, BellOff, Pencil, Trash2, X
} from 'lucide-react';

export default function UserProfile({ user, drops, onClose, onUpdateUser, onDropsUpdate }) {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState(null);
  
  // States לעריכת פרופיל
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [linkInput, setLinkInput] = useState(user?.profile_link || '');
  const [localAvatar, setLocalAvatar] = useState(user?.avatar_url || null); // תצוגה מקדימה לתמונה
  const [updating, setUpdating] = useState(false);
  
  // States להעדפות
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // States לניהול תוכן (דרופים)
  const [editingDrop, setEditingDrop] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // States למסכים המשפטיים
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms', 'privacy', 'about'

  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#030303] text-white flex items-center justify-center font-black z-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isVIP = user.premium_tier && user.premium_tier !== 'free';
  const pulseColor = user.custom_pulse_color || '#10b981';

  // --- 1. פונקציות שמירה (פרופיל) ---
  const handleSaveProfile = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const updates = { 
        username: usernameInput, 
        profile_link: linkInput,
        avatar_url: localAvatar // שומר גם את התמונה (במערכת אמיתית זה URL מ-Storage)
      };
      const { error } = await supabase.from('dop_users').update(updates).eq('id', user.id);
      if (error) throw error;
      onUpdateUser({ ...user, ...updates });
      toast.success("הפרופיל עודכן בהצלחה!", { style: { background: '#111', color: '#10b981' }});
    } catch (error) {
      toast.error("שגיאה בעדכון פרופיל");
    } finally {
      setUpdating(false);
    }
  };

  // העלאת תמונה ותצוגה מקדימה חיה
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // יצירת URL מקומי להצגת התמונה מידית!
    const imageUrl = URL.createObjectURL(file);
    setLocalAvatar(imageUrl);
    toast.success("התמונה הועלתה! לחץ 'שמור שינויים' כדי לסיים", { icon: '📸' });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) { toast.error('שגיאה בהתנתקות'); }
  };

  // --- 2. פונקציות ניהול דרופים ---
  const openDropEditor = (drop) => {
    setEditingDrop(drop);
    setEditTitle(drop.title || '');
    setEditDesc(drop.description || '');
  };

  const handleSaveDrop = async () => {
    if (!editingDrop) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('dop_videos').update({ title: editTitle, description: editDesc }).eq('id', editingDrop.id);
      if (error) throw error;
      toast.success("הדרופ עודכן בהצלחה!", { icon: '✅' });
      setEditingDrop(null);
      if(onDropsUpdate) onDropsUpdate(); 
    } catch (error) {
      toast.error("שגיאה בעריכת הדרופ");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDrop = async () => {
    if (!editingDrop) return;
    if (!window.confirm("האם אתה בטוח שברצונך למחוק דרופ זה לצמיתות?")) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('dop_videos').delete().eq('id', editingDrop.id);
      if (error) throw error;
      toast.success("הדרופ נמחק לצמיתות.", { icon: '🗑️', style: { background: '#111', color: '#ef4444' } });
      setEditingDrop(null);
      if(onDropsUpdate) onDropsUpdate();
    } catch (error) {
      toast.error("שגיאה במחיקת הדרופ");
    } finally {
      setUpdating(false);
    }
  };

  const settingsCategories = [
    { id: 'edit', title: 'פרופיל וזהות', desc: 'שם, תמונה וקישור', icon: <Edit3 size={40} />, color: 'fuchsia' },
    { id: 'content', title: 'ניהול תוכן', desc: 'עריכה ומחיקת דרופים', icon: <LayoutGrid size={40} />, color: 'purple' },
    { id: 'prefs', title: 'העדפות מערכת', desc: 'התראות וצלילים', icon: <Settings size={40} />, color: 'blue' },
    { id: 'legal', title: 'מידע ומשפט', desc: 'תקנון ופרטיות', icon: <FileText size={40} />, color: 'emerald' },
    { id: 'account', title: 'ניהול חשבון', desc: 'התנתקות ואבטחה', icon: <LogOut size={40} />, color: 'rose' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#030303] text-white overflow-y-auto" dir="rtl">
      <div className="min-h-full pb-32">

        {!showSettings ? (
          // ==========================================
          // תצוגת פרופיל ראשית (Master View)
          // ==========================================
          <div>
            <div className="absolute top-0 left-0 w-full h-72 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${pulseColor}, transparent 70%)` }}></div>

            {/* כפתור חזור (ימין) */}
            <button onClick={onClose} className="absolute top-6 right-4 z-50 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-white/10">
              <ChevronRight size={24} className="text-white" />
            </button>

            {/* כפתור הגדרות (שמאל) */}
            <button onClick={() => setShowSettings(true)} className="absolute top-6 left-4 z-50 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-white/10">
              <Settings size={24} className="text-white" />
            </button>

            <div className="relative z-10 px-4 pt-24">
              
              {/* תמונת פרופיל (מעודכנת) */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-32 h-32 rounded-[32px] bg-[#0a0a0a] border-2 flex items-center justify-center text-5xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.2)] relative mb-5 overflow-hidden" style={{ borderColor: pulseColor }}>
                  {localAvatar ? (
                    <img src={localAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="relative z-10">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                  {isVIP && <div className="absolute -top-3 -right-3 bg-amber-500 text-black p-2 rounded-[12px] z-20"><Crown size={16} className="fill-black" /></div>}
                </div>

                <h1 className="text-3xl font-black flex items-center gap-2 text-white">
                  {user.username || 'אנונימי'}
                  {user.has_halo && <Check size={22} className="text-blue-400" />}
                </h1>

                {/* קישור (לחיץ באמת) */}
                {user.profile_link ? (
                  <a href={user.profile_link.startsWith('http') ? user.profile_link : `https://${user.profile_link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                    <LinkIcon size={14} /> {user.profile_link.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 text-white/30 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10"><LinkIcon size={12} /> הוסף קישור בהגדרות</div>
                )}

                <div className="flex gap-3 mt-5 w-full max-w-sm">
                  <button className="flex-1 bg-white text-black font-black py-3.5 rounded-[20px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"><UserPlus size={18} /> עקוב</button>
                  <button className="flex-1 bg-white/10 text-white font-black py-3.5 rounded-[20px] flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform"><MessageCircle size={18} /> צ'אט</button>
                </div>
              </div>

              {/* סטטיסטיקות */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-[#0a0a0a] border border-emerald-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center"><Coins size={32} className="text-emerald-400 mb-3" /><span className="text-2xl font-black text-white mb-1">{user.dop_coins?.toLocaleString() || 0}</span><span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest">DOP</span></div>
                <div className="bg-[#0a0a0a] border border-blue-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center"><Gem size={32} className="text-blue-400 mb-3" /><span className="text-2xl font-black text-white mb-1">{user.mint_gems?.toLocaleString() || 0}</span><span className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest">יהלומים</span></div>
                <div className="bg-[#0a0a0a] border border-fuchsia-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center"><Users size={32} className="text-fuchsia-400 mb-3" /><span className="text-2xl font-black text-white mb-1">{user.followers_count || 0}</span><span className="text-[10px] text-fuchsia-400/70 font-bold uppercase tracking-widest">עוקבים</span></div>
                <div className="bg-[#0a0a0a] border border-amber-500/30 p-5 rounded-[32px] flex flex-col items-center justify-center text-center"><LayoutGrid size={32} className="text-amber-400 mb-3" /><span className="text-2xl font-black text-white mb-1">{drops?.length || 0}</span><span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest">נכסים</span></div>
              </div>

              {/* גלריית דרופים */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-base font-black text-white flex items-center gap-2"><Play size={16} className="text-white/50" /> תיק נכסי תוכן</h2>
                  <button onClick={() => { setShowSettings(true); setSettingsCategory('content'); }} className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full hover:bg-emerald-500/20 transition-colors">ניהול מהיר</button>
                </div>

                {drops && drops.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {drops.map(drop => (
                      <div key={drop.id} className="aspect-[9/16] bg-[#0a0a0a] rounded-[24px] relative overflow-hidden border border-white/10">
                        {drop.video_url ? (
                          drop.video_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || drop.video_url.includes('image') || drop.video_url.includes('unsplash') ? 
                          <img src={drop.video_url} className="w-full h-full object-cover opacity-70" alt="drop" /> :
                          <video src={drop.video_url} className="w-full h-full object-cover opacity-70" muted loop playsInline />
                        ) : (
                          <LayoutGrid size={32} className="text-white/20 mx-auto mt-10" />
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1.5 rounded-[12px] text-[10px] font-black flex items-center gap-1.5 border border-white/10 w-[85%] justify-center">
                          <HeartPulse size={12} className="text-emerald-400" /><span>{drop.bounty_pool?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#0a0a0a] rounded-[32px] border border-white/5"><Play size={32} className="text-white/20 mx-auto mb-3" /><p className="text-white/60 font-black">אין נכסים פעילים</p></div>
                )}
              </div>
            </div>
          </div>
        ) : (

          // ==========================================
          // מסך הגדרות (Settings Dashboard)
          // ==========================================
          <div className="px-4 pt-6 relative min-h-screen">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-8 flex justify-between items-center shadow-lg sticky top-2 z-20">
              <div>
                <h1 className="text-2xl font-black text-white">הגדרות</h1>
                <p className="text-white/50 text-xs font-bold">{settingsCategory ? settingsCategories.find(c => c.id === settingsCategory)?.title : 'מרכז ניהול'}</p>
              </div>
              <button onClick={() => { if(editingDrop) setEditingDrop(null); else if(settingsCategory) setSettingsCategory(null); else setShowSettings(false); }} className="bg-white/10 p-4 rounded-[20px] active:scale-95 transition-transform"><ChevronRight size={24} className="text-white" /></button>
            </div>

            {!settingsCategory && (
              <div className="grid grid-cols-2 gap-4">
                {settingsCategories.map(cat => (
                  <div key={cat.id} onClick={() => setSettingsCategory(cat.id)} className={`bg-[#0a0a0a] border border-${cat.color}-500/30 rounded-[32px] p-5 flex flex-col items-center text-center cursor-pointer aspect-square justify-center shadow-lg transition-all active:scale-95 hover:border-${cat.color}-500/80`}>
                    <div className={`text-${cat.color}-400 mb-3`}>{cat.icon}</div>
                    <h3 className="text-base font-black text-white mb-1 leading-tight">{cat.title}</h3>
                    <p className="text-[10px] text-white/50 font-bold">{cat.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 1. עריכת פרופיל */}
            {settingsCategory === 'edit' && (
              <div className="space-y-4">
                {/* העלאת תמונה */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 shadow-lg text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-[24px] bg-[#050505] border-2 border-fuchsia-500/50 mb-4 overflow-hidden flex items-center justify-center relative group">
                    {localAvatar ? (
                      <img src={localAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={32} className="text-fuchsia-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Edit3 size={24} className="text-white" />
                    </div>
                  </div>
                  <h3 className="font-black text-white mb-1">תמונת פרופיל</h3>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="mt-2 bg-white/5 border border-white/10 font-bold text-sm py-3 px-6 rounded-[16px] active:scale-95">בחר מגלריה</button>
                </div>

                {/* פרטים אישיים */}
                <div className="bg-[#0a0a0a] border border-fuchsia-500/30 rounded-[32px] p-6 shadow-lg">
                  <div className="space-y-4">
                    <div><label className="text-xs text-white/50 font-bold mb-1.5 block">שם יוצר</label><input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3.5 px-4 text-sm text-white outline-none focus:border-fuchsia-500/50" /></div>
                    <div><label className="text-xs text-white/50 font-bold mb-1.5 block">קישור חיצוני (למשל: אינסטגרם/אתר)</label><input type="url" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://..." className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3.5 px-4 text-sm text-white outline-none focus:border-fuchsia-500/50" dir="ltr" /></div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={updating} className="w-full mt-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black py-4 rounded-[20px] active:scale-95 transition-all disabled:opacity-50">{updating ? 'שומר...' : 'שמור שינויים'}</button>
                </div>
              </div>
            )}

            {/* 2. ניהול תוכן (עריכת דרופים) */}
            {settingsCategory === 'content' && (
              <div className="space-y-4">
                {!editingDrop ? (
                  <div className="space-y-3">
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-[20px] mb-4 text-center">
                      <p className="text-purple-300 text-sm font-bold">בחר דרופ לעריכה או מחיקה</p>
                    </div>
                    {drops && drops.length > 0 ? drops.map(drop => (
                      <div key={drop.id} className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-3 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => openDropEditor(drop)}>
                        <div className="w-16 h-16 rounded-[12px] bg-black overflow-hidden flex-shrink-0 border border-white/5">
                           {drop.video_url && (drop.video_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || drop.video_url.includes('image') || drop.video_url.includes('unsplash')) ? <img src={drop.video_url} className="w-full h-full object-cover" alt="drop" /> : <video src={drop.video_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-black text-sm text-white truncate">{drop.title || 'ללא כותרת'}</h3>
                          <p className="text-xs text-white/50 truncate mt-0.5">{drop.description || 'ללא תיאור'}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-emerald-400"><Coins size={10} /> {drop.bounty_pool} DOP</div>
                        </div>
                        <ChevronRight size={16} className="text-white/30" />
                      </div>
                    )) : <div className="text-center text-white/50 py-10 font-black">אין לך דרופים פעילים</div>}
                  </div>
                ) : (
                  <div className="bg-[#0a0a0a] border border-purple-500/30 rounded-[32px] p-6 shadow-lg">
                    <h3 className="font-black text-lg mb-5 text-white flex items-center gap-2"><Pencil size={18} className="text-purple-400" /> עריכת דרופ</h3>
                    <div className="space-y-4 mb-6">
                      <div><label className="text-xs text-white/50 font-bold mb-1.5 block">כותרת הסרטון</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3.5 px-4 text-sm text-white outline-none focus:border-purple-500/50" /></div>
                      <div><label className="text-xs text-white/50 font-bold mb-1.5 block">תיאור קצר</label><textarea rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3.5 px-4 text-sm text-white outline-none focus:border-purple-500/50 resize-none" /></div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={handleSaveDrop} disabled={updating} className="w-full bg-purple-600 text-white font-black py-4 rounded-[20px] active:scale-95 transition-all disabled:opacity-50">שמור שינויים</button>
                      <button onClick={handleDeleteDrop} disabled={updating} className="w-full bg-red-950/40 text-red-500 border border-red-500/40 font-black py-4 rounded-[20px] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"><Trash2 size={18} /> מחק דרופ לצמיתות</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. העדפות מערכת */}
            {settingsCategory === 'prefs' && (
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] border border-blue-500/30 rounded-[32px] p-6 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-[16px] flex items-center justify-center bg-blue-500/20 text-blue-400">{soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}</div><div><h3 className="font-black text-white text-sm">צלילי מערכת</h3><p className="text-[10px] text-white/50">אפקטים קוליים באפליקציה</p></div></div>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-blue-500' : 'bg-white/10'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${soundEnabled ? '-translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
                <div className="bg-[#0a0a0a] border border-blue-500/30 rounded-[32px] p-6 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-[16px] flex items-center justify-center bg-blue-500/20 text-blue-400">{notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}</div><div><h3 className="font-black text-white text-sm">התראות פוש</h3><p className="text-[10px] text-white/50">עדכונים על לייקים ובוסטים</p></div></div>
                  <button onClick={() => { setNotificationsEnabled(!notificationsEnabled); toast.success(notificationsEnabled ? 'התראות כובו' : 'התראות הופעלו'); }} className={`w-14 h-8 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-blue-500' : 'bg-white/10'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notificationsEnabled ? '-translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
              </div>
            )}

            {/* 4. מידע משפטי ואודות (פותח מודלים פנימיים עובדים!) */}
            {settingsCategory === 'legal' && (
              <div className="space-y-4">
                {[
                  { id: 'terms', title: 'תקנון שימוש', icon: <FileText size={20} /> }, 
                  { id: 'privacy', title: 'מדיניות פרטיות', icon: <Shield size={20} /> }, 
                  { id: 'about', title: 'אודות', icon: <Info size={20} /> }
                ].map((item) => (
                  <div key={item.id} onClick={() => setActiveLegalModal(item.id)} className="bg-[#0a0a0a] border border-white/10 rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors active:scale-95">
                    <div className="flex items-center gap-3"><div className="text-emerald-400">{item.icon}</div><span className="font-bold text-sm">{item.title}</span></div>
                    <ChevronRight size={16} className="text-white/30" />
                  </div>
                ))}
              </div>
            )}

            {/* 5. ניהול חשבון */}
            {settingsCategory === 'account' && (
              <div className="bg-[#0a0a0a] border border-rose-500/30 rounded-[32px] p-6 text-center shadow-lg">
                <LogOut size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="font-black text-white text-xl mb-6">התנתקות מהמערכת</h3>
                <button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-[20px] active:scale-95 transition-all">התנתק עכשיו</button>
              </div>
            )}

            {/* ========================================== */}
            {/* מודלים משפטיים (Full Screen Overlays) */}
            {/* ========================================== */}
            {activeLegalModal && (
              <div className="fixed inset-0 z-[100] bg-[#050505] overflow-y-auto px-4 py-6">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#050505]/90 backdrop-blur-md py-4 z-10">
                  <h2 className="text-2xl font-black text-white">
                    {activeLegalModal === 'terms' && 'תקנון שימוש'}
                    {activeLegalModal === 'privacy' && 'מדיניות פרטיות'}
                    {activeLegalModal === 'about' && 'אודות'}
                  </h2>
                  <button onClick={() => setActiveLegalModal(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <div className="pb-10">
                  {activeLegalModal === 'terms' && (
                     <div className="text-white/80 space-y-6 text-sm leading-relaxed font-medium">
                       <p><strong className="text-emerald-400 text-lg">1. תנאי שימוש כלליים</strong><br/>ברוכים הבאים ל-Dop. השימוש באפליקציה מהווה הסכמה מלאה לתנאים המפורטים. אנו שומרים את הזכות לעדכן תנאים אלו מעת לעת.</p>
                       <p><strong className="text-emerald-400 text-lg">2. כלכלת ה-DOP והיהלומים</strong><br/>המטבעות הוירטואליים באפליקציה מיועדים לשימוש פנימי בלבד (קידום נכסים, פעולות אלגוריתמיות). אין להם ערך כספי מחוץ למערכת.</p>
                       <p><strong className="text-emerald-400 text-lg">3. קניין רוחני ותוכן יוצרים</strong><br/>כל תוכן המועלה למערכת נשאר בבעלות היוצר. עם זאת, בהעלאת התוכן, היוצר מעניק ל-Dop רישיון להציג, לשלב ולחשוף את התוכן במסגרת הפלטפורמה.</p>
                     </div>
                  )}

                  {activeLegalModal === 'privacy' && (
                     <div className="text-white/80 space-y-6 text-sm leading-relaxed font-medium">
                       <p><strong className="text-emerald-400 text-lg">1. איסוף נתונים</strong><br/>אנו אוספים נתוני שימוש בסיסיים כדי לשפר את האלגוריתם המרכזי של האפליקציה ולהתאים לכם תוכן רלוונטי.</p>
                       <p><strong className="text-emerald-400 text-lg">2. אבטחת מידע</strong><br/>הנתונים שלך נשמרים באמצעות טכנולוגיות ההצפנה המתקדמות ביותר מבית Supabase. איננו משתפים מידע אישי מזהה עם צדדים שלישיים.</p>
                       <p><strong className="text-emerald-400 text-lg">3. מחיקת חשבון</strong><br/>בכל עת תוכלו לבקש למחוק את החשבון שלכם ואת כל התוכן המקושר אליו דרך הגדרות "ניהול חשבון".</p>
                     </div>
                  )}

                  {activeLegalModal === 'about' && (
                     <div className="flex flex-col items-center justify-center pt-20 text-center">
                       {/* הלוגו המיוחד של DOP */}
                       <div className="relative w-40 h-40 flex flex-col items-center justify-center mb-8">
                         <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[32px] rotate-12 blur-md opacity-50"></div>
                         <div className="absolute inset-0 bg-gradient-to-bl from-[#050505] to-[#111] border-2 border-emerald-500/50 rounded-[32px] flex items-center justify-center shadow-2xl z-10">
                           <span className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">DOP</span>
                         </div>
                       </div>
                       
                       <h2 className="text-3xl font-black text-white mb-2">DOP 2026</h2>
                       <p className="text-emerald-400 font-bold tracking-widest uppercase mb-6">לשלוט באלגוריתם.</p>
                       <p className="text-white/50 text-sm max-w-[250px] leading-relaxed">
                         הרשת החברתית הראשונה שנותנת ליוצרים את הכוח לקבוע את החשיפה של עצמם באמצעות כלכלה וירטואלית.
                       </p>
                       <div className="mt-12 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                         גרסה 1.0.0 (Build 42)
                       </div>
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
