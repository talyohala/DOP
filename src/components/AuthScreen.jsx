import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, ArrowLeft, AlertCircle, Fingerprint } from 'lucide-react';

const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // פונקציה שמוודאת שיש למשתמש פרופיל בטבלה שלנו
  const ensureProfileExists = async (user, chosenUsername) => {
    const defaultName = chosenUsername || email.split('@')[0].toLowerCase();
    
    // נשתמש ב-upsert: אם קיים - יעדכן, אם לא - יצור. זה מונע שגיאות "כבר קיים"
    const { error: upsertError } = await supabase
      .from('dop_users')
      .upsert({ 
        id: user.id, 
        username: defaultName,
        dop_coins: 100.0 // מענק הצטרפות
      }, { onConflict: 'id' });

    if (upsertError) throw new Error("לא הצלחנו ליצור פרופיל: " + upsertError.message);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);
    
    try {
      if (isLogin) {
        // התחברות
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        
        // גם בכניסה - מוודאים שהפרופיל קיים (למקרה שההרשמה נכשלה בעבר)
        await ensureProfileExists(data.user);
        onLoginSuccess();
      } else {
        // הרשמה
        const { data, error: signupError } = await supabase.auth.signUp({
          email, password, options: { data: { username } }
        });
        if (signupError) throw signupError;
        
        if (data.user) {
          await ensureProfileExists(data.user, username);
        }
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
          <h1 className="text-6xl font-black text-white tracking-[0.2em] relative z-10">DOP</h1>
        </div>

        {error && (
          <div className="mb-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in zoom-in duration-300">
            <AlertCircle size={18} />
            <p className="font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full space-y-4 flex flex-col items-center">
          {!isLogin && (
            <div className="relative w-full group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500 font-bold group-focus-within:text-white transition-colors">@</div>
              <input type="text" placeholder="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all" />
            </div>
          )}

          <div className="relative w-full">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500"><Mail size={20} /></div>
            <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all" />
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500"><Lock size={20} /></div>
            <input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all" />
          </div>

          <div className="pt-10">
            <button type="submit" disabled={loading} className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] disabled:opacity-30">
              {loading ? <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div> : <ArrowLeft size={32} className="text-black" />}
            </button>
          </div>
        </form>

        <div className="mt-16 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-gray-500 text-sm font-bold hover:text-white transition-all tracking-wide">
            {isLogin ? "ליצירת חשבון חדש" : "כבר יש לך חשבון? התחברות"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
