import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import {
  ChevronRight, Coins, Gem, Archive, Wallet,
  Flame, History, Layers, Recycle,
  Landmark, Target, Users, AlertTriangle, Play
} from 'lucide-react';

export default function BlackHole({ currentUser, drops, onClose, onUpdateUser, onDropsUpdate, isLightMode = false }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States - Black Hole
  const [isSpinning, setIsSpinning] = useState(false);
  
  // States - Archive & Merge
  const [mergeDrop1, setMergeDrop1] = useState('');
  const [mergeDrop2, setMergeDrop2] = useState('');
  const [dropToConvert, setDropToConvert] = useState('');

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020005] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userDrops = drops?.filter(d => d.user_id === currentUser.id) || [];
  
  // Theming
  const bgMain = isLightMode ? 'bg-gray-50' : 'bg-[#020005]';
  const textMain = isLightMode ? 'text-gray-900' : 'text-white';
  const bgCard = isLightMode ? 'bg-white' : 'bg-[#0a0a0a]';
  const borderSubtle = isLightMode ? 'border-gray-200' : 'border-white/10';

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
        toast.success(`מטורף! החור פלט ${winAmount.toLocaleString()} DOP!`, { icon: '🤯', style: { background: '#111', color: '#a855f7' }});
      } else {
        toast.error("ה-DOP נבלע לנצח באפלה...", { icon: '🕳️', style: { background: '#111', color: '#fff' }});
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת");
    } finally {
      setIsSpinning(false);
    }
  };

  // --- 2. פונקציות ארכיון ומיזוג אמיתיות ---
  const handleMergeDrops = async () => {
    if (!mergeDrop1 || !mergeDrop2 || mergeDrop1 === mergeDrop2) return toast.error("יש לבחור שני נכסים שונים");
    if ((currentUser.dop_coins || 0) < 1500) return toast.error('אין מספיק DOP למיזוג');

    setLoading(true);
    try {
      const drop1Data = userDrops.find(d => d.id === mergeDrop1);
      const drop2Data = userDrops.find(d => d.id === mergeDrop2);
      
      const combinedBounty = (drop1Data.bounty_pool || 0) + (drop2Data.bounty_pool || 0) + 1000; // בונוס מיזוג 1000
      
      // הורדת DOP מהמשתמש
      const newBalance = currentUser.dop_coins - 1500;
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      
      // מחיקת דרופ 2 ועדכון דרופ 1
      await supabase.from('dop_videos').delete().eq('id', mergeDrop2);
      await supabase.from('dop_videos').update({ bounty_pool: combinedBounty }).eq('id', mergeDrop1);

      onUpdateUser({ ...currentUser, dop_coins: newBalance });
      if (onDropsUpdate) onDropsUpdate();
      toast.success(`המיזוג הושלם! הקופה החדשה: ${combinedBounty}`, { icon: '🧬' });
      
      setMergeDrop1('');
      setMergeDrop2('');
    } catch (error) {
      toast.error('שגיאה במיזוג הנכסים');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToGems = async () => {
    if (!dropToConvert) return toast.error("בחר נכס להשמדה");
    if ((currentUser.dop_coins || 0) < 500) return toast.error("אין מספיק DOP לתהליך ההמרה");
    
    setLoading(true);
    try {
      // מחיקת הנכס
      await supabase.from('dop_videos').delete().eq('id', dropToConvert);
      
      // עדכון משתמש (הורדת DOP והוספת יהלומים)
      const updates = { 
        mint_gems: (currentUser.mint_gems || 0) + 15, 
        dop_coins: currentUser.dop_coins - 500 
      };
      await supabase.from('dop_users').update(updates).eq('id', currentUser.id);
      
      onUpdateUser({ ...currentUser, ...updates });
      if (onDropsUpdate) onDropsUpdate();
      
      toast.success('הנכס הושמד! הומרו 15 יהלומים.', { icon: '💎' });
      setDropToConvert('');
    } catch (error) {
      toast.error('שגיאה בהשמדת הנכס');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. פונקציות כלכלה אמיתיות ---
  const handleAdvanceRequest = async () => {
    setLoading(true);
    try {
      const newBalance = (currentUser.dop_coins || 0) + 10000;
      await supabase.from('dop_users').update({ dop_coins: newBalance, has_advance: true }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance, has_advance: true });
      toast.success('מקדמה של 10,000 אושרה!', { icon: '💰' });
    } catch (error) { toast.error('שגיאה בקבלת מקדמה'); }
    finally { setLoading(false); }
  };

  const handleRepayAdvance = async () => {
    if ((currentUser.dop_coins || 0) < 12500) return toast.error('אין מספיק DOP לפירעון');
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 12500;
      await supabase.from('dop_users').update({ dop_coins: newBalance, has_advance: false }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance, has_advance: false });
      toast.success('המקדמה שולמה בהצלחה!', { icon: '✅' });
    } catch (error) { toast.error('שגיאה בפירעון'); }
    finally { setLoading(false); }
  };

  const handleDonateToCommunity = async () => {
    if ((currentUser.dop_coins || 0) < 100) return toast.error('אין מספיק DOP');
    setLoading(true);
    try {
      const newBalance = currentUser.dop_coins - 100;
      const newLevel = Math.min((currentUser.singularity_level || 82) + 2, 100);
      
      await supabase.from('dop_users').update({ dop_coins: newBalance, singularity_level: newLevel }).eq('id', currentUser.id);
      onUpdateUser({ ...currentUser, dop_coins: newBalance, singularity_level: newLevel });
      
      toast.success('תרומתך נקלטה בקרן!', { icon: '❤️' });
      if (newLevel >= 100) toast.success('היעד הושלם! בוסט קהילתי פעיל', { duration: 4000 });
    } catch (error) { toast.error('שגיאה בתרומה'); }
    finally { setLoading(false); }
  };

  const categories = [
    { id: 'blackhole', title: 'החור השחור', desc: 'הימור מסוכן מול המערכת', icon: <Target size={56} className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />, bg: 'bg-purple-950/20 border-purple-500/40' },
    { id: 'archive', title: 'ניהול נכסים', desc: 'השמדה ומיזוג תוכן', icon: <Archive size={56} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />, bg: 'bg-cyan-950/20 border-cyan-500/40' },
    { id: 'finance', title: 'כלכלה ומימון', desc: 'מקדמות והמרות', icon: <Wallet size={56} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />, bg: 'bg-emerald-950/20 border-emerald-500/40' },
    { id: 'community', title: 'הקרן הקהילתית', desc: 'האצת האלגוריתם יחד', icon: <Flame size={56} className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />, bg: 'bg-rose-950/20 border-rose-500/40' }
  ];

  return (
    <div className={`fixed inset-0 z-[150] ${bgMain} ${textMain} overflow-y-auto font-sans transition-colors duration-300`} dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2e1065_0%,transparent_70%)] opacity-40 pointer-events-none"></div>
        
        {/* Header */}
        <div className={`${bgCard} border ${borderSubtle} rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg relative z-20`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Layers size={28} className="text-purple-400" />
              <h1 className="text-2xl font-black">מרכז בקרה</h1>
            </div>
            <p className="opacity-50 text-xs font-bold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.title : 'כלים אסטרטגיים ומסוכנים'}
            </p>
          </div>
          <button onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()} disabled={isSpinning} className="bg-gray-500/10 p-4 rounded-[20px] active:scale-95 transition-transform disabled:opacity-50">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-20">
          <div className={`${bgCard} border border-emerald-500/30 p-5 rounded-[28px] shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-emerald-500 font-black tracking-widest uppercase">יתרת DOP</span>
              <Coins size={20} className="text-emerald-500" />
            </div>
            <span className="text-3xl font-black">{currentUser?.dop_coins?.toLocaleString() || '0'}</span>
          </div>
          <div className={`${bgCard} border border-blue-500/30 p-5 rounded-[28px] shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-blue-500 font-black tracking-widest uppercase">יהלומים</span>
              <Gem size={20} className="text-blue-500" />
            </div>
            <span className="text-3xl font-black">{currentUser?.mint_gems?.toLocaleString() || '0'}</span>
          </div>
        </div>

        <div className="relative z-20">
          {!selectedCategory ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
              {categories.map(cat => (
                <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`${cat.bg} border-2 rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer aspect-square justify-center active:scale-95 transition-transform shadow-xl`}>
                  <div className="mb-4">{cat.icon}</div>
                  <h3 className="text-xl font-black mb-1">{cat.title}</h3>
                  <p className="text-[10px] opacity-60 font-bold px-1">{cat.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Category: Black Hole */}
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
                  <div className={`${bgCard} border border-purple-500/30 rounded-[32px] p-6 text-center shadow-xl`}>
                    <AlertTriangle size={24} className="text-purple-400 mx-auto mb-3" />
                    <h3 className="font-black text-lg mb-1">סכנה: נקודת אל-חזור</h3>
                    <p className="text-xs opacity-60 mb-6">יש סיכוי של 20% שהאנרגיה תתפוצץ ותחזיר <strong className="text-purple-500">פי 5</strong> מהסכום.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[100, 1000, 5000].map((amt) => (
                        <button key={amt} onClick={() => handleFeedBlackHole(amt)} disabled={isSpinning || loading} className="bg-gray-500/10 border border-purple-500/30 hover:bg-purple-900/30 text-purple-500 font-black py-4 rounded-[20px] active:scale-95 transition-all disabled:opacity-50">
                          {amt >= 1000 ? `${amt/1000}k` : amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Category: Archive & Merge */}
              {selectedCategory === 'archive' && (
                <div className="space-y-4">
                  <div className={`${bgCard} border border-cyan-500/30 rounded-[32px] p-6`}>
                    <h3 className="font-black text-lg mb-1">מיזוג אלגוריתמי</h3>
                    <p className="text-xs opacity-50 mb-6">שלב קופות של שני נכסים, מחק אחד והפוך את השני לחזק יותר (עלות: 1500 DOP)</p>
                    
                    {userDrops.length >= 2 ? (
                      <>
                        <div className="flex flex-col gap-3 mb-6">
                          <select value={mergeDrop1} onChange={(e) => setMergeDrop1(e.target.value)} className={`w-full bg-transparent border ${borderSubtle} rounded-[16px] py-3 px-4 outline-none font-bold text-sm`}>
                            <option value="" className="bg-black">-- בחר נכס ראשי (יישאר) --</option>
                            {userDrops.map(d => <option key={`1-${d.id}`} value={d.id} className="bg-black">נכס עם קופה: {d.bounty_pool}</option>)}
                          </select>
                          <select value={mergeDrop2} onChange={(e) => setMergeDrop2(e.target.value)} className={`w-full bg-transparent border ${borderSubtle} rounded-[16px] py-3 px-4 outline-none font-bold text-sm`}>
                            <option value="" className="bg-black">-- בחר נכס להקרבה (יימחק) --</option>
                            {userDrops.map(d => <option key={`2-${d.id}`} value={d.id} className="bg-black">נכס עם קופה: {d.bounty_pool}</option>)}
                          </select>
                        </div>
                        <button onClick={handleMergeDrops} disabled={loading || !mergeDrop1 || !mergeDrop2} className="w-full bg-cyan-600/20 text-cyan-500 border border-cyan-500/40 font-black py-4 rounded-[20px] active:scale-95 disabled:opacity-50">אשר מיזוג (1,500 DOP)</button>
                      </>
                    ) : (
                      <div className="text-center opacity-50 text-sm font-bold">דרושים לפחות 2 נכסים למיזוג.</div>
                    )}
                  </div>

                  <div className={`${bgCard} border border-blue-500/30 rounded-[32px] p-6 text-center`}>
                    <Recycle size={32} className="text-blue-500 mx-auto mb-3" />
                    <h3 className="font-black text-lg mb-1">המרה ליהלומים</h3>
                    <p className="text-xs opacity-50 mb-6 px-4">השמד סרטון בעל ביצועים נמוכים והמר אותו ליהלומים (עלות: 500 DOP)</p>
                    
                    {userDrops.length > 0 ? (
                      <>
                        <select value={dropToConvert} onChange={(e) => setDropToConvert(e.target.value)} className={`w-full bg-transparent border ${borderSubtle} rounded-[16px] py-3 px-4 outline-none font-bold text-sm mb-4`}>
                          <option value="" className="bg-black">-- בחר נכס להשמדה --</option>
                          {userDrops.map(d => <option key={`conv-${d.id}`} value={d.id} className="bg-black">נכס עם קופה: {d.bounty_pool}</option>)}
                        </select>
                        <button onClick={handleConvertToGems} disabled={loading || !dropToConvert} className="w-full bg-blue-600/20 text-blue-500 border border-blue-500/40 font-black text-sm py-4 rounded-[20px] active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50">
                          <Gem size={16}/> המר תוכן (15💎)
                        </button>
                      </>
                    ) : (
                      <div className="text-center opacity-50 text-sm font-bold">אין נכסים להשמדה.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Category: Finance */}
              {selectedCategory === 'finance' && (
                <div className="space-y-4">
                  {!currentUser?.has_advance ? (
                    <div className={`${bgCard} border border-emerald-500/40 rounded-[32px] p-6 text-center`}>
                      <Landmark size={40} className="text-emerald-500 mx-auto mb-3" />
                      <div className="text-4xl font-black text-emerald-500 mb-1">10,000 DOP</div>
                      <div className="text-xs opacity-50 mb-6 font-bold uppercase tracking-widest">מקדמת יוצרים מיידית</div>
                      <div className="bg-gray-500/10 border border-gray-500/20 rounded-[20px] p-4 mb-6 text-right space-y-2 text-xs opacity-80">
                        <div className="flex justify-between"><span>החזר נדרש:</span><span className="text-emerald-500 font-bold">12,500 DOP</span></div>
                        <div className="flex justify-between"><span>זמן יעד:</span><span className="text-emerald-500">ללא הגבלה</span></div>
                      </div>
                      <button onClick={handleAdvanceRequest} disabled={loading} className="w-full bg-emerald-600 text-white font-black py-4 rounded-[20px] active:scale-95 disabled:opacity-50">קבלת מקדמה עכשיו</button>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-[32px] p-6 text-center">
                      <h3 className="text-emerald-500 font-black text-lg mb-2">חוב פירעון פעיל</h3>
                      <div className="text-4xl font-black mb-2">12,500 DOP</div>
                      <button onClick={handleRepayAdvance} disabled={loading} className="w-full mt-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 font-black py-4 rounded-[20px] active:scale-95 disabled:opacity-50">בצע פירעון כעת</button>
                    </div>
                  )}
                </div>
              )}

              {/* Category: Community */}
              {selectedCategory === 'community' && (
                <div className={`${bgCard} border border-rose-500/40 rounded-[32px] p-8 text-center relative overflow-hidden`}>
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/20 blur-[50px] rounded-full pointer-events-none"></div>
                  <Users size={64} className="text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] mx-auto mb-6 relative z-10" />
                  <h3 className="text-2xl font-black mb-2 relative z-10">קרן הסינגולריות</h3>
                  <p className="text-xs opacity-60 mb-8 px-4 relative z-10">כשהיעד יושלם, כל המשתמשים הפעילים יקבלו בוסט חשיפה אוטומטי לשעה שלמה.</p>
                  
                  <div className="mb-8 relative z-10">
                    <div className="flex justify-between text-[11px] font-black text-rose-500 mb-2 px-1">
                      <span>התקדמות היעד</span>
                      <span>{currentUser?.singularity_level || 82}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-500/20 rounded-full border border-rose-500/20 overflow-hidden relative p-0.5">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-1000" style={{ width: `${currentUser?.singularity_level || 82}%` }} />
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
