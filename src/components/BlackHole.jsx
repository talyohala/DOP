import React, { useState, useEffect } from 'react';
import { Skull, CircleDollarSign, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const BlackHole = () => {
  const [deadDrops, setDeadDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: user } = await supabase.from('dop_users').select('*').eq('id', session.user.id).single();
      setCurrentUser(user);
    }

    const now = new Date().toISOString();
    const { data: deadVideos } = await supabase
      .from('dop_videos')
      .select('*, users(username)')
      .lt('expires_at', now)
      .order('expires_at', { ascending: false })
      .limit(30);

    if (deadVideos) setDeadDrops(deadVideos);
    setLoading(false);
  };

  const handleRevive = async (drop) => {
    if (!currentUser) return;
    const REVIVE_COST = 500;

    if (currentUser.dop_coins < REVIVE_COST) {
      return toast.error('אין לך מספיק מטבעות לפדיון!', { style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' } });
    }

    setProcessingId(drop.id);
    try {
      const newBalance = currentUser.dop_coins - REVIVE_COST;
      
      // 1. הורדת התשלום מהמשתמש
      await supabase.from('dop_users').update({ dop_coins: newBalance }).eq('id', currentUser.id);
      
      // 2. השתלטות עוינת: שינוי בעלות למשתמש הפודה ותוספת של 24 שעות
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('dop_videos').update({ 
        user_id: currentUser.id, 
        expires_at: newExpiresAt,
        description: `[הוקם לתחייה] ${drop.description}`
      }).eq('id', drop.id);

      // 3. התראה למשתמש המקורי שגנבו לו את הסרטון
      if (drop.user_id !== currentUser.id) {
        await supabase.from('dop_notifications').insert({
          user_id: drop.user_id,
          content: `מישהו פדה את הדרופ המת שלך מהחור השחור ולקח עליו בעלות! ☠️`,
          type: 'system'
        });
      }

      setCurrentUser({ ...currentUser, dop_coins: newBalance });
      setDeadDrops(deadDrops.filter(d => d.id !== drop.id));
      toast.success('הדרופ הוקם לתחייה והוא עכשיו שלך! 🧟‍♂️', { style: { background: '#18181b', color: '#10b981', border: '1px solid #059669' } });
      
    } catch (error) {
      console.error('שגיאה בפדיון:', error);
      toast.error('שגיאה בפעולה.', { style: { background: '#18181b', color: '#fff' } });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] overflow-y-auto pb-28 text-white relative" dir="rtl">
      <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-red-950/40 to-transparent sticky top-0 z-20 backdrop-blur-sm border-b border-red-500/10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-red-500 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <Skull size={28} /> החור השחור
          </h2>
          <p className="text-xs text-red-400/70 font-bold mt-1 tracking-widest uppercase">בית הקברות של הדרופים</p>
        </div>
        <div className="text-center bg-black/50 p-2 rounded-xl border border-red-500/20">
           <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">הון זמין</span>
           <span className="text-sm font-black text-yellow-500 flex items-center justify-center gap-1">
             <CircleDollarSign size={14} /> {currentUser?.dop_coins?.toFixed(1) || 0}
           </span>
        </div>
      </div>

      <div className="px-4 mt-6">
        <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed bg-red-500/5 p-4 rounded-2xl border border-red-500/10 text-center">
          כאן קבורים סרטונים שהזמן שלהם נגמר. שלם <span className="text-yellow-500 font-bold">500 DOP</span> כדי להקים דרופ לתחייה, להחזיר אותו לפיד ולגנוב את כל הרווחים העתידיים שלו אליך.
        </p>

        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
        ) : deadDrops.length === 0 ? (
          <div className="text-center mt-32 opacity-30">
            <Skull size={64} className="mx-auto mb-4" />
            <p className="font-black text-xl tracking-widest">החור השחור ריק</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {deadDrops.map(drop => {
              const isImage = drop.video_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
              return (
                <div key={drop.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group">
                  <div className="absolute inset-0 bg-black/60 z-10"></div>
                  {isImage ? (
                    <img src={drop.video_url} className="w-full h-full object-cover grayscale opacity-50" />
                  ) : (
                    <video src={drop.video_url} className="w-full h-full object-cover grayscale opacity-50" />
                  )}
                  
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-3">
                    <div className="text-[10px] font-bold text-gray-400 bg-black/60 px-2 py-1 rounded-lg w-fit">
                      @{drop.users?.username || 'אנונימי'}
                    </div>
                    
                    <button 
                      onClick={() => handleRevive(drop)}
                      disabled={processingId === drop.id}
                      className="w-full py-3 bg-red-600/80 hover:bg-red-500 text-white font-black text-xs rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {processingId === drop.id ? <Loader2 size={16} className="animate-spin" /> : <><RefreshCw size={14} /> פדה בעלות</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlackHole;
