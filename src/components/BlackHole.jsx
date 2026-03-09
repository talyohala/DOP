import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, Coins, Gem, Archive, Wallet, 
  Flame, History, Layers, Recycle, 
  Landmark, Target, Users, AlertTriangle
} from 'lucide-react';

export default function BlackHole({ currentUser, drops, onClose, onUpdateUser, onDropsUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [singularityLevel, setSingularityLevel] = useState(82);
  const [hasAdvance, setHasAdvance] = useState(false);
  const [selectedDropForMerge, setSelectedDropForMerge] = useState(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020005] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userDrops = drops?.filter(d => d.user_id === currentUser.id) || [];

  // --- 1. פונקציית משחק: החור השחור ---
  const handleFeedBlackHole = async (amount) => {
    if (loading || isSpinning) return;
    if ((currentUser.dop_coins || 0) < amount) return toast.error("אין לך מספיק DOP לפעולה זו");

    setIsSpinning(true);

    try {
      const newBalance = currentUser.dop_coins - amount;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });

      await new Promise(res => setTimeout(res, 2500)); // אפקט מתח

      const isWin = Math.random() > 0.8; // 20% סיכוי לזכות

      if (isWin) {
        const winAmount = amount * 5;
        const finalBalance = newBalance + winAmount;
        await supabase.from('dop_users').update({ dop_coins: finalBalance }).eq('id', currentUser.id);
        onUpdateUser({ ...currentUser, dop_coins: finalBalance });
        
        toast.success(`מטורף! החור פלט ${winAmount.toLocaleString()} DOP!`, {
          icon: '🤯',
          style: { background: '#111', color: '#a855f7', border: '1px solid #a855f7' }
        });
      } else {
        toast.error("ה-DOP נבלע לנצח באפלה...", { icon: '🕳️', style: { background: '#111', color: '#fff' }});
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת");
    } finally {
      setIsSpinning(false);
    }
  };

  // --- 2. פונקציות ארכיון ---
  const handleArchiveRestore = async () => {
    if (loading) return;
    if ((currentUser.dop_coins || 0) < 200) return toast.error('אין מספיק DOP');
    
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 200;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      toast.success('השחזור בוצע! אתה גוזר 25% עמלה', { icon: '🔄', style: { background: '#111', color: '#a855f7' }});
    } catch (error) {
      toast.error('שגיאה בשחזור');
    } finally { setLoading(false); }
  };

  const handleMergeDrops = async () => {
    if (!selectedDropForMerge || loading) return;
    if ((currentUser.dop_coins || 0) < 1500) return toast.error('אין מספיק DOP');
    
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 1500;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      if (onDropsUpdate) onDropsUpdate();
      toast.success('המיזוג הושלם! דרופ חזק נוצר', { icon: '🧬' });
      setSelectedDropForMerge(null);
    } catch (error) {
      toast.error('שגיאה במיזוג');
    } finally { setLoading(false); }
  };

  // --- 3. פונקציות כלכלה ---
  const handleAdvanceRequest = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newBalance = (currentUser.dop_coins || 0) + 10000;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      setHasAdvance(true);
      toast.success('מקדמה של 10,000 אושרה!', { icon: '💰' });
    } catch (error) { toast.error('שגיאה בקבלת מקדמה'); } 
    finally { setLoading(false); }
  };

  const handleRepayAdvance = async () => {
    if (loading) return;
    if ((currentUser.dop_coins || 0) < 12500) return toast.error('אין מספיק DOP לפירעון');
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 12500;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      setHasAdvance(false);
      toast.success('המקדמה שולמה בהצלחה!', { icon: '✅' });
    } catch (error) { toast.error('שגיאה בפירעון'); } 
    finally { setLoading(false); }
  };

  const handleConvertToGems = async () => {
    if (loading) return;
    if ((currentUser.dop_coins || 0) < 500) return toast.error("אין מספיק DOP להמרה");
    setLoading(true);
    try {
      const updates = { 
        mint_gems: (currentUser.mint_gems || 0) + 15,
        dop_coins: currentUser.dop_coins - 500
      };
      await supabase.from('dop_users').update(updates).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, ...updates });
      toast.success('500 DOP הומרו ל-15 יהלומים!', { icon: '💎', style: { border: '1px solid #3b82f6' }});
    } catch (error) { toast.error('שגיאה בהמרה'); } 
    finally { setLoading(false); }
  };

  // --- 4. פונקציות קהילה ---
  const handleDonateToCommunity = async () => {
    if (loading) return;
    if ((currentUser.dop_coins || 0) < 100) return toast.error('אין מספיק DOP');
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 100;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      const newLevel = Math.min(singularityLevel + 2, 100);
      setSingularityLevel(newLevel);
      toast.success('תרומתך נקלטה בקרן!', { icon: '❤️' });
      if (newLevel >= 100) toast.success('היעד הושלם! בוסט קהילתי פעיל', { duration: 4000 });
    } catch (error) { toast.error('שגיאה בתרומה'); } 
    finally { setLoading(false); }
  };

  const categories = [
    { id: 'blackhole', title: 'החור השחור', desc: 'הימור מסוכן מול המערכת', icon: <Target size={56} className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />, bg: 'bg-purple-950/20 border-purple-500/40' },
    { id: 'archive', title: 'ניהול נכסים', desc: 'שחזור ומיזוג תוכן', icon: <Archive size={56} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />, bg: 'bg-cyan-950/20 border-cyan-500/40' },
    { id: 'finance', title: 'כלכלה ומימון', desc: 'מקדמות והמרות', icon: <Wallet size={56} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />, bg: 'bg-emerald-950/20 border-emerald-500/40' },
    { id: 'community', title: 'הקרן הקהילתית', desc: 'האצת האלגוריתם יחד', icon: <Flame size={56} className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />, bg: 'bg-rose-950/20 border-rose-500/40' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#020005] text-white overflow-y-auto font-sans" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2e1065_0%,#020005_70%)] opacity-40 pointer-events-none"></div>

        {/* כותרת הצומת */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg relative z-20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Layers size={28} className="text-purple-400" />
              <h1 className="text-2xl font-black text-white">מרכז בקרה</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.title : 'כלים אסטרטגיים ומסוכנים'}
            </p>
          </div>
          <button onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()} disabled={isSpinning} className="bg-white/10 p-4 rounded-[20px] active:scale-95 transition-transform disabled:opacity-50">
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        {/* יתרות */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-20">
          <div className="bg-[#0a0a0a] border border-emerald-500/30 p-5 rounded-[28px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-emerald-400 font-black tracking-widest uppercase">יתרת DOP</span>
              <Coins size={20} className="text-emerald-500" />
            </div>
            <span className="text-3xl font-black text-white">{currentUser?.dop_coins?.toLocaleString() || '0'}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-blue-500/30 p-5 rounded-[28px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-blue-400 font-black tracking-widest uppercase">יהלומים</span>
              <Gem size={20} className="text-blue-500" />
            </div>
            <span className="text-3xl font-black text-white">{currentUser?.mint_gems?.toLocaleString() || '0'}</span>
          </div>
        </div>

        {/* תוכן המסך */}
        <div className="relative z-20">
          {!selectedCategory ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
              {categories.map(cat => (
                <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`${cat.bg} border-2 rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer aspect-square justify-center active:scale-95 transition-transform shadow-xl`}>
                  <div className="mb-4">{cat.icon}</div>
                  <h3 className="text-xl font-black text-white mb-1">{cat.title}</h3>
                  <p className="text-[10px] text-white/60 font-bold px-1">{cat.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* 1. החור השחור (הימורים) */}
              {selectedCategory === 'blackhole' && (
                <div className="space-y-6">
                  <div className="relative flex justify-center items-center py-12 overflow-hidden">
                    <div className={`absolute w-64 h-64 bg-purple-600/30 rounded-full blur-[60px] transition-all duration-1000 ${isSpinning ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                    <div className={`w-48 h-48 bg-black rounded-full border-4 shadow-[0_0_50px_rgba(168,85,247,0.3)] flex items-center justify-center relative z-10 transition-all duration-1000 ${isSpinning ? 'animate-spin border-purple-500 scale-90' : 'border-[#111]'}`}>
                      <div className="absolute inset-2 border-2 border-dashed border-purple-500/20 rounded-full"></div>
                      <div className={`text-center transition-opacity ${isSpinning ? 'opacity-0' : 'opacity-100'}`}>
                        <Target size={32} className="text-purple-500/50 mx-auto mb-2" />
                        <span className="text-purple-500/50 font-black text-xs tracking-widest uppercase">השלך DOP</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-950/40 to-[#0a0a0a] border border-purple-500/30 rounded-[32px] p-6 text-center shadow-xl">
                    <AlertTriangle size={24} className="text-purple-400 mx-auto mb-3" />
                    <h3 className="font-black text-lg mb-1">סכנה: נקודת אל-חזור</h3>
                    <p className="text-xs text-white/60 mb-6">יש סיכוי של 20% שהאנרגיה תתפוצץ ותחזיר <strong className="text-purple-400">פי 5</strong> מהסכום.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[100, 1000, 5000].map((amt) => (
                        <button key={amt} onClick={() => handleFeedBlackHole(amt)} disabled={isSpinning || loading} className="bg-[#050505] border border-purple-500/30 hover:bg-purple-900/30 text-purple-400 font-black py-4 rounded-[20px] active:scale-95 transition-all disabled:opacity-50">
                          {amt >= 1000 ? `${amt/1000}k` : amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ניהול נכסים (ארכיון ומיזוג) */}
              {selectedCategory === 'archive' && (
                <div className="space-y-4">
                  <div className="bg-[#0f0f0f] border border-cyan-500/30 rounded-[32px] p-6 relative">
                    <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-[16px]">ארכיון קפוא</div>
                    <div className="flex items-center gap-4 mt-2 mb-5">
                      <div className="w-14 h-14 bg-cyan-500/10 rounded-[16px] flex items-center justify-center border border-cyan-500/30"><History size={28} className="text-cyan-400" /></div>
                      <div>
                        <h3 className="font-black text-lg text-white">סרטון גנוז #142</h3>
                        <p className="text-xs text-white/50">החייה את התוכן וגזור 25% עמלה</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleArchiveRestore} disabled={loading} className="flex-[2] bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 font-black py-4 rounded-[20px] active:scale-95 flex items-center justify-center gap-2">
                        {loading ? 'משחזר...' : <><Coins size={16}/> 200 DOP</>}
                      </button>
                      <div className="flex-1 bg-white/5 rounded-[20px] flex flex-col items-center justify-center border border-white/10"><span className="text-[10px] text-white/50">עמלה</span><span className="text-lg font-black text-cyan-300">25%</span></div>
                    </div>
                  </div>

                  <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 text-center">
                    <h3 className="font-black text-lg text-white mb-1">מיזוג אלגוריתמי</h3>
                    <p className="text-xs text-white/50 mb-6">שלב ביצועים של שני נכסים לנכס ויראלי אחד</p>
                    <div className="flex justify-between items-center mb-6 px-4">
                      <div onClick={() => setSelectedDropForMerge(!selectedDropForMerge)} className="w-20 h-24 bg-white/5 border-2 border-dashed border-white/20 rounded-[16px] flex items-center justify-center text-white/30 text-xs font-bold cursor-pointer active:scale-95 hover:border-cyan-400">
                        {selectedDropForMerge ? 'נבחר' : 'בחר תוכן'}
                      </div>
                      <Layers size={24} className="text-cyan-500/50" />
                      <div className="w-20 h-24 bg-white/5 border-2 border-dashed border-white/20 rounded-[16px] flex items-center justify-center text-white/30 text-xs font-bold opacity-50">תוכן ב</div>
                    </div>
                    <button onClick={handleMergeDrops} disabled={loading || !selectedDropForMerge} className="w-full bg-white/10 text-white font-black py-4 rounded-[20px] active:scale-95 disabled:opacity-50">אשר מיזוג (1,500 DOP)</button>
                  </div>
                </div>
              )}

              {/* 3. כלכלה ומימון */}
              {selectedCategory === 'finance' && (
                <div className="space-y-4">
                  {!hasAdvance ? (
                    <div className="bg-gradient-to-br from-[#0a1515] to-[#050505] border border-emerald-500/40 rounded-[32px] p-6 text-center">
                      <Landmark size={40} className="text-emerald-400 mx-auto mb-3" />
                      <div className="text-4xl font-black text-emerald-400 mb-1">10,000 DOP</div>
                      <div className="text-xs text-white/50 mb-6 font-bold uppercase tracking-widest">מקדמת יוצרים מיידית</div>
                      <div className="bg-black/50 border border-white/5 rounded-[20px] p-4 mb-6 text-right space-y-2 text-xs text-white/60">
                        <div className="flex justify-between"><span>החזר נדרש:</span><span className="text-emerald-400 font-bold">12,500 DOP</span></div>
                        <div className="flex justify-between"><span>זמן יעד:</span><span className="text-white">24 שעות</span></div>
                      </div>
                      <button onClick={handleAdvanceRequest} disabled={loading} className="w-full bg-emerald-600 text-black font-black py-4 rounded-[20px] active:scale-95">קבלת מקדמה עכשיו</button>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-[32px] p-6 text-center">
                      <h3 className="text-emerald-400 font-black text-lg mb-2">יעד פירעון פעיל</h3>
                      <div className="text-4xl font-black text-white mb-2">12,500 DOP</div>
                      <button onClick={handleRepayAdvance} disabled={loading} className="w-full mt-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-black py-4 rounded-[20px] active:scale-95">בצע פירעון כעת</button>
                    </div>
                  )}

                  <div className="bg-[#0f0f0f] border border-blue-500/30 rounded-[32px] p-6 text-center">
                    <Recycle size={32} className="text-blue-400 mx-auto mb-3" />
                    <h3 className="font-black text-lg text-white mb-1">המרה ליהלומים</h3>
                    <p className="text-xs text-white/50 mb-6 px-4">השמד סרטון בעל ביצועים נמוכים והמר את השאריות ליהלומים</p>
                    <button onClick={handleConvertToGems} disabled={loading} className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/40 font-black text-sm py-4 rounded-[20px] active:scale-95 flex justify-center items-center gap-2">
                      <Gem size={16}/> המר תוכן (500 DOP = 15💎)
                    </button>
                  </div>
                </div>
              )}

              {/* 4. קהילה */}
              {selectedCategory === 'community' && (
                <div className="bg-gradient-to-b from-[#1a0b1c] to-[#050505] border border-rose-500/40 rounded-[32px] p-8 text-center relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/20 blur-[50px] rounded-full pointer-events-none"></div>
                  <Users size={64} className="text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] mx-auto mb-6 relative z-10" />
                  <h3 className="text-2xl font-black text-white mb-2 relative z-10">קרן הסינגולריות</h3>
                  <p className="text-xs text-rose-200/60 mb-8 px-4 relative z-10">כשהיעד יושלם, כל המשתמשים הפעילים יקבלו בוסט חשיפה אוטומטי לשעה שלמה.</p>
                  
                  <div className="mb-8 relative z-10">
                    <div className="flex justify-between text-[11px] font-black text-rose-300 mb-2 px-1"><span>התקדמות היעד</span><span>{singularityLevel}%</span></div>
                    <div className="w-full h-4 bg-black/50 rounded-full border border-rose-500/20 overflow-hidden relative p-0.5">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-rose-400 rounded-full transition-all duration-1000" style={{ width: `${singularityLevel}%` }} />
                    </div>
                  </div>

                  <button onClick={handleDonateToCommunity} disabled={loading} className="w-full bg-rose-600 text-white font-black text-lg py-5 rounded-[24px] active:scale-95 shadow-[0_0_30px_rgba(244,63,94,0.3)] relative z-10 disabled:opacity-50">
                    תרום לקרן (100 DOP)
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
