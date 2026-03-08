import React from 'react';
import { motion } from 'framer-motion';
import { FaGem, FaCertificate, FaCrown, FaPlay, FaHeartbeat } from 'react-icons/fa';

export default function UserProfile({ user, drops }) {
  if (!user) return <div className="p-8 text-center text-emerald-500 font-bold min-h-screen bg-[#050505]">טוען פרופיל...</div>;

  // בדיקת סטטוס פרימיום וצבע אישי ממסד הנתונים
  const isVIP = user.premium_tier && user.premium_tier !== 'free';
  const pulseColor = user.custom_pulse_color || '#10b981'; // ברירת מחדל: ירוק מנטה

  return (
    <motion.div 
      className="min-h-[100dvh] bg-[#050505] text-white pb-24 font-sans" 
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* אזור העליון - קאבר ואווטאר */}
      <div className="relative h-40 bg-gradient-to-b from-white/5 to-[#050505] flex items-end justify-center pb-6 border-b border-white/5">
        <div 
          className="absolute -bottom-12 w-28 h-28 rounded-full border-4 border-[#050505] flex items-center justify-center text-4xl font-black bg-[#111] shadow-2xl transition-all duration-500"
          style={{ 
            boxShadow: `0 0 25px ${pulseColor}40`, // זוהר בצבע האישי
            borderColor: pulseColor // מסגרת ניאון
          }}
        >
          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      <div className="mt-16 px-4 text-center">
        {/* שם משתמש ותגים */}
        <h1 className="text-2xl font-black flex items-center justify-center gap-2">
          {user.username || 'משתמש אנונימי'}
          {isVIP && <FaCrown className="text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" title="VIP Syndicate" />}
          {user.has_halo && <FaCertificate className="text-emerald-400 text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Verified" />}
        </h1>
        <p className="text-white/40 text-sm mt-1">{user.email || 'משתמש מסתור'}</p>

        {/* יתרות וארנק */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[120px] flex flex-col items-center backdrop-blur-sm">
            <span className="text-3xl font-black text-emerald-400">{user.dop_coins?.toFixed(0) || 0}</span>
            <span className="text-[10px] text-white/50 mt-1 font-bold tracking-widest uppercase">מטבעות DOP</span>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/30 to-black border border-emerald-500/30 rounded-2xl p-4 min-w-[120px] flex flex-col items-center backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black text-emerald-300">{user.mint_gems || 0}</span>
              <FaGem className="text-emerald-400 text-sm drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
            </div>
            <span className="text-[10px] text-emerald-200/50 mt-1 font-bold tracking-widest uppercase">יהלומי מנטה</span>
          </div>
        </div>

        {/* סטטיסטיקות מתחת לארנק */}
        <div className="flex justify-center gap-12 mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">{drops?.length || 0}</span>
            <span className="text-xs text-white/40 mt-1">דרופים חיים</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">{user.followers_count || 0}</span>
            <span className="text-xs text-white/40 mt-1">עוקבים</span>
          </div>
        </div>

        {/* גריד הדרופים המעוצב */}
        <div className="mt-10 text-right">
          <h2 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
            <FaPlay className="text-emerald-500 text-xs" /> הגלריה שלי
          </h2>
          
          {drops && drops.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
              {drops.map(drop => (
                <div key={drop.id} className="aspect-[9/16] bg-white/5 relative overflow-hidden group border border-white/5">
                  {drop.video_url ? (
                    <video 
                      src={drop.video_url} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105" 
                      muted loop playsInline 
                      onMouseEnter={(e) => e.target.play()} 
                      onMouseLeave={(e) => e.target.pause()} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-500/20">
                      <FaHeartbeat className="text-3xl" />
                    </div>
                  )}
                  {/* קופת הדרופ על הסרטון */}
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10">
                    <FaHeartbeat className="text-emerald-500 text-[10px]" /> 
                    <span className="text-white">{drop.bounty_pool?.toFixed(0) || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/30 py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed flex flex-col items-center">
               <FaHeartbeat className="text-4xl mb-3 opacity-20" />
              <p className="text-sm font-bold">אין לך דרופים פעילים</p>
              <p className="text-xs mt-1">הגיע הזמן להעלות משהו חדש לזירה.</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
