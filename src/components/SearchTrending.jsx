import React, { useState } from 'react';
import { Search as SearchIcon, Flame, Trophy, Medal } from 'lucide-react';

// נתונים מדומים למצעד
const MOCK_TRENDS = [
  { id: 't1', username: 'talyohala', rank: 1, score: '12K', desc: 'הדרופ ששבר את האפליקציה 🚀' },
  { id: 't2', username: 'ninja_israel', rank: 2, score: '8.5K', desc: 'פארקור מטורף על גגות' },
  { id: 't3', username: 'shira_art', rank: 3, score: '5K', desc: 'ציור קיר ב-30 שניות' },
  { id: 't4', username: 'omer_dev', rank: 4, score: '3.2K', desc: 'אתגר תכנות ב-C++' },
  { id: 't5', username: 'dana_vlogs', rank: 5, score: '2.1K', desc: 'מאחורי הקלעים' },
];

const SearchTrending = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // פונקציית עזר לעיצוב המקומות הראשונים
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50', icon: <Trophy size={20} className="text-yellow-400" /> };
      case 2: return { color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/50', icon: <Medal size={20} className="text-gray-300" /> };
      case 3: return { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/50', icon: <Medal size={20} className="text-amber-600" /> };
      default: return { color: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/10', icon: <span className="font-mono text-gray-500 font-bold">#{rank}</span> };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 pt-10">
      
      {/* שורת חיפוש (Glassmorphism) */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon size={20} className="text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search creators, tags..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 outline-none focus:border-white/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* כותרת מצעד הלהיטים */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
        <Flame className="text-orange-500 animate-pulse" size={24} />
        <h2 className="text-xl font-bold tracking-widest">TRENDING DROPS</h2>
      </div>

      {/* רשימת המצעד */}
      <div className="space-y-3">
        {MOCK_TRENDS.map((item) => {
          const style = getRankStyle(item.rank);
          
          return (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-sm border transition-all hover:scale-[1.02] ${style.bg} ${style.border}`}>
              
              <div className="flex items-center gap-4">
                {/* דירוג או אייקון */}
                <div className="w-8 flex justify-center">
                  {style.icon}
                </div>
                
                {/* פרטי היוצר והדרופ */}
                <div>
                  <h3 className={`font-bold ${style.color}`}>@{item.username}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
              </div>

              {/* ניקוד / צפיות / בוסטים */}
              <div className="text-right">
                <span className="font-mono font-bold text-white/90">{item.score}</span>
                <span className="block text-[10px] text-gray-500 uppercase">Boosts</span>
              </div>
              
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SearchTrending;
