import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeartbeat, FaBomb, FaMagnet, FaBoxOpen, FaCrown, FaGem, FaShieldAlt, 
  FaLock, FaCertificate, FaPalette, FaUserCircle, FaSpider, FaRocket, 
  FaMeteor, FaDna, FaMask, FaFingerprint, FaChevronLeft, FaCoins, 
  FaShoppingBag, FaHatWizard, FaRobot, FaGhost, FaClone, FaTint, 
  FaCheckCircle, FaHourglassHalf, FaCodeBranch, FaApple, FaCreditCard
} from 'react-icons/fa';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function BlackMarket({ onClose }) {
  const [activeTab, setActiveTab] = useState('upgrades');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState(null);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  };
  
  const cardVariants = { 
    hidden: { opacity: 0, y: 20, scale: 0.9 }, 
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } 
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('dop_users').select('*').eq('id', user.id).single();
        setCurrentUser(data);
      }
    };
    fetchUser();
  }, []);

  const handleVirtualPurchase = async (item, type) => {
    if (!currentUser || loading) return;
    
    const balanceField = type === 'coins' ? 'dop_coins' : 'mint_gems';
    const cost = type === 'coins' ? item.price : item.priceGems;
    const currentBalance = currentUser[balanceField] || 0;

    if (currentBalance < cost) {
      return toast.error(`אין מספיק ${type === 'coins' ? 'מטבעות' : 'יהלומים'}`, { 
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', border: `1px solid ${type === 'coins' ? '#ef4444' : '#3b82f6'}` } 
      });
    }
    
    setLoading(true);
    try {
      const newBalance = currentBalance - cost;
      await supabase.from('dop_users').update({ [balanceField]: newBalance }).eq('id', currentUser.id);
      setCurrentUser({ ...currentUser, [balanceField]: newBalance });
      triggerSuccess(item.name);
    } catch (error) {
      toast.error("שגיאת רשת, נסה שוב", { style: { background: '#111', color: '#fff' } });
    }
    setLoading(false);
  };

  const handleRealMoneyPurchase = async () => {
    if (!paymentGateway || !currentUser || loading) return;
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      let updates = {};
      if (paymentGateway.type === 'gems') {
        const currentGems = currentUser.mint_gems || 0;
        updates.mint_gems = currentGems + paymentGateway.reward;
      } else if (paymentGateway.type === 'pro') {
        updates.premium_tier = 'pro';
      }

      await supabase.from('dop_users').update(updates).eq('id', currentUser.id);
      setCurrentUser({ ...currentUser, ...updates });
      
      setPaymentGateway(null);
      triggerSuccess(paymentGateway.name);
    } catch (error) {
      toast.error("הסליקה נכשלה", { style: { background: '#111', color: '#ef4444' } });
    }
    setLoading(false);
  };

  const triggerSuccess = (itemName) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    toast.success(`נרכש בהצלחה: ${itemName}`, { style: { background: '#1a1a1a', color: '#10b981', borderRadius: '16px', border: '1px solid #10b981' } });
  };

  const upgrades = [
    { id: 'defib', name: 'החייאת פיד', icon: <FaHeartbeat className="text-rose-500" />, desc: 'מעיר סרטון שדעך.', price: 1200, rarity: 'common', effect: 'חשיפה', anim: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1 } } },
    { id: 'magnet', name: 'מגנט אלגוריתם', icon: <FaMagnet className="text-cyan-400" />, desc: 'מושך קהל חדש אליך.', price: 1800, rarity: 'rare', effect: 'קהל', anim: { y: [0, -8, 0], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'rocket', name: 'בוסט רקטה', icon: <FaRocket className="text-orange-500" />, desc: 'טיפוס מהיר בטרנדינג.', price: 2500, rarity: 'rare', effect: 'טורבו', anim: { x: [-2, 2, -2], y: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.1 } } },
    { id: 'robot', name: 'צבא בוטים', icon: <FaRobot className="text-emerald-400" />, desc: 'מזריק לייקים וצפיות פיקטיביות.', price: 3500, rarity: 'epic', effect: 'זיוף', anim: { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 3 } } },
    { id: 'spider', name: 'מלכודת עכביש', icon: <FaSpider className="text-purple-500" />, desc: 'עוקץ גנבים - מאבדים 30%.', price: 2800, rarity: 'rare', effect: 'הגנה', anim: { scale: [1, 1.1, 1], rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 4 } } },
    { id: 'shield', name: 'מגן קוונטי', icon: <FaShieldAlt className="text-blue-500" />, desc: 'חסינות שודדים ל-48 שעות.', price: 2000, rarity: 'common', effect: 'חסינות', anim: { opacity: [0.7, 1, 0.7], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'ghost', name: 'מצב רפאים', icon: <FaGhost className="text-gray-300" />, desc: 'אנונימיות מוחלטת.', price: 4000, rarity: 'epic', effect: 'הצללה', anim: { y: [0, -10, 0], opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 3 } } },
    { id: 'vampire', name: 'שאיבת דם', icon: <FaTint className="text-red-500" />, desc: 'הכפלת השאיבות שלך.', price: 5500, rarity: 'legendary', effect: 'אגרסיבי', anim: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } } },
    { id: 'time', name: 'עצירת זמן', icon: <FaHourglassHalf className="text-amber-400" />, desc: 'מקפיא את ירידת החשיפה שלך.', price: 6000, rarity: 'legendary', effect: 'שליטה', anim: { rotate: 360, transition: { repeat: Infinity, duration: 8, ease: "linear" } } },
    { id: 'hack', name: 'פריצת אלגוריתם', icon: <FaCodeBranch className="text-emerald-300" />, desc: 'משנה את קוד הדירוג לטובתך.', price: 9000, rarity: 'legendary', effect: 'האקינג', anim: { opacity: [1, 0, 1], transition: { repeat: Infinity, duration: 0.2, repeatDelay: 3 } } }
  ];

  const cosmetics = [
    { id: 'pulse_color', name: 'צבע דופק אישי', icon: <FaPalette className="text-pink-500" />, desc: 'החלפת צבע הניאון.', priceGems: 150, rarity: 'common', anim: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'neon_border', name: 'טבעת הילה', icon: <FaUserCircle className="text-cyan-400" />, desc: 'מסגרת זוהרת לאווטאר.', priceGems: 250, rarity: 'rare', anim: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'hat', name: 'כובע קוסם', icon: <FaHatWizard className="text-purple-400" />, desc: 'פילטר ייחודי לסרטונים.', priceGems: 300, rarity: 'rare', anim: { y: [0, -5, 0], rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 3 } } },
    { id: 'mask', name: 'מסכת צללים', icon: <FaMask className="text-gray-400" />, desc: 'הסתרת זהות בתגובות.', priceGems: 400, rarity: 'epic', anim: { opacity: [0.8, 1, 0.8], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'fingerprint', name: 'חתימת DNA', icon: <FaFingerprint className="text-emerald-400" />, desc: 'אנימציית טביעת אצבע בפוסטים.', priceGems: 450, rarity: 'epic', anim: { scale: [0.9, 1, 0.9], opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 1.5 } } },
    { id: 'vault', name: 'כספת מוצפנת', icon: <FaLock className="text-amber-500" />, desc: 'נועל מטבעות מהאקרים.', priceGems: 600, rarity: 'legendary', anim: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 4 } } },
    { id: 'vip_badge', name: 'תג וי.איי.פי', icon: <FaCertificate className="text-yellow-400" />, desc: 'חותמת יוקרה מוזהבת.', priceGems: 1000, rarity: 'legendary', anim: { rotateY: 360, transition: { repeat: Infinity, duration: 5, ease: "linear" } } },
    { id: 'verified', name: 'וי כחול (V)', icon: <FaCheckCircle className="text-blue-400" />, desc: 'סטטוס אימות רשמי.', priceGems: 1500, rarity: 'legendary', anim: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } } }
  ];

  const lootboxes = [
    { id: 'basic_crate', name: 'קופסת ציוד', icon: <FaBoxOpen className="text-gray-400" />, desc: 'סיכוי לזכות ב-1,000 DOP או שדרוג פשוט.', price: 500, dropRate: 'סיכוי סביר', anim: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } } },
    { id: 'silver_crate', name: 'קופסה טקטית', icon: <FaBoxOpen className="text-cyan-300" />, desc: 'סיכוי לקבל בוטים, מגינים או 5,000 DOP.', price: 1500, dropRate: 'סיכוי בינוני', anim: { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 2.5 } } },
    { id: 'gold_crate', name: 'הכספת השחורה', icon: <FaBoxOpen className="text-zinc-800 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />, desc: 'הימור מסוכן: סיכוי ל-50,000 DOP או איבוד מטבעות.', price: 4000, dropRate: 'אקסטרים', anim: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } } }
  ];

  const getRarityColor = (rarity) => {
    const colors = { common: 'border-white/10 bg-white/5', rare: 'border-blue-500/20 bg-blue-500/5', epic: 'border-purple-500/20 bg-purple-500/5', legendary: 'border-yellow-500/20 bg-yellow-500/5' };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pb-32 font-sans px-4 pt-6" dir="rtl">
      
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {[...Array(15)].map((_, i) => (
              <motion.div key={i} initial={{ y: -50, x: 0, scale: 0 }} animate={{ y: 800, x: (Math.random() - 0.5) * 400, scale: Math.random() + 0.5, rotate: Math.random() * 360 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 3)], left: `${Math.random() * 100}%` }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FaShoppingBag className="text-2xl text-emerald-500" />
            <h1 className="text-3xl font-black tracking-tight">החנות</h1>
          </div>
          <p className="text-white/40 text-xs mt-1">כלכלה דיגיטלית מתקדמת 2026</p>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-colors active:scale-95">
          <FaChevronLeft className="text-lg" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[#111] border border-emerald-500/30 p-4 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">DOP Coins</span>
            <FaCoins className="text-emerald-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-white relative z-10">{currentUser?.dop_coins?.toLocaleString() || '0'}</span>
        </div>
        <div className="bg-[#111] border border-blue-500/30 p-4 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">יהלומים</span>
            <FaGem className="text-blue-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-white relative z-10">{currentUser?.mint_gems?.toLocaleString() || '0'}</span>
        </div>
      </div>

      <div className="bg-[#111] p-1.5 rounded-[20px] mb-8 border border-white/5">
        <div className="flex gap-1">
          {[ {id: 'upgrades', label: 'שדרוגים'}, {id: 'cosmetics', label: 'סטייל'}, {id: 'lootboxes', label: 'הפתעה'}, {id: 'store', label: 'פרימיום'} ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
          
          {activeTab === 'upgrades' && (
            <div className="grid grid-cols-2 gap-3">
              {upgrades.map(item => (
                <motion.div key={item.id} variants={cardVariants} className={`relative bg-gradient-to-br from-[#111] to-[#080808] border rounded-3xl p-4 flex flex-col items-center text-center ${getRarityColor(item.rarity)}`}>
                  <div className="absolute top-3 right-3 bg-white/5 text-white/70 text-[9px] font-bold px-1.5 py-0.5 rounded-md">{item.effect}</div>
                  <motion.div animate={item.anim} className="text-4xl mb-3 mt-4 drop-shadow-lg">{item.icon}</motion.div>
                  <h3 className="text-sm font-black mb-1">{item.name}</h3>
                  <p className="text-white/40 text-[10px] mb-4 line-clamp-2">{item.desc}</p>
                  <button onClick={() => handleVirtualPurchase(item, 'coins')} disabled={loading} className="mt-auto w-full bg-white/10 hover:bg-emerald-500 hover:text-black border border-white/10 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <FaCoins className="text-[9px]" /> {item.price.toLocaleString()}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="grid grid-cols-2 gap-3">
              {cosmetics.map(item => (
                <motion.div key={item.id} variants={cardVariants} className={`relative bg-gradient-to-br from-[#111] to-[#080808] border rounded-3xl p-4 flex flex-col items-center text-center ${getRarityColor(item.rarity)}`}>
                  <motion.div animate={item.anim} className="text-4xl mb-3 mt-2 drop-shadow-lg">{item.icon}</motion.div>
                  <h3 className="text-sm font-black mb-1">{item.name}</h3>
                  <p className="text-white/40 text-[10px] mb-4 line-clamp-2">{item.desc}</p>
                  <button onClick={() => handleVirtualPurchase(item, 'gems')} disabled={loading} className="mt-auto w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500 text-blue-400 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <FaGem className="text-[9px]" /> {item.priceGems}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'lootboxes' && lootboxes.map(box => (
            <motion.div key={box.id} variants={cardVariants} className="relative bg-[#111] border border-white/10 rounded-3xl p-5 overflow-hidden">
              <div className="relative flex items-center gap-4">
                <motion.div animate={box.anim} className="text-5xl drop-shadow-lg">
                  {box.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-black mb-1">{box.name}</h3>
                  <p className="text-white/50 text-xs mb-1.5 leading-snug">{box.desc}</p>
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">{box.dropRate}</span>
                  <button onClick={() => handleVirtualPurchase(box, 'coins')} disabled={loading} className="w-full bg-white text-black font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 mt-3 transition-transform">
                    <FaBoxOpen /> פתח ב-{box.price.toLocaleString()} DOP
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === 'store' && (
            <>
              <motion.div variants={cardVariants} className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/30 rounded-3xl p-5 mb-4">
                <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-br-xl">פופולרי 2026</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-2xl"><FaCrown className="text-2xl text-white" /></div>
                  <div>
                    <h3 className="text-xl font-black">מנוי עלית (PRO)</h3>
                    <p className="text-white/60 text-xs mt-0.5">כל היכולות פתוחות + תג זהב.</p>
                  </div>
                </div>
                <button onClick={() => setPaymentGateway({ name: 'מנוי עלית חודשי', price: '₪39.90', type: 'pro', reward: 0 })} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black py-3.5 rounded-xl text-sm active:scale-95 transition-transform">
                  הפעל ב- ₪39.90
                </button>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { amount: 150, price: '₪19.90', color: 'from-zinc-800 to-zinc-900', type: 'gems', reward: 150 },
                  { amount: 500, price: '₪49.90', color: 'from-emerald-800 to-teal-900', popular: true, type: 'gems', reward: 500 },
                  { amount: 1800, price: '₪149.90', color: 'from-blue-800 to-purple-900', type: 'gems', reward: 1800 },
                  { amount: 5500, price: '₪399.00', color: 'from-amber-700 to-orange-900', bonus: 'משתלם', type: 'gems', reward: 5500 }
                ].map((pkg, idx) => (
                  <motion.div key={idx} variants={cardVariants} onClick={() => setPaymentGateway({ name: `חבילת ${pkg.amount} יהלומים`, price: pkg.price, type: pkg.type, reward: pkg.reward })} className={`relative bg-gradient-to-br ${pkg.color} p-4 rounded-3xl text-center active:scale-95 transition-transform border border-white/5 cursor-pointer ${pkg.popular ? 'ring-1 ring-emerald-500' : ''}`}>
                    {pkg.popular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md">נמכר ביותר</div>}
                    {pkg.bonus && <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">{pkg.bonus}</div>}
                    <FaGem className="text-2xl mx-auto mb-2 text-white/80" />
                    <div className="text-xl font-black">{pkg.amount.toLocaleString()}</div>
                    <div className="bg-black/40 rounded-lg py-1.5 mt-2 font-bold text-xs">{pkg.price}</div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {paymentGateway && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-[#111] w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 border-t border-white/10 shadow-2xl pb-10 sm:pb-6">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
              <div className="text-center mb-6">
                <FaApple className="text-4xl mx-auto mb-2 text-white" />
                <h2 className="text-xl font-black mb-1">אישור רכישה</h2>
                <p className="text-white/50 text-sm">{paymentGateway.name}</p>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center mb-6 border border-white/5">
                <div className="flex items-center gap-3">
                  <FaCreditCard className="text-xl text-white/40" />
                  <span className="font-bold">Apple Pay</span>
                </div>
                <span className="font-black text-lg">{paymentGateway.price}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaymentGateway(null)} disabled={loading} className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl active:scale-95">ביטול</button>
                <button onClick={handleRealMoneyPurchase} disabled={loading} className="flex-[2] bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95">
                  {loading ? 'מעבד...' : 'לחץ לאישור'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-10" />
    </div>
  );
}
