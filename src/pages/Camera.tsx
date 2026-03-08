import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Zap, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { sounds } from '../utils/sounds';

export default function Camera() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        sounds.playError();
        return toast.error('הקובץ גדול מדי (עד 50MB)');
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      sounds.playTick();
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !profile) return;
    
    setIsUploading(true);
    const toastId = toast.loading('מכין את הדרופ שלך...', { style: { background: 'rgba(255,255,255,0.9)', color: '#000', fontWeight: 800 } });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('dop_media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('dop_media').getPublicUrl(filePath);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: dbError } = await supabase.from('dop_videos').insert([{
        creator_id: user.id,
        video_url: publicUrlData.publicUrl,
        description: description.trim() || 'דרופ חדש',
        expires_at: expiresAt.toISOString(),
        total_boosts: 0
      }]);

      if (dbError) throw dbError;

      sounds.playZap();
      toast.success('הדרופ באוויר!', { id: toastId, style: { background: '#10b981', color: '#fff' } });
      navigate('/');
      
    } catch (error: any) {
      sounds.playError();
      toast.error('שגיאה בהעלאה: ' + error.message, { id: toastId });
      setIsUploading(false);
    }
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <div style={{ background: '#000', height: '100dvh', width: '100vw', position: 'relative', overflow: 'hidden', direction: 'rtl' }}>
      
      {/* כפתור יציאה משותף */}
      <button 
        onClick={() => previewUrl ? setPreviewUrl(null) : navigate(-1)} 
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 50, width: 44, height: 44, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <X size={24} color="#fff" />
      </button>

      {!previewUrl ? (
        // --- מסך המצלמה/בחירת קובץ ---
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{ position: 'absolute', top: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Zap size={48} color="rgba(255,255,255,0.2)" />
            <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: 800, letterSpacing: 2 }}>DOP CAMERA</h2>
          </div>

          {/* כפתורי שליטה בתחתית */}
          <div style={{ position: 'absolute', bottom: 60, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
            
            <input type="file" accept="image/*,video/*" ref={galleryInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <motion.button 
              whileTap={{ scale: 0.9 }} onClick={() => galleryInputRef.current?.click()}
              style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
            >
              <ImageIcon size={24} color="#fff" />
            </motion.button>

            <input type="file" accept="image/*,video/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <motion.button 
              whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}
              style={{ width: 84, height: 84, borderRadius: '50%', background: 'transparent', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 4 }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', boxShadow: '0 0 30px rgba(255,255,255,0.5)' }} />
            </motion.button>
            
            <div style={{ width: 56 }} /> {/* מרווח לאיזון הסימטריה */}
          </div>
        </motion.div>
      ) : (
        // --- מסך העריכה וההעלאה (אחרי בחירת קובץ) ---
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ height: '100%', width: '100%', position: 'relative' }}>
          
          {/* תצוגה מקדימה על כל המסך */}
          <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isVideo ? (
              <video src={previewUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
            )}
          </div>

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)', pointerEvents: 'none' }} />

          {/* קפסולת ההעלאה מזכוכית בתחתית */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 40px', background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: '16px', marginBottom: 20 }}>
              <input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="כתוב תיאור לדרופ..."
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 16, outline: 'none' }}
                maxLength={60}
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={handleUpload}
              disabled={isUploading}
              style={{ 
                width: '100%', background: '#fff', color: '#000', border: 'none', padding: 18, borderRadius: 24, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 18, fontWeight: 900, 
                cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1,
                boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
              }}
            >
              {isUploading ? 'מעלה...' : 'DROP IT'}
              {!isUploading && <UploadCloud size={22} />}
            </motion.button>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 16, fontWeight: 600 }}>
              הדרופ יחיה ל-24 שעות בלבד.
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
