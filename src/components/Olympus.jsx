import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { ChevronRight, Trophy, Crown, Medal, Globe, CalendarDays, Star, Coins, User } from 'lucide-react';

export default function Olympus({ onClose, onUserClick, currentUserId }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [globalLeaders, setGlobalLeaders] = useState([]);
  const [weeklyLeaders, setWeeklyLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      // דירוג עולמי - המשתמשים העשירים ביותר (לפי DOP Coins)
      const { data: globalData, error: globalError } = await supabase
        .from('dop_users')
        .select('id, username, dop_coins, avatar_url, has_halo, premium_tier')
        .order('dop_coins', { ascending: false })
        .limit(20);

      if (globalError) throw globalError;

      const formattedGlobal = globalData.map((user, index) => ({
        id: user.id,
        rank: index + 1,
        username: user.username || 'אנונימי',
        score: user.dop_coins || 0,
        avatar: user.avatar_url,
        has_halo: user.has_halo,
        premium_tier: user.premium_tier
      }));

      // דירוג שבועי - כרגע נדרג לפי יוצרים שיש להם הכי הרבה נכסים פעילים
      const { data: dropsData, error: dropsError } = await supabase
        .from('dop_videos')
        .select('user_id');

      if (!dropsError && dropsData) {
        // ספירת נכסים לכל משתמש
        const userDropCounts = dropsData.reduce((acc, drop) => {
          acc[drop.user_id] = (acc[drop.user_id] || 0) + 1;
          return acc;
        }, {});

        // משיכת פרטי המשתמשים המובילים בנכסים
        const sortedUserIds = Object.keys(userDropCounts).sort((a, b) => userDropCounts[b] - userDropCounts[a]).slice(0, 10);
        
        if (sortedUserIds.length > 0) {
          const { data: weeklyUsers } = await supabase
            .from('dop_users')
            .select('id, username, avatar_url, has_halo, premium_tier')
            .in('id', sortedUserIds);
            
          if (weeklyUsers) {
            const formattedWeekly = sortedUserIds.map((id, index) => {
              const user = weeklyUsers.find(u => u.id === id);
              if (!user) return null;
              return {
                id: user.id,
                rank: index + 1,
                username: user.username || 'אנונימי',
                score: userDropCounts[id] * 1000, // נותן ציון מדומה לפי כמות נכסים
                avatar: user.avatar_url,
                has_halo: user.has_halo,
                premium_tier: user.premium_tier
              };
            }).filter(Boolean);
            
            setWeeklyLeaders(formattedWeekly);
          }
        }
      }

      setGlobalLeaders(formattedGlobal);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setLoading(false);
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const floatAnimation = {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  };

  const categories = [
    {
      id: 'global',
      title: 'היכל התהילה',
      desc: 'העשירים ביותר ב-DOP',
      icon: <Globe size={56} />,
      color: 'amber',
      hex: '#f59e0b',
      bg: 'from-amber-900/40 to-[#050505]'
    },
    {
      id: 'weekly',
      title: 'אלופי השבוע',
      desc: 'כוכבי הנכסים',
      icon: <CalendarDays size={56} />,
      color: 'emerald',
      hex: '#10b981',
      bg: 'from-emerald-900/40 to-[#050505]'
    }
  ];

  const getLeaderIcon = (rank) => {
    if (rank === 1) return <Crown size={56} className="text-amber-300" />;
    if (rank === 2) return <Medal size={40} className="text-zinc-200" />;
    if (rank === 3) return <Medal size={40} className="text-orange-300" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-amber-300/90 to-amber-600/90';
    if (rank === 2) return 'from-zinc-300/80 to-zinc-600/80';
    if (rank === 3) return 'from-orange-400/80 to-orange-700/80';
    return 'from-gray-700/50 to-gray-900/50';
  };

  const getRankBorder = (rank) => {
    if (rank === 1) return 'border-amber-400';
    if (rank === 2) return 'border-zinc-300';
    if (rank === 3) return 'border-orange-400';
    return 'border-white/10';
  };

  const topThree = (leaders) => leaders.slice(0, 3);
  const restLeaders = (leaders) => leaders.slice(3);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#030303] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-[#030303] text-white overflow-y-auto" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#291c0a_0%,#030303_70%)] opacity-60 pointer-events-none"></div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-8 flex justify-between items-center shadow-lg sticky top-2 z-20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <Trophy size={28} className="text-amber-500" />
              </motion.div>
              <h1 className="text-2xl font-black text-white">האולימפוס</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.title : 'פסגת היוצרים העולמית'}
            </p>
          </div>
          <button
            onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-[20px] transition-colors active:scale-95"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {!selectedCategory && (
              <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <motion.div
                    key={cat.id}
                    variants={boxVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`bg-gradient-to-br ${cat.bg} border border-${cat.color}-500/40 rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer relative overflow-hidden aspect-square justify-center`}
                    style={{ boxShadow: `0 10px 30px ${cat.hex}15` }}
                  >
                    <motion.div animate={floatAnimation} className={`text-${cat.color}-400 mb-5 drop-shadow-[0_0_15px_${cat.hex}80] z-10`}>
                      {cat.icon}
                    </motion.div>
                    <h3 className="text-xl font-black text-white z-10 mb-1">{cat.title}</h3>
                    <p className={`text-[10px] text-${cat.color}-200/60 font-bold z-10 leading-tight`}>{cat.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedCategory === 'global' && (
              <motion.div key="global" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-end justify-center gap-3 pt-12 pb-4">
                  {topThree(globalLeaders).map((leader, idx) => {
                    const order = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                    return (
                      <motion.div key={leader.id} variants={boxVariants} className={`relative flex flex-col items-center w-[30%] ${order === 1 ? 'z-20' : 'z-10'}`} onClick={() => onUserClick?.(leader.id)}>
                        <motion.div animate={order === 1 ? floatAnimation : {}} className={`absolute -top-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] ${order === 1 ? '-top-16 z-30' : ''}`}>
                          {getLeaderIcon(leader.rank)}
                        </motion.div>
                        <div className={`w-full bg-gradient-to-t ${getRankColor(leader.rank)} border-t-2 ${getRankBorder(leader.rank)} rounded-t-[24px] rounded-b-[16px] p-1 flex flex-col items-center justify-end shadow-2xl ${order === 1 ? 'h-44' : 'h-32'}`}>
                          <div className="bg-[#0a0a0a] w-full h-full rounded-t-[20px] rounded-b-[12px] flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-[#111] transition-colors">
                            {leader.avatar ? <img src={leader.avatar} className="w-8 h-8 rounded-full mb-1 object-cover" /> : <User size={16} className="mb-1 text-white/40" />}
                            <span className="text-sm font-black w-full mb-1 text-white/90 truncate">{leader.username}</span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                              <Coins size={10} />
                              {leader.score > 1000 ? (leader.score / 1000).toFixed(1) + 'k' : leader.score}
                            </span>
                            {leader.has_halo && <Star size={8} className="text-blue-400 mt-1" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {restLeaders(globalLeaders).map(user => (
                    <motion.div key={user.id} variants={boxVariants} onClick={() => onUserClick?.(user.id)} className="bg-[#0f0f0f] border border-white/10 hover:border-white/20 transition-colors rounded-[24px] p-4 flex items-center justify-between shadow-lg cursor-pointer">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-white/20 w-6 text-center">{user.rank}</span>
                        <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 overflow-hidden">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                        </div>
                        <div className="max-w-[120px]">
                          <h3 className="font-bold text-sm text-white flex items-center gap-1 truncate">
                            {user.username}
                            {user.has_halo && <Star size={10} className="text-blue-400 flex-shrink-0" />}
                          </h3>
                          <p className="text-[10px] text-white/40">{user.premium_tier === 'pro' ? 'יוצר עלית' : 'יוצר'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-[14px] border border-emerald-500/20 shrink-0">
                        <Coins size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-black text-sm">{user.score.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedCategory === 'weekly' && (
              <motion.div key="weekly" variants={gridVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-end justify-center gap-3 pt-12 pb-4">
                  {topThree(weeklyLeaders).map((leader, idx) => {
                    const order = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                    return (
                      <motion.div key={leader.id} variants={boxVariants} className={`relative flex flex-col items-center w-[30%] ${order === 1 ? 'z-20' : 'z-10'}`} onClick={() => onUserClick?.(leader.id)}>
                        <motion.div animate={order === 1 ? floatAnimation : {}} className={`absolute -top-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] ${order === 1 ? '-top-16 z-30' : ''}`}>
                          {getLeaderIcon(leader.rank)}
                        </motion.div>
                        <div className={`w-full bg-gradient-to-t ${getRankColor(leader.rank)} border-t-2 ${getRankBorder(leader.rank)} rounded-t-[24px] rounded-b-[16px] p-1 flex flex-col items-center justify-end shadow-2xl ${order === 1 ? 'h-44' : 'h-32'}`}>
                          <div className="bg-[#0a0a0a] w-full h-full rounded-t-[20px] rounded-b-[12px] flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-[#111] transition-colors">
                            {leader.avatar ? <img src={leader.avatar} className="w-8 h-8 rounded-full mb-1 object-cover" /> : <User size={16} className="mb-1 text-white/40" />}
                            <span className="text-sm font-black w-full mb-1 text-white/90 truncate">{leader.username}</span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                              <Coins size={10} />
                              {leader.score > 1000 ? (leader.score / 1000).toFixed(1) + 'k' : leader.score}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {restLeaders(weeklyLeaders).map(user => (
                    <motion.div key={user.id} variants={boxVariants} onClick={() => onUserClick?.(user.id)} className="bg-[#0f0f0f] border border-white/10 hover:border-white/20 transition-colors rounded-[24px] p-4 flex items-center justify-between shadow-lg cursor-pointer">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-white/20 w-6 text-center">{user.rank}</span>
                        <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 overflow-hidden">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                        </div>
                        <div className="max-w-[120px]">
                          <h3 className="font-bold text-sm text-white truncate">{user.username}</h3>
                          <p className="text-[10px] text-white/40">כוכב עולה</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-[14px] border border-emerald-500/20 shrink-0">
                        <Coins size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-black text-sm">{user.score.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
