import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { ChevronRight, UploadCloud, Video, Coins, Image as ImageIcon, X, Zap } from 'lucide-react';

export default function UploadDrop({ onClose, onUploadComplete, currentUser }) {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [bounty, setBounty] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      return toast.error('הקובץ גדול מדי. המקסימום הוא 100MB', { style: { background: '#111', color: '#fff' }});
    }

    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    
    // יצירת תצוגה מקדימה חיה
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!mediaFile) return toast.error("חובה לבחור נכס תוכן (תמונה/סרטון)");
    if (!currentUser) return toast.error("שגיאת משתמש. נסה להתחבר מחדש.");
    if ((currentUser.dop_coins || 0) < bounty) return toast.error("אין לך מספיק DOP לפתיחת הקופה הזו");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. אנימציית התקדמות (מדמה העלאה מורכבת)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? 90 : prev + 15));
      }, 300);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. עדכון יתרת המטבעות של המשתמש (מוריד את סכום ה-Bounty)
      const newBalance = (currentUser.dop_coins || 0) - bounty;
      const { error: userError } = await supabase
        .from('dop_users')
        .update({ dop_coins: newBalance })
        .eq('id', currentUser.id);

      if (userError) throw new Error("שגיאה בעדכון יתרת ה-DOP");

      // 3. הכנסת הרשומה לטבלת הוידאו (שימוש בכתובת דמו זמנית כדי למנוע קריסת חוסר ב-Storage)
      // * הערה: כשתגדיר Storage ב-Supabase נחליף את זה ללינק האמיתי *
      const dummyUrl = mediaType === 'video' 
        ? 'https://cdn.pixabay.com/video/2020/05/25/40134-424844342_tiny.mp4' 
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

      const { error: videoError } = await supabase
        .from('dop_videos')
        .insert({
          user_id: currentUser.id,
          video_url: dummyUrl, 
          bounty_pool: bounty,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (videoError) throw new Error("שגיאה ביצירת הדרופ במסד הנתונים");

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        toast.success("הנכס שוגר לאלגוריתם בהצלחה!", { 
          icon: '🚀',
          style: { background: '#1a1a1a', color: '#10b981', border: '1px solid #10b981', borderRadius: '16px' }
        });
        if(onUploadComplete) onUploadComplete();
      }, 500);

    } catch (error) {
      console.error('Upload error details:', error);
      toast.error(error.message || "שגיאה בתקשורת מול השרת", { style: { background: '#111', color: '#ef4444' }});
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] text-white overflow-y-auto font-sans" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6">

        {/* כותרת יוקרתית */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <UploadCloud size={28} className="text-emerald-400" />
              <h1 className="text-2xl font-black text-white">סטודיו שיגור</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">הכן את נכס התוכן שלך לרשת</p>
          </div>
          <button onClick={onClose} disabled={isUploading} className="bg-white/10 p-4 rounded-[20px] active:scale-95 transition-transform disabled:opacity-50">
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="space-y-4">
          
          <input type="file" accept="video/*,image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />

          {/* קוביית מדיה ענקית (Master Square) */}
          <div 
            className={`w-full aspect-square rounded-[32px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all shadow-xl ${mediaPreview ? 'bg-[#0a0a0a] border border-white/10' : 'bg-[#0a0a0a] border-2 border-dashed border-white/20 hover:border-emerald-500/50'}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {mediaPreview ? (
              <div className="relative w-full h-full group">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                )}
                
                {/* מעטפת מידע מעל המדיה */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 flex flex-col justify-between p-5 opacity-100 transition-opacity">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                      {mediaType === 'image' ? <ImageIcon size={16} className="text-emerald-400" /> : <Video size={16} className="text-blue-400" />}
                      <span className="text-xs font-black">{mediaType === 'image' ? 'תמונה' : 'סרטון'}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setMediaFile(null); setMediaPreview(null); }} disabled={isUploading} className="bg-red-500/20 text-red-400 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl text-white mb-1 truncate">{mediaFile.name}</h3>
                    <p className="text-xs text-white/70 font-bold">{(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-24 h-24 bg-white/5 rounded-[28px] flex items-center justify-center mb-5 border border-white/10 shadow-inner">
                  <UploadCloud size={48} className="text-white" />
                </div>
                <h3 className="font-black text-xl text-white mb-2">לחץ להעלאת נכס</h3>
                <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest">תומך בתמונות ווידאו</p>
              </div>
            )}

            {/* פס התקדמות יוקרתי בתחתית הקוביה */}
            {isUploading && uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 backdrop-blur-md">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
              </div>
            )}
          </div>

          {/* קוביית תקציב מקצועית */}
          <div className="bg-[#0f0f0f] border border-emerald-500/20 rounded-[32px] p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2 text-white">
                  <Coins size={22} className="text-emerald-400" /> תקציב DOP
                </h3>
                <p className="text-[10px] text-white/50 font-bold mt-1">קובע את הפוטנציאל הויראלי</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 rounded-[16px] text-emerald-400 font-black text-lg shadow-inner">
                {bounty.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[100, 500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => !isUploading && setBounty(amt)}
                  disabled={isUploading}
                  className={`py-3.5 rounded-[16px] text-sm font-black transition-all active:scale-95 ${bounty === amt ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {amt >= 1000 ? `${amt/1000}k` : amt}
                </button>
              ))}
            </div>
            
            <div className="bg-black/40 rounded-[16px] p-3 text-center border border-white/5">
              <span className="text-[11px] text-white/50 font-bold">יתרה נוכחית: <span className="text-emerald-400">{(currentUser?.dop_coins || 0).toLocaleString()} DOP</span></span>
            </div>
          </div>

          {/* כפתור פרסום לבן ענק */}
          <div className="pt-4">
            <button
              onClick={handlePublish}
              disabled={isUploading || !mediaFile}
              className={`w-full text-black font-black text-xl py-6 rounded-[28px] flex items-center justify-center gap-3 transition-all active:scale-95 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : !mediaFile ? 'bg-white/50 text-black/50 cursor-not-allowed' : 'bg-white shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:bg-gray-200'}`}
            >
              {isUploading ? (
                <>
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                  מקודד נתונים... {uploadProgress}%
                </>
              ) : (
                <>
                  <Zap size={24} className="text-black" /> שגר לאוויר
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
