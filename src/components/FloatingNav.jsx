import React from 'react';
import { Home, ShoppingCart, Zap, Target, User } from 'lucide-react';

export default function FloatingNav({ activeTab, setActiveTab }) {
  // הגדרת פריטי התפריט החדשים לפי הבקשה
  const navItems = [
    { id: 'home', icon: Home, label: 'ראשי' },
    { id: 'market', icon: ShoppingCart, label: 'חנות' },
    { id: 'create', icon: Zap, label: 'שיגור', isCenter: true },
    { id: 'blackhole', icon: Target, label: 'חור שחור' },
    { id: 'profile', icon: User, label: 'פרופיל' }
  ];

  return (
    // הורדתי את התפריט כמעט עד הסוף למטה (bottom-3) והקטנתי את הגובה הכללי
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] z-50" dir="rtl">
      
      {/* מעטפת זכוכית דקה ומינימליסטית יותר */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-1.5 flex items-center justify-between shadow-2xl">
        
        {navItems.map((item) => {
          // זיהוי אקטיבי (תופס גם את market וגם store)
          const isActive = activeTab === item.id || (item.id === 'market' && activeTab === 'store');
          const Icon = item.icon;

          // עיצוב לכפתור האמצעי (ברק) - יושב בפנים, לא פורץ החוצה!
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[18px] flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                <Icon size={22} className="text-black fill-black/20 stroke-[2.5px]" />
              </button>
            );
          }

          // עיצוב לכפתורים הרגילים - מוקטנים ואסתטיים יותר
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-[16px] transition-all duration-300 active:scale-95 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon 
                size={isActive ? 20 : 22} 
                className={`transition-all duration-300 ${isActive ? '-translate-y-2 drop-shadow-md' : ''}`} 
              />
              
              <span 
                className={`absolute bottom-1.5 text-[9px] font-black tracking-wide transition-all duration-300 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
