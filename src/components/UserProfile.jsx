import React, { useState } from 'react';
import { Zap, Wallet, CircleDollarSign, LogOut, Settings, X, ChevronLeft, Link as LinkIcon, Camera, Loader2, Trash2, CheckCircle2, Clock, ShieldCheck, FileText, Info, UserCircle, Crown } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const UserProfile = ({ user, drops = [] }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingModal, setActiveSettingModal] = useState(null);
  const [dropToDelete, setDropToDelete] = useState(null);
  const [linkValue, setLinkValue] = useState(user?.social_link || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [uploading, setUploading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  if (!user) return null;

  const totalDrops = drops.length;
  const totalCoins = Intl.NumberFormat('he-IL', { notation: "compact", maximumFractionDigits: 1 }).format(user.dop_coins || 0);
  const totalBoosts = drops.reduce((sum, drop) => sum + (drop.boosts || 0), 0);
  
  const canClaim = !user.last_claim_date || (new Date().getTime() - new Date(user.last_claim_date).getTime() > 24 * 60 * 60 * 1000);
  const potentialYield = totalDrops * 50;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('dop_users').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      window.location.reload();
    } catch (error) {
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.from('dop_users').update({ username: editUsername, social_link: linkValue }).eq('id', user.id);
      if (error) throw error;
      toast.success('הפרופיל עודכן בהצלחה');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const confirmDelete = async () => {
    if (dropToDelete) {
      await supabase.from('dop_videos').delete().eq('id', dropToDelete);
      setDropToDelete(null);
      window.location.reload();
    }
  };

  const handleClaimYield = async () => {
    if (totalDrops === 0) return toast.error('אין דרופים פעילים המייצרים רווח');
    setClaiming(true);
    const newBalance = (user.dop_coins || 0) + potentialYield;
    try {
      await supabase.from('dop_users').update({ dop_coins: newBalance, last_claim_date: new Date().toISOString() }).eq('id', user.id);
      await supabase.from('dop_notifications').insert({
        user_id: user.id,
        content: `אספת את הרווחים היומיים שלך! ${potentialYield} מטבעות נוספו לחשבון.`,
        type: 'coin'
      });
      toast.success(`אספת ${potentialYield} מטבעות!`, { style: { background: '#18181b', color: '#eab308' } });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('שגיאה באיסוף הרווחים');
    }
    setClaiming(false);
  };

  const renderSettingContent = () => {
    switch (activeSettingModal) {
      case 'עריכת פרופיל':
        return (
          <div className="space-y-8 mt-4 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-zinc-900 border-4 border-white/5 overflow-hidden flex items-center justify-center shadow-lg">
                  {uploading ? <Loader2 className="text-emerald-500 animate-spin" size={32} /> : user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="פרופיל" /> : <span className="text-4xl text-white/20">@</span>}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-500 rounded-full text-black cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-90 transition-all">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase">שם משתמש</label>
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase">קישור אישי</label>
                <input type="url" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all" dir="ltr" />
              </div>
              <button onClick={handleSaveProfile} className="w-full py-4.5 bg-emerald-500 text-black font-black rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all mt-4">שמור שינויים</button>
            </div>
          </div>
        );
      case 'תקנון שימוש':
        return (
          <div className="text-gray-400 text-sm leading-relaxed space-y-4 animate-in fade-in duration-300 p-2">
            <h3 className="text-white font-bold text-lg">ברוכים הבאים ל-Dop</h3>
            <p>השימוש באפליקציה מהווה הסכמה לתנאים הבאים: אין להעלות תוכן פוגעני, אלים או בלתי חוקי. כל תוכן שיועלה נמצא באחריות המשתמש בלבד.</p>
            <p>מערכת המטבעות היא וירטואלית בלבד ואין לה ערך כספי מחוץ לאפליקציה.</p>
          </div>
        );
      case 'מדיניות פרטיות':
        return (
          <div className="text-gray-400 text-sm leading-relaxed space-y-4 animate-in fade-in duration-300 p-2">
            <h3 className="text-white font-bold text-lg">הפרטיות שלך חשובה לנו</h3>
            <p>אנחנו אוספים נתונים בסיסיים כמו שם משתמש ומידע על הדרופים שלך כדי לספק חווית שימוש מותאמת אישית.</p>
            <p>המידע שלך מאובטח ואינו מועבר לצדדים שלישיים ללא הסכמתך.</p>
          </div>
        );
      case 'אודות':
        return (
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300 py-10">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <span className="text-4xl font-black text-black">D</span>
            </div>
            <div>
              <h3 className="text-white font-black text-2xl">Dop v1.0.6</h3>
              <p className="text-gray-500 font-medium mt-2">הדור הבא של שיתוף הדרופים</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3 animate-in fade-in duration-300">
            {[
              { id: 'עריכת פרופיל', icon: UserCircle, color: 'text-emerald-400', drop: 'group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]', border: 'hover:border-emerald-500/30' },
              { id: 'מדיניות פרטיות', icon: ShieldCheck, color: 'text-red-400', drop: 'group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]', border: 'hover:border-red-500/30' },
              { id: 'תקנון שימוש', icon: FileText, color: 'text-yellow-400', drop: 'group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]', border: 'hover:border-yellow-500/30' },
              { id: 'אודות', icon: Info, color: 'text-white', drop: 'group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]', border: 'hover:border-white/30' }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveSettingModal(item.id)} className={`w-full flex justify-between items-center p-5 bg-zinc-900/50 rounded-[1.5rem] border border-white/5 text-white font-bold active:scale-98 transition-all ${item.border} group`}>
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={`${item.color} ${item.drop} transition-all`} />
                  {item.id}
                </div>
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] overflow-y-auto pb-28 hide-scrollbar text-white" dir="rtl">
      
      <div className="h-48 bg-gradient-to-b from-zinc-800/40 to-[#050505] relative border-b border-white/5">
        <div className="absolute top-12 left-4 flex gap-3 z-20">
          <button onClick={handleLogout} className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 active:scale-95 transition-all hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"><LogOut size={18} /></button>
          <button onClick={() => setShowSettings(true)} className="p-3 bg-white/5 rounded-2xl text-white border border-white/10 active:scale-95 transition-all hover:bg-white/10"><Settings size={18} /></button>
        </div>
      </div>

      <div className="px-4 relative -mt-20 flex flex-col items-center">
        {/* תמונת פרופיל */}
        <div className={`w-36 h-36 rounded-full bg-zinc-900 border-[6px] ${user.has_halo ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'border-white/10'} overflow-hidden relative z-10 transition-all`}>
          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="תמונה" /> : <span className="text-5xl text-white/10 flex items-center justify-center h-full font-black">@</span>}
        </div>

        {/* שם משתמש תמיד בלבן */}
        <h2 className="mt-5 text-3xl font-black tracking-tighter flex items-center gap-2 text-white">
          {user.has_halo && <Crown size={20} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />}
          @{user.username || 'אנונימי'}
        </h2>

        {user.social_link && (
          <a href={user.social_link} target="_blank" rel="noreferrer" className="mt-4 text-white font-black text-xs flex items-center gap-2 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 transition-all" dir="ltr">
            <LinkIcon size={14} className="text-emerald-400" /> {user.social_link.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* סטטיסטיקות */}
        <div className="flex gap-3 w-full max-w-sm mt-10">
          <div className="flex-[1.2] bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-20 bg-yellow-500/10 blur-3xl"></div>
            <CircleDollarSign size={24} className="text-yellow-500 mb-3 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <span className="text-4xl font-black text-white">{totalCoins}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">מטבעות דופ</span>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col items-center justify-center py-4 relative overflow-hidden">
              <span className="text-2xl font-black text-white">{totalDrops}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">דרופים פעילים</span>
            </div>
            <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col items-center justify-center py-4 relative overflow-hidden">
              <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{totalBoosts}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">בוסטים שהתקבלו</span>
            </div>
          </div>
        </div>

        {/* כפתור איסוף בלבן עם ארנק בסוף */}
        <div className="w-full max-w-sm mt-4">
          <button
            onClick={handleClaimYield}
            disabled={!canClaim || claiming || totalDrops === 0}
            className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${canClaim && totalDrops > 0 ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:bg-gray-200 active:scale-95' : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'}`}
          >
            {claiming ? (
              <Loader2 className="animate-spin" size={24} />
            ) : canClaim && totalDrops > 0 ? (
              <>משיכת רווחים <Wallet size={24} /></>
            ) : totalDrops === 0 ? (
              <>אין רווחים זמינים <Wallet size={24} /></>
            ) : (
              <>הרווחים נאספו להיום <CheckCircle2 size={24} className="text-gray-500" /></>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-500 mt-3 font-bold">מבוסס על דרופים ששרדו 24 שעות בפיד</p>
        </div>
      </div>

      {/* הדרופים שלי */}
      <div className="mt-14 px-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-white font-black text-lg tracking-widest uppercase">הדרופים שלי</h3>
          <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <Clock size={12} /> מייצרים רווח
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {drops.map(drop => {
            const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
            return (
              <div key={drop.id} className="aspect-[3/4] bg-zinc-900 rounded-2xl relative overflow-hidden group shadow-lg border border-white/5 hover:border-emerald-500/30 transition-all">
                {isImage ? <img src={drop.video_url} className="w-full h-full object-cover opacity-80" alt="דרופ" /> : <video src={drop.video_url} className="w-full h-full object-cover opacity-80" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-2 inset-x-0 text-center flex justify-center">
                   <span className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[9px] font-black text-yellow-400 border border-white/10">
                     <CircleDollarSign size={10} /> +50/יום
                   </span>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
                  <button onClick={() => setDropToDelete(drop.id)} className="p-2 bg-red-500/20 hover:bg-red-500 rounded-full text-white backdrop-blur-md transition-all active:scale-75 shadow-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* מודאל הגדרות */}
      {showSettings && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="pt-12 pb-5 px-6 border-b border-white/10 flex justify-between items-center bg-black backdrop-blur-md shrink-0">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              {activeSettingModal ? activeSettingModal : 'הגדרות'}
            </h2>
            <button 
              onClick={() => { 
                if (activeSettingModal) setActiveSettingModal(null); 
                else setShowSettings(false); 
              }} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all active:scale-90"
            >
              {activeSettingModal ? <ChevronLeft className="rotate-180" size={20}/> : <X size={20}/>}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar pb-32">
            {renderSettingContent()}
          </div>
        </div>
      )}

      {/* מודאל מחיקה מודגש באדום */}
      {dropToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6" onClick={() => setDropToDelete(null)}>
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">למחוק את הדרופ?</h3>
            <p className="text-gray-400 text-sm mb-8 font-bold">מחיקת הדרופ תפסיק את ייצור הרווחים היומי שלו ב-Dop.</p>
            <div className="flex gap-3">
              <button onClick={() => setDropToDelete(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold active:scale-95 transition-all hover:bg-white/10">ביטול</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:bg-red-500 active:scale-95 transition-all">מחק לצמיתות</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
