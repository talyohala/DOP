import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return toast.error('בחר קובץ');
    if (!desc.trim()) return toast.error('כתוב תיאור קצר...');
    setIsUploading(true);
    try {
      const filePath = `${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('dop_drops').upload(filePath, file);
      const { data } = supabase.storage.from('dop_drops').getPublicUrl(filePath);
      await supabase.from('dop_videos').insert([{ creator_id: user.id, video_url: data.publicUrl, description: desc }]);
      toast.success('הדרופ שוגר בהצלחה! 🚀');
      navigate('/');
    } catch {
      toast.error('שגיאה בהעלאה');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '60px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-main)' }}>
      
      {/* הדר מינימליסטי */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <button onClick={() => navigate(-1)} className="glass-button" style={{ width: 44, height: 44, background: 'transparent' }}><X size={20} /></button>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>שיגור דרופ</h2>
        <div style={{ width: 44 }} /> {/* מאזן למרכוז הכותרת */}
      </div>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.label 
            key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-panel" 
            style={{ width: '100%', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'pointer', borderStyle: 'dashed', borderRadius: 32, marginBottom: 40, background: 'rgba(255,255,255,0.02)' }}
          >
            <ImageIcon size={48} color="var(--text-muted)" opacity={0.3} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>לחץ לבחירת תמונה באיכות מלאה</span>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
          </motion.label>
        ) : (
          <motion.div 
            key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-panel" 
            style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 32, overflow: 'hidden', marginBottom: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* כפתור X לביטול בחירה */}
            {!isUploading && (
              <button onClick={() => { setFile(null); setPreview(null); }} className="glass-button" style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, zIndex: 10, background: 'rgba(0,0,0,0.6)' }}>
                <X size={20} />
              </button>
            )}
            
            {/* אנימציית לייזר בזמן העלאה! */}
            <AnimatePresence>
              {isUploading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5, overflow: 'hidden' }}
                >
                  {/* קו הלייזר הסורק */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ position: 'absolute', left: 0, right: 0, height: 3, background: '#fff', boxShadow: '0 0 15px 4px var(--color-primary), 0 0 30px 8px var(--color-primary)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.span 
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ color: '#fff', fontWeight: 900, fontSize: 18, textShadow: '0 4px 15px rgba(0,0,0,1)' }}
                    >
                      משגר דרופ לחלל...
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <img 
              src={preview} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} 
              alt="Preview" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* אזור התיאור והכפתור */}
      <div className="glass-panel" style={{ width: '100%', padding: '16px 20px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
        <input 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleUpload()}
          placeholder="כתוב משהו מטורף..." 
          disabled={isUploading}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 16, outline: 'none', padding: 0, opacity: isUploading ? 0.5 : 1 }} 
        />
        
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={handleUpload} 
          disabled={isUploading || !preview} 
          style={{ 
            width: 52, height: 52, borderRadius: '50%', 
            background: isUploading || !preview ? 'rgba(255,255,255,0.1)' : '#fff', 
            color: isUploading || !preview ? 'rgba(255,255,255,0.3)' : '#000', 
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', boxShadow: isUploading ? 'none' : '0 4px 15px rgba(255,255,255,0.3)' 
          }}
        >
          {isUploading ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : <Activity size={24} strokeWidth={2.5} />}
        </motion.button>
      </div>
      
    </div>
  );
}
