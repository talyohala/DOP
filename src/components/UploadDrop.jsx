import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { ChevronRight, UploadCloud, Video, Coins, Image as ImageIcon, X } from 'lucide-react';

export default function UploadDrop({ onClose, onUploadComplete, currentUser }) {
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
    if (!currentUser) return toast.error("שגיאת משתמש");
    if ((currentUser.dop_coins || 0) < bounty) return toast.error("אין לך מספיק DOP לקופה הזו");

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. העלאת הקובץ ל-Supabase Storage (תיקיית dop_videos)
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('dop_videos')
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;
      setUploadProgress(50);

      // 2. קבלת הלינק הציבורי
      const { data: { publicUrl } } = supabase.storage
        .from('dop_videos')
        .getPublicUrl(fileName);

      setUploadProgress(70);

      // 3. יצירת הדרופ בדאטהבייס - תיקון הכותרת כאן!
      const { error: videoError } = await supabase
        .from('dop_videos')
        .insert({
          user_id: currentUser.id,
          video_url: publicUrl, 
          title: title.trim() || null, // אם אין כותרת, יישמר כ-null ולא כ-"נכס חדש"
          description: description.trim() || null,
          bounty_pool: bounty,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (videoError) throw videoError;

      // 4. עדכון יתרת המטבעות
      await supabase.from('dop_users')
        .update({ dop_coins: currentUser.dop_coins - bounty })
        .eq('id', currentUser.id);

      setUploadProgress(100);
      toast.success("העלאה הושלמה בהצלחה!", { icon: '🚀' });
      if(onUploadComplete) onUploadComplete();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error("שגיאה בתהליך ההעלאה");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] text-white overflow-y-auto font-sans" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6">

        {/* כותרת הסטודיו */}
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

          {/* אזור העלאת קובץ ותצוגה מקדימה */}
          <div 
            className={`w-full aspect-square rounded-[32px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all shadow-xl ${mediaPreview ? 'bg-[#0a0a0a] border border-white/10' : 'bg-[#0a0a0a] border-2 border-dashed border-white/20'}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {mediaPreview ? (
              <div className="relative w-full h-full group">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-5">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                      {mediaType === 'image' ? <ImageIcon size={16} className="text-emerald-400" /> : <Video size={16} className="text-blue-400" />}
                      <span className="text-xs font-black">{mediaType === 'image' ? 'תמונה' : 'סרטון'}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setMediaFile(null); setMediaPreview(null); }} disabled={isUploading} className="bg-red-500/20 text-red-400 p-3 rounded-full hover:bg-red-500 transition-colors"><X size={18} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-60">
                <div className="w-24 h-24 bg-white/5 rounded-[28px] flex items-center justify-center mb-5 border border-white/10"><UploadCloud size={48} className="text-white" /></div>
                <h3 className="font-black text-xl text-white">לחץ להעלאת נכס</h3>
              </div>
            )}
            {isUploading && uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
              </div>
            )}
          </div>

          {/* פרטי הדרופ */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 shadow-lg space-y-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת (אופציונלי)" className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3 px-4 text-sm text-white outline-none focus:border-emerald-500/50" disabled={isUploading}/>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור (אופציונלי)" rows={2} className="w-full bg-[#050505] border border-white/10 rounded-[16px] py-3 px-4 text-sm text-white outline-none focus:border-emerald-500/50 resize-none" disabled={isUploading}/>
          </div>

          {/* הגדרת תקציב DOP */}
          <div className="bg-[#0f0f0f] border border-emerald-500/20 rounded-[32px] p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg flex items-center gap-2 text-white"><Coins size={22} className="text-emerald-400" /> תקציב DOP</h3>
              <div className="bg-emerald-500/10 px-5 py-2.5 rounded-[16px] text-emerald-400 font-black">{bounty.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map(amt => (
                <button key={amt} onClick={() => !isUploading && setBounty(amt)} disabled={isUploading} className={`py-3.5 rounded-[16px] text-sm font-black transition-all active:scale-95 ${bounty === amt ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                  {amt >= 1000 ? `${amt/1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* כפתור העלאה */}
          <button 
            onClick={handlePublish} 
            disabled={isUploading || !mediaFile} 
            className={`w-full text-black font-black text-xl py-6 rounded-[28px] flex items-center justify-center gap-3 transition-all active:scale-95 ${isUploading ? 'bg-gray-400' : !mediaFile ? 'bg-white/50 cursor-not-allowed' : 'bg-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]'}`}
          >
            {isUploading ? `מעלה... ${uploadProgress}%` : <><UploadCloud size={24} /> העלאה</>}
          </button>
        </div>
      </div>
    </div>
  );
}
