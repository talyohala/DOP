import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { ChevronRight, UploadCloud, Video, Coins, Image as ImageIcon, X, Loader2 } from 'lucide-react';

export default function UploadDrop({ onClose, onUploadComplete, currentUser, onUpdateUser }) {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bounty, setBounty] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      return toast.error('הקובץ גדול מדי. מקסימום 50MB');
    }

    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!mediaFile) return toast.error("חובה לבחור נכס תוכן");
    if (!currentUser) return toast.error("שגיאת משתמש, אנא התחבר מחדש");
    if ((currentUser.dop_coins || 0) < bounty) return toast.error(`אין לך מספיק DOP לקופה הזו. יתרה נוכחית: ${currentUser.dop_coins || 0}`);

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. העלאת הקובץ ל-Supabase Storage (תיקיית dop_videos)
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('dop_videos')
        .upload(fileName, mediaFile, {
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // 2. קבלת הלינק הציבורי
      const { data: { publicUrl } } = supabase.storage
        .from('dop_videos')
        .getPublicUrl(fileName);

      setUploadProgress(80);

      // 3. יצירת הדרופ בדאטהבייס
      // הגדרת זמן תפוגה התחלתי - נניח 24 שעות קדימה, פלוס קצת בונוס על הבאונטי (למשל כל 100 דופ נותן שעה)
      const extraHours = Math.floor(bounty / 100);
      const expiresAt = new Date(Date.now() + (24 + extraHours) * 60 * 60 * 1000).toISOString();

      const { error: videoError } = await supabase
        .from('dop_videos')
        .insert({
          user_id: currentUser.id,
          video_url: publicUrl,
          title: title.trim() || null,
          description: description.trim() || null,
          bounty_pool: bounty,
          expires_at: expiresAt,
          likes_count: 0,
          comments_count: 0
        });

      if (videoError) throw videoError;

      setUploadProgress(95);

      // 4. עדכון יתרת המטבעות של המשתמש (הורדת הבאונטי)
      const newBalance = currentUser.dop_coins - bounty;
      const { error: userError } = await supabase
        .from('dop_users')
        .update({ dop_coins: newBalance })
        .eq('id', currentUser.id);
        
      if (userError) throw userError;

      // עדכון הסטייט המקומי באפליקציה כדי שהיתרה תשתקף מיד
      if(onUpdateUser) {
          onUpdateUser({ ...currentUser, dop_coins: newBalance });
      }

      setUploadProgress(100);
      toast.success("הנכס שוגר לאלגוריתם בהצלחה!", { icon: '🚀', style: { background: '#111', color: '#10b981' } });
      
      if (onUploadComplete) onUploadComplete();
      
      // סגירה חלקה אחרי חצי שניה כדי לראות 100%
      setTimeout(() => {
          onClose();
      }, 500);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "שגיאה בתהליך ההעלאה");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (e) => {
      e.stopPropagation();
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // איפוס האינפוט
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] text-white overflow-y-auto font-sans animate-in slide-in-from-bottom-full duration-300" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">
        
        {/* רקע עדין */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#064e3b_0%,#030303_60%)] opacity-20 pointer-events-none"></div>

        {/* כותרת הסטודיו */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-emerald-500/10 p-2 rounded-xl">
                  <UploadCloud size={24} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white">סטודיו שיגור</h1>
            </div>
            <p className="text-white/50 text-xs font-bold pl-2">הכן את נכס התוכן שלך לרשת</p>
          </div>
          <button onClick={onClose} disabled={isUploading} className="bg-white/10 p-4 rounded-[20px] active:scale-95 transition-transform disabled:opacity-50">
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <input type="file" accept="video/*,image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />

          {/* אזור העלאת קובץ ותצוגה מקדימה */}
          <div
            className={`w-full aspect-square rounded-[32px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all shadow-xl group ${mediaPreview ? 'bg-[#0a0a0a] border border-white/10' : 'bg-[#0a0a0a] border-2 border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-[#111]'}`}
            onClick={() => !isUploading && !mediaPreview && fileInputRef.current?.click()}
          >
            {mediaPreview ? (
              <div className="relative w-full h-full">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-5 opacity-100 transition-opacity">
                    <div className="flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                            {mediaType === 'image' ? <ImageIcon size={16} className="text-emerald-400" /> : <Video size={16} className="text-blue-400" />}
                            <span className="text-xs font-black">{mediaType === 'image' ? 'תמונה' : 'סרטון'}</span>
                        </div>
                        <button onClick={removeMedia} disabled={isUploading} className="bg-red-500/20 text-red-400 p-3 rounded-full hover:bg-red-500/40 border border-red-500/30 transition-colors shadow-lg backdrop-blur-md">
                            <X size={18} />
                        </button>
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-24 h-24 bg-white/5 rounded-[28px] flex items-center justify-center mb-5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400">
                    <UploadCloud size={48} />
                </div>
                <h3 className="font-black text-xl text-white">לחץ להעלאת נכס</h3>
                <p className="text-[10px] text-white/50 mt-2">תומך בתמונות ווידאו קצר (עד 50MB)</p>
              </div>
            )}

            {isUploading && uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/80 backdrop-blur-md">
                <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] relative" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}>
                    <div className="absolute -top-6 right-0 text-[10px] font-black text-emerald-400 bg-black/80 px-2 py-0.5 rounded-full">{uploadProgress}%</div>
                </div>
              </div>
            )}
          </div>

          {/* פרטי הדרופ */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 shadow-lg space-y-4">
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="כותרת מושכת (אופציונלי)" 
                className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-4 px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-colors shadow-inner" 
                disabled={isUploading}
            />
            <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="ספר לקהילה על הנכס שלך..." 
                rows={3} 
                className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-4 px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 resize-none transition-colors shadow-inner" 
                disabled={isUploading}
            />
          </div>

          {/* הגדרת תקציב DOP */}
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-emerald-500/20 rounded-[32px] p-6 shadow-lg relative overflow-hidden">
             {/* אפקט הילה פנימי */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                  <h3 className="font-black text-lg flex items-center gap-2 text-white"><Coins size={22} className="text-emerald-400" /> תקציב דחיפה</h3>
                  <p className="text-[10px] text-white/50 font-bold mt-1">DOP גבוה = יותר שעות באוויר</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-[16px] text-emerald-400 font-black shadow-inner">
                  {bounty.toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 relative z-10">
              {[100, 500, 1000, 5000].map(amt => (
                <button 
                    key={amt} 
                    onClick={() => !isUploading && setBounty(amt)} 
                    disabled={isUploading} 
                    className={`py-3.5 rounded-[16px] text-sm font-black transition-all active:scale-95 ${bounty === amt ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 border border-white/5 text-white/70 hover:bg-white/10'}`}
                >
                  {amt >= 1000 ? `${amt/1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* כפתור העלאה */}
          <button
            onClick={handlePublish}
            disabled={isUploading || !mediaFile}
            className={`w-full font-black text-lg py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 mt-4 ${isUploading ? 'bg-[#1a1a1a] text-emerald-500 border border-emerald-500/50' : !mediaFile ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]'}`}
          >
            {isUploading ? (
                <><Loader2 size={24} className="animate-spin" /> משגר... {uploadProgress}%</>
            ) : (
                <><UploadCloud size={24} /> שיגור לאלגוריתם</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
