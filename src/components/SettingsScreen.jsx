import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, Edit3, Settings, FileText, LogOut, 
  Volume2, VolumeX, Moon, Sun, Bell, Shield, Info, Image as ImageIcon,
  Instagram, Lock, Unlock
} from 'lucide-react';

export default function SettingsScreen({ user, onClose, onUpdateUser }) {
  const [category, setCategory] = useState(null);
  const [legalView, setLegalView] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // States מסונכרנים עם השרת
  const [username, setUsername] = useState(user?.username || '');
  const [profileLink, setProfileLink] = useState(user?.profile_link || '');
  const [instagramUrl, setInstagramUrl] = useState(user?.instagram_url || '');
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false);
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const [isLightMode, setIsLightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fileInputRef = useRef(null);

  const bgCard = isLightMode ? 'bg-white text-gray-900' : 'bg-[#0a0a0a] text-white';
  const borderSubtle = isLightMode ? 'border-gray-200' : 'border-white/10';

  const handleSaveSync = async (updates) => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('dop_users').update(updates).eq('id', user.id);
      if (error) throw error;
      onUpdateUser({ ...user, ...updates });
      toast.success("השינויים נשמרו!");
    } catch (error) {
      toast.error("שגיאה בשמירה");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("מעלה תמונה...", { id: 'avatar' });
      const fileName = `${user.id}-${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('avatars').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await handleSaveSync({ avatar_url: publicUrl });
      toast.success("תמונה עודכנה!", { id: 'avatar' });
    } catch (error) { toast.error('שגיאה בהעלאה', { id: 'avatar' }); }
  };

  const categories = [
    { id: 'edit', title: 'פרופיל וזהות', icon: <Edit3 size={32} />, color: 'fuchsia' },
    { id: 'prefs', title: 'העדפות מערכת', icon: <Settings size={32} />, color: 'blue' },
    { id: 'legal', title: 'מידע ומשפט', icon: <FileText size={32} />, color: 'emerald' },
    { id: 'account', title: 'ניהול חשבון', icon: <LogOut size={32} />, color: 'rose' }
  ];

  return (
    <div className={`fixed inset-0 z-[200] ${isLightMode ? 'bg-gray-50' : 'bg-[#030303]'} overflow-y-auto`} dir="rtl">
      <div className="p-6 pb-32">
        <div className={`${bgCard} border ${borderSubtle} rounded-[28px] p-5 mb-8 flex justify-between items-center shadow-lg sticky top-2 z-20`}>
          <div className="flex items-center gap-3">
            <Settings size={28} className={isLightMode ? 'text-gray-800' : 'text-white/80'} />
            <div>
              <h1 className={`text-2xl font-black ${isLightMode ? 'text-gray-900' : 'text-white'}`}>הגדרות</h1>
              <p className={`text-xs font-bold ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>
                {category ? categories.find(c=>c.id === category)?.title : 'תפריט ראשי'}
              </p>
            </div>
          </div>
          <button onClick={() => category ? setCategory(null) : onClose()} className="p-3 bg-gray-500/10 rounded-2xl active:scale-95">
            <ChevronRight size={24} className={isLightMode ? 'text-gray-900' : 'text-white'} />
          </button>
        </div>

        {!category ? (
          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} onClick={() => setCategory(cat.id)} className={`${bgCard} border border-${cat.color}-500/30 rounded-[32px] p-6 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all`}>
                <div className={`text-${cat.color}-500 mb-3`}>{cat.icon}</div>
                <h3 className="font-black">{cat.title}</h3>
              </div>
            ))}
            <div className="col-span-2 text-center mt-8 opacity-40 font-bold text-xs">
              DOP 1.0.5 | {isLightMode ? 'Light' : 'Dark'} Mode
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {category === 'edit' && (
              <>
                <div className={`${bgCard} border ${borderSubtle} rounded-[32px] p-6 text-center`}>
                  <ImageIcon size={32} className="text-fuchsia-500 mx-auto mb-2" />
                  <h3 className="font-black mb-3">תמונת פרופיל</h3>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-fuchsia-500/10 text-fuchsia-500 font-bold py-2 px-6 rounded-xl">החלף תמונה</button>
                </div>
                <div className={`${bgCard} border ${borderSubtle} rounded-[32px] p-6 space-y-4`}>
                  <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="שם משתמש" className="w-full bg-transparent border border-gray-500/30 rounded-xl p-3 outline-none focus:border-fuchsia-500" />
                  <input type="url" value={profileLink} onChange={e=>setProfileLink(e.target.value)} placeholder="קישור לאתר" className="w-full bg-transparent border border-gray-500/30 rounded-xl p-3 outline-none focus:border-fuchsia-500" dir="ltr" />
                  <input type="url" value={instagramUrl} onChange={e=>setInstagramUrl(e.target.value)} placeholder="קישור לאינסטגרם" className="w-full bg-transparent border border-gray-500/30 rounded-xl p-3 outline-none focus:border-fuchsia-500" dir="ltr" />
                  <button onClick={() => handleSaveSync({ username, profile_link: profileLink, instagram_url: instagramUrl })} disabled={updating} className="w-full bg-fuchsia-600 text-white font-black py-4 rounded-xl mt-4 active:scale-95">{updating ? 'שומר...' : 'שמור שינויים'}</button>
                </div>
              </>
            )}

            {category === 'prefs' && (
              <div className="space-y-3">
                <div className={`${bgCard} border ${borderSubtle} rounded-3xl p-5 flex justify-between items-center`}>
                  <div className="flex items-center gap-3"><Bell className="text-yellow-500"/><div><h3 className="font-black">התראות משרת</h3><p className="text-[10px] opacity-50">לייקים ועוקבים</p></div></div>
                  <button onClick={() => { setNotifications(!notifications); handleSaveSync({ notifications_enabled: !notifications }); }} className={`w-14 h-8 rounded-full p-1 transition-all ${notifications ? 'bg-yellow-500' : 'bg-gray-500'}`}><div className={`w-6 h-6 bg-white rounded-full transition-all ${notifications ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
                <div className={`${bgCard} border ${borderSubtle} rounded-3xl p-5 flex justify-between items-center`}>
                  <div className="flex items-center gap-3">{isPrivate ? <Lock className="text-rose-500"/> : <Unlock className="text-emerald-500"/>}<div><h3 className="font-black">חשבון פרטי</h3><p className="text-[10px] opacity-50">רק עוקבים יראו אותך</p></div></div>
                  <button onClick={() => { setIsPrivate(!isPrivate); handleSaveSync({ is_private: !isPrivate }); }} className={`w-14 h-8 rounded-full p-1 transition-all ${isPrivate ? 'bg-rose-500' : 'bg-gray-500'}`}><div className={`w-6 h-6 bg-white rounded-full transition-all ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
                <div className={`${bgCard} border ${borderSubtle} rounded-3xl p-5 flex justify-between items-center`}>
                  <div className="flex items-center gap-3">{isLightMode ? <Sun className="text-indigo-500"/> : <Moon className="text-indigo-500"/>}<div><h3 className="font-black">מצב תצוגה</h3></div></div>
                  <button onClick={() => setIsLightMode(!isLightMode)} className={`w-14 h-8 rounded-full p-1 transition-all ${isLightMode ? 'bg-indigo-500' : 'bg-gray-600'}`}><div className={`w-6 h-6 bg-white rounded-full transition-all ${isLightMode ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
              </div>
            )}

            {category === 'account' && (
              <div className={`${bgCard} border border-rose-500/30 rounded-3xl p-6 text-center shadow-lg`}>
                <LogOut size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="font-black text-xl mb-6">התנתקות מהמערכת</h3>
                <button onClick={handleLogout} className="w-full bg-rose-600 text-white font-black py-4 rounded-[20px] active:scale-95">התנתק עכשיו</button>
              </div>
            )}

            {category === 'legal' && (
              <div className={`${bgCard} p-6 rounded-3xl border ${borderSubtle} text-sm font-medium leading-relaxed opacity-80 whitespace-pre-wrap`}>
                <h3 className="font-black text-emerald-500 text-lg mb-2">תקנון ופרטיות DOP</h3>
                השימוש באפליקציה מהווה הסכמה לתנאים. המידע נשמר מאובטח (Supabase) ואינו מועבר לצד ג'. היסטוריית הצ'אטים מוצפנת. DOP פותחה כרשת המנוהלת על ידי הקהילה דרך "בוסטים" ו"שאיבות".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
