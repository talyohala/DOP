import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CircleDollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const UploadScreen = ({ onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [bounty, setBounty] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data } = await supabase.from('dop_users').select('dop_coins').eq('id', session.user.id).single();
        if (data) setUserCoins(data.dop_coins || 0);
      }
    };
    fetchUser();
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) return toast.error('הקובץ גדול מדי. המקסימום הוא 50MB');
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return toast.error('יש לבחור קובץ להעלאה');
    if (bounty > userCoins) return toast.error('אין לך מספיק מטבעות לקופה זו');
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('dop_videos').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error('שגיאה בהעלאת הקובץ לשרת');

      const { data: { publicUrl } } = supabase.storage.from('dop_videos').getPublicUrl(fileName);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error: insertError } = await supabase.from('dop_videos').insert({ user_id: userId, video_url: publicUrl, description, expires_at: expiresAt, bounty_pool: bounty, boosts: 0 });
      if (insertError) throw new Error('שגיאה בשמירת נתוני הדרופ במסד הנתונים');

      if (bounty > 0) {
        await supabase.from('dop_users').update({ dop_coins: userCoins - bounty }).eq('id', userId);
        await supabase.from('dop_notifications').insert({ user_id: userId, content: `הפקדת ${bounty} מטבעות לקופת הדרופ החדש שלך. בהצלחה! 🎯`, type: 'system' });
      }

      toast.success('הדרופ עלה בהצלחה!', { style: { background: '#18181b', color: '#10b981' } });
      onUploadComplete();
    } catch (error) {
      toast.error(error.message || 'שגיאה כללית בהעלאת הדרופ', { style: { background: '#18181b', color: '#ef4444' } });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col font-sans text-white animate-in slide-in-from-bottom duration-300 backdrop-blur-xl" dir="rtl">
      <div className="pt-12 pb-4 px-6 border-b border-white/10 flex justify-between items-center bg-black/50 shrink-0 relative z-20">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">דרופ חדש</h2>
        <button onClick={onClose} disabled={uploading} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 disabled:opacity-50"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar pb-32">
        <div onClick={() => !uploading && fileInputRef.current?.click()} className={`w-full h-64 bg-white/5 border-2 border-dashed ${previewUrl ? 'border-transparent bg-black' : 'border-white/20 hover:border-emerald-500/50'} rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden transition-all ${!uploading ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : 'opacity-50'}`}>
          {previewUrl ? (
            <>
              {file.type.includes('video') ? <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={previewUrl} className="w-full h-full object-cover" alt="תצוגה" />}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="bg-white/20 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2"><Upload size={18} /> החלף מדיה</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-3 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all"><Upload size={32} /></div>
              <p className="font-bold text-gray-400 text-sm">לחץ לבחירת סרטון או תמונה</p>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*,image/*" className="hidden" disabled={uploading} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">תיאור הדרופ</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} placeholder="מה קורה פה?..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 resize-none h-24 transition-all" />
        </div>

        <div className={`bg-gradient-to-br from-yellow-500/10 to-transparent p-5 rounded-[2rem] border border-yellow-500/20 shadow-lg relative overflow-hidden transition-opacity ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <label className="text-yellow-400 font-black flex items-center gap-2 text-lg"><CircleDollarSign size={20} /> קופת פרס</label>
            <span className="text-xs text-yellow-500/90 font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">יתרה: {userCoins.toFixed(0)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-5 relative z-10 font-medium leading-relaxed">משוך צופים להילחם על הדרופ! כל מי שייתן בוסט ישדוד נתח ישירות לכיס שלו.</p>
          <div className="flex gap-2 mb-6 relative z-10">
            {[0, 50, 100, 500].map(amount => (
              <button key={amount} onClick={() => setBounty(amount)} disabled={amount > userCoins} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-30 ${bounty === amount ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-black/50 text-gray-400 border border-white/5 hover:border-yellow-500/30'}`}>{amount === 0 ? 'ללא' : `+${amount}`}</button>
            ))}
          </div>
          <div className="relative z-10 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">סכום להפקדה</span>
            <span className="text-3xl font-black text-yellow-500 tracking-tighter">{bounty}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
        <button onClick={handleUpload} disabled={uploading || !file} className={`w-full py-4.5 font-black text-lg rounded-2xl active:scale-95 transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-2 ${uploading || !file ? 'bg-white/10 text-gray-500' : 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'}`}>
          {uploading ? <><Loader2 size={24} className="animate-spin" /> מעלה לאוויר...</> : <><Upload size={24} /> שגר דרופ לזירה</>}
        </button>
      </div>
    </div>
  );
};

export default UploadScreen;
