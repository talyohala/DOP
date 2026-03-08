import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Gem, ArrowLeft, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const SLIDES = [
  { icon: Zap, title: 'DOP - Drop It', desc: 'הדרופים חיים 24 שעות בלבד. אם לא יצילו אותם, הם יתפוצצו ויעלמו לנצח.' },
  { icon: Clock, title: 'הזמן הוא הכל', desc: 'הרווח דקות על ידי פעילות ושתף אותן עם יוצרים שאתה אוהב כדי להשאיר אותם בחיים.' },
  { icon: Gem, title: 'השוק השחור', desc: 'אסוף מטבעות DOP, פתח קופסאות הפתעה וקנה קופונים ופרסים אמיתיים.' }
];

export default function Auth() {
  const [step, setStep] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('ברוך שובך!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('החשבון נוצר בהצלחה! מתחבר...');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#000', height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', direction: 'rtl' }}>
      
      {/* רקע פרימיום מונפש */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <AnimatePresence mode="wait">
        {step < 3 ? (
          // מסכי הסבר (Onboarding)
          <motion.div 
            key={`slide-${step}`}
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 40, zIndex: 10 }}
          >
            {React.createElement(SLIDES[step].icon, { size: 80, color: '#fff', style: { marginBottom: 30, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' } })}
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, marginBottom: 16 }}>{SLIDES[step].title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, lineHeight: 1.5, marginBottom: 40 }}>{SLIDES[step].desc}</p>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? '#fff' : 'rgba(255,255,255,0.2)', transition: '0.3s' }} />
              ))}
            </div>

            <button onClick={() => setStep(step + 1)} style={{ background: '#fff', color: '#000', padding: '16px 40px', borderRadius: 30, fontSize: 18, fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}>
              {step === 2 ? 'התחל עכשיו' : 'המשך'} <ArrowLeft size={20} />
            </button>
          </motion.div>
        ) : (
          // טופס התחברות (Auth Form)
          <motion.div 
            key="auth-form"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 360, padding: 24, zIndex: 10 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <Zap size={48} color="#fff" style={{ marginBottom: 16 }} />
              <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>{isLogin ? 'ברוך שובך' : 'צור חשבון'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>היכנס כדי להתחיל להציל דרופים</p>
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" required placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 48px 16px 16px', borderRadius: 20, fontSize: 16, outline: 'none' }} />
              </div>
              
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="password" required placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 48px 16px 16px', borderRadius: 20, fontSize: 16, outline: 'none' }} />
              </div>

              <button disabled={loading} style={{ background: '#fff', color: '#000', padding: 18, borderRadius: 20, fontSize: 16, fontWeight: 900, border: 'none', marginTop: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'טוען...' : (isLogin ? 'התחבר' : 'הירשם')}
              </button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', marginTop: 24, fontSize: 14, cursor: 'pointer' }}>
              {isLogin ? 'אין לך חשבון? צור עכשיו' : 'כבר יש לך חשבון? התחבר'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
