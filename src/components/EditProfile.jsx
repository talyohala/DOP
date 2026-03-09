import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { X, Camera, Loader2, Check } from 'lucide-react';

export default function EditProfile({ user, onClose, onUpdateUser }) {
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // העלאה לבאקט avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('התמונה הועלתה בהצלחה!');
    } catch (error) {
      toast.error('שגיאה בהעלאה. ודא שיצרת באקט avatars ב-Supabase.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) return toast.error('שם משתמש לא יכול להיות ריק');
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('dop_users')
        .update({ username, avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('הפרופיל עודכן בהצלחה!', { style: { background: '#10b981', color: '#fff' } });
      if (onUpdateUser) onUpdateUser(data);
    } catch (error) {
      toast.error('שגיאה בשמירת הפרופיל');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#030303] text-white flex flex-col font-sans" dir="rtl">
      <div className="bg-[#0a0a0a] border-b border-white/10 p-5 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-black text-emerald-400">עריכת פרופיל</h1>
        <button onClick={onClose} className="bg-white/10 p-3 rounded-[16px] active:scale-95">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="relative mb-8 mt-4">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500 overflow-hidden bg-black flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            {uploading ? (
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-emerald-500/50">@</span>
            )}
            
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={32} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <label className="absolute -bottom-2 -right-2 bg-emerald-600 p-3 rounded-full shadow-lg border-2 border-[#030303] cursor-pointer active:scale-95 transition-transform">
            <Camera size={18} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">שם משתמש</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full mt-8 bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={24} /> : <><Check size={24} /> שמור שינויים</>}
          </button>
        </div>
      </div>
    </div>
  );
}
