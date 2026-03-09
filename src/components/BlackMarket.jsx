import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { 
  FaChevronLeft, FaCoins, FaGem, FaShoppingBag, 
  FaRocket, FaPalette, FaBoxOpen, FaCrown, 
  FaCheckCircle, FaShieldAlt, FaEye, FaStar, 
  FaUserCircle, FaApple, FaCreditCard, FaHeartbeat,
  FaMagnet, FaRobot, FaSpider, FaGhost, FaTint, 
  FaHourglassHalf, FaCodeBranch, FaHatWizard, 
  FaMask, FaFingerprint, FaLock, FaCertificate
} from 'react-icons/fa';

export default function BlackMarket({ currentUser, onClose, onUpdateUser }) {
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-[#030303] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleVirtualPurchase = async (item, type) => {
    if (!currentUser || loading) return;

    const balanceField = type === 'coins' ? 'dop_coins' : 'mint_gems';
    const cost = type === 'coins' ? item.price : item.priceGems;
    const currentBalance = currentUser[balanceField] || 0;

    if (currentBalance < cost) {
      return toast.error(`אין מספיק ${type === 'coins' ? 'מטבעות DOP' : 'יהלומים'}`, { 
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', border: `1px solid ${type === 'coins' ? '#ef4444' : '#3b82f6'}` } 
      });
    }

    setLoading(true);
    try {
      const newBalance = currentBalance - cost;
      const { error } = await supabase.from('dop_users').update({ [balanceField]: newBalance }).eq('id', currentUser.id);
      if (error) throw error;
      
      onUpdateUser({ ...currentUser, [balanceField]: newBalance });
      toast.success(`נרכש בהצלחה: ${item.name}`, { 
        style: { background: '#1a1a1a', color: '#10b981', borderRadius: '16px', border: '1px solid #10b981' } 
      });

      await supabase.from('dop_notifications').insert({
        user_id: currentUser.id,
        content: `רכשת את ${item.name} בהצלחה!`,
        type: 'purchase',
        created_at: new Date().toISOString()
      });

    } catch (error) {
      toast.error("שגיאת רשת, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  const handleRealMoneyPurchase = async () => {
    if (!paymentGateway || !currentUser || loading) return;
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // הדמיית סליקה

      let updates = {};
      if (paymentGateway.type === 'gems') {
        updates.mint_gems = (currentUser.mint_gems || 0) + paymentGateway.reward;
      } else if (paymentGateway.type === 'pro') {
        updates.premium_tier = 'pro';
      }

      const { error } = await supabase.from('dop_users').update(updates).eq('id', currentUser.id);
      if (error) throw error;
      
      onUpdateUser({ ...currentUser, ...updates });
      toast.success(`אישור רכישה: ${paymentGateway.name}`, { 
        style: { background: '#1a1a1a', color: '#10b981', borderRadius: '16px', border: '1px solid #10b981' } 
      });
      setPaymentGateway(null);
    } catch (error) {
      toast.error("הסליקה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  // --- קטגוריות ראשיות למסך הבית של החנות (קוביות ענק) ---
  const categories = [
    { id: 'upgrades', title: 'שדרוגי חשיפה', desc: 'כלים אלגוריתמיים', icon: <FaRocket size={56} />, bg: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' },
    { id: 'cosmetics', title: 'עיצוב וסטטוס', desc: 'התאמה אישית', icon: <FaPalette size={56} />, bg: 'bg-blue-950/30 border-blue-500/40 text-blue-400' },
    { id: 'bundles', title: 'מארזי יוקרה', desc: 'תיבות שלל', icon: <FaBoxOpen size={56} />, bg: 'bg-fuchsia-950/30 border-fuchsia-500/40 text-fuchsia-400' },
    { id: 'premium', title: 'שירותי עלית', desc: 'יהלומים ומנויים', icon: <FaCrown size={56} />, bg: 'bg-amber-950/30 border-amber-500/40 text-amber-400' }
  ];

  // --- פריטים מפורטים תחת כל קטגוריה ---
  const categoryItems = {
    upgrades: [
      { id: 'reach', name: 'הגברת תפוצה', icon: <FaEye size={40} className="text-emerald-400" />, desc: 'חשיפה מורחבת', price: 1200 },
      { id: 'defib', name: 'החייאת פיד', icon: <FaHeartbeat size={40} className="text-emerald-400" />, desc: 'מעיר סרטון שדעך.', price: 1500 },
      { id: 'robot', name: 'צבא בוטים', icon: <FaRobot size={40} className="text-emerald-400" />, desc: 'מזריק לייקים פיקטיביים.', price: 3500 },
      { id: 'shield', name: 'מגן קוונטי', icon: <FaShieldAlt size={40} className="text-emerald-400" />, desc: 'חסינות שודדים', price: 2000 },
      { id: 'vampire', name: 'שאיבת דם', icon: <FaTint size={40} className="text-emerald-400" />, desc: 'הכפלת השאיבות שלך.', price: 5500 },
      { id: 'time', name: 'עצירת זמן', icon: <FaHourglassHalf size={40} className="text-emerald-400" />, desc: 'מקפיא ירידת חשיפה.', price: 6000 }
    ],
    cosmetics: [
      { id: 'pulse', name: 'צבע דופק', icon: <FaPalette size={40} className="text-blue-400" />, desc: 'החלפת צבע הניאון', priceGems: 150 },
      { id: 'border', name: 'טבעת הילה', icon: <FaUserCircle size={40} className="text-blue-400" />, desc: 'מסגרת זוהרת', priceGems: 250 },
      { id: 'badge', name: 'תג מאומת', icon: <FaCheckCircle size={40} className="text-blue-400" />, desc: 'סמל אימות', priceGems: 1000 },
      { id: 'hat', name: 'כובע קוסם', icon: <FaHatWizard size={40} className="text-blue-400" />, desc: 'פילטר לסרטונים', priceGems: 300 },
      { id: 'vault', name: 'כספת מוצפנת', icon: <FaLock size={40} className="text-blue-400" />, desc: 'נועל מטבעות', priceGems: 600 },
      { id: 'vip', name: 'תג VIP', icon: <FaCertificate size={40} className="text-blue-400" />, desc: 'חותמת יוקרה', priceGems: 1500 }
    ],
    bundles: [
      { id: 'basic', name: 'קופסת ציוד', icon: <FaBoxOpen size={40} className="text-fuchsia-400" />, desc: 'סיכוי ל-1,000 DOP', price: 500 },
      { id: 'silver', name: 'קופסה טקטית', icon: <FaBoxOpen size={40} className="text-fuchsia-400" />, desc: 'סיכוי לקבל בוטים או 5k', price: 1500 },
      { id: 'gold', name: 'כספת שחורה', icon: <FaBoxOpen size={40} className="text-fuchsia-400" />, desc: 'הימור מסוכן ענק', price: 4000 }
    ]
  };

  const gemPackages = [
    { amount: 150, price: '₪19.90', reward: 150 }, 
    { amount: 500, price: '₪49.90', popular: true, reward: 500 },
    { amount: 1800, price: '₪149.90', reward: 1800 }, 
    { amount: 5500, price: '₪399.00', reward: 5500 }
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    // הפתרון המוחלט לגלילה (fixed + overflow-y-auto)
    <div className="fixed inset-0 z-50 bg-[#030303] text-white overflow-y-auto font-sans" dir="rtl">
      <div className="min-h-full pb-32 px-4 pt-6">

        {/* כותרת החנות */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-5 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FaShoppingBag className="text-3xl text-white" />
              <h1 className="text-2xl font-black text-white">מרכז מסחר</h1>
            </div>
            <p className="text-white/50 text-xs font-bold">
              {currentCategory ? currentCategory.title : 'בחר קטגוריית ציוד'}
            </p>
          </div>
          <button 
            onClick={() => selectedCategory ? setSelectedCategory(null) : onClose()} 
            className="bg-white/10 p-4 rounded-[20px] hover:bg-white/20 transition-colors active:scale-95"
          >
            <FaChevronLeft className="text-xl text-white" />
          </button>
        </div>

        {/* יתרות */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0a0a0a] border border-emerald-500/30 p-5 rounded-[28px] relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] text-emerald-400 font-black tracking-widest uppercase">יתרת DOP</span>
              <FaCoins className="text-emerald-500 text-lg" />
            </div>
            <span className="text-3xl font-black text-white relative z-10">
              {(currentUser?.dop_coins || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#0a0a0a] border border-blue-500/30 p-5 rounded-[28px] relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] text-blue-400 font-black tracking-widest uppercase">יהלומים</span>
              <FaGem className="text-blue-500 text-lg" />
            </div>
            <span className="text-3xl font-black text-white relative z-10">
              {(currentUser?.mint_gems || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* תוכן החנות הדינמי */}
        {!selectedCategory ? (
          /* מצב 1: 4 קוביות ענק */
          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className={`${cat.bg} border rounded-[32px] p-6 flex flex-col items-center text-center cursor-pointer aspect-square justify-center active:scale-95 transition-transform shadow-xl`}
              >
                <div className="mb-4 drop-shadow-lg">{cat.icon}</div>
                <h3 className="text-xl font-black text-white mb-1">{cat.title}</h3>
                <p className="text-[11px] text-white/60 font-bold px-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        ) : selectedCategory !== 'premium' ? (
          /* מצב 2: תתי פריטים (שדרוגים / סטייל / קופסאות) */
          <div className="grid grid-cols-2 gap-4">
            {categoryItems[selectedCategory]?.map(item => (
              <div 
                key={item.id} 
                className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-5 flex flex-col items-center text-center aspect-square justify-between shadow-lg"
              >
                <div className="mt-2 drop-shadow-md">{item.icon}</div>
                <div>
                  <h3 className="font-black text-sm text-white mb-1">{item.name}</h3>
                  <p className="text-[10px] text-white/50 leading-snug">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleVirtualPurchase(item, item.priceGems ? 'gems' : 'coins')} 
                  disabled={loading}
                  className={`w-full font-black text-xs py-3.5 rounded-[16px] transition-colors flex items-center justify-center gap-1.5 active:scale-95 ${item.priceGems ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}
                >
                  {item.priceGems ? <FaGem size={10} /> : <FaCoins size={10} />}
                  {item.priceGems || item.price.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* מצב 3: כסף אמיתי (Premium) */
          <div className="grid grid-cols-2 gap-4">
            {gemPackages.map((pkg, idx) => (
              <div 
                key={idx} 
                onClick={() => setPaymentGateway({ name: `חבילת ${pkg.amount} יהלומים`, price: pkg.price, type: 'gems', reward: pkg.reward })} 
                className={`bg-[#0a0a0a] border-2 p-5 rounded-[32px] text-center cursor-pointer relative flex flex-col items-center justify-center aspect-square active:scale-95 transition-transform ${pkg.popular ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/5'}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    נמכר ביותר
                  </div>
                )}
                <FaGem className="text-4xl mb-3 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div className="text-2xl font-black text-white">{pkg.amount.toLocaleString()}</div>
                <div className="bg-white/10 rounded-[12px] py-2 px-4 mt-3 font-black text-xs text-white/80">
                  {pkg.price}
                </div>
              </div>
            ))}
            
            {/* מנוי PRO */}
            <div 
              onClick={() => setPaymentGateway({ name: 'מנוי עלית (PRO)', price: '₪39.90', type: 'pro', reward: 0 })} 
              className="col-span-2 bg-gradient-to-r from-amber-900/40 to-amber-600/20 border border-amber-500/50 rounded-[32px] p-6 mt-2 flex items-center justify-between cursor-pointer active:scale-95 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <div>
                <h3 className="font-black text-lg flex items-center gap-2 text-white">
                  <FaCrown className="text-amber-400 text-2xl" /> מנוי העלית
                </h3>
                <p className="text-xs text-amber-200/70 mt-1 font-bold">גישה לכלים אלגוריתמיים מתקדמים.</p>
              </div>
              <div className="bg-amber-500 text-black font-black px-5 py-3 rounded-[16px] text-sm shadow-md">
                ₪39.90
              </div>
            </div>
          </div>
        )}
      </div>

      {/* מסך תשלום (Apple Pay / Credit Card) */}
      {paymentGateway && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#111] w-full sm:w-[400px] rounded-t-[40px] sm:rounded-[32px] p-8 border-t border-white/10 shadow-2xl pb-12 sm:pb-8 animate-slide-up">
            <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mb-8 sm:hidden"></div>
            
            <div className="text-center mb-8">
              <FaApple className="text-5xl mx-auto mb-3 text-white" />
              <h2 className="text-2xl font-black mb-1 text-white">אישור רכישה מאובטח</h2>
              <p className="text-white/50 text-sm font-bold">{paymentGateway.name}</p>
            </div>

            <div className="bg-white/5 rounded-[24px] p-5 flex justify-between items-center mb-8 border border-white/5">
              <div className="flex items-center gap-3">
                <FaCreditCard className="text-2xl text-white/40" />
                <span className="font-black text-lg text-white">Apple Pay</span>
              </div>
              <span className="font-black text-2xl text-blue-400">{paymentGateway.price}</span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setPaymentGateway(null)} 
                disabled={loading}
                className="flex-1 bg-white/10 text-white/80 font-black text-lg py-5 rounded-[24px] active:scale-95 hover:bg-white/20 transition-colors"
              >
                ביטול
              </button>
              <button 
                onClick={handleRealMoneyPurchase}
                disabled={loading}
                className="flex-[2] bg-white text-black font-black text-lg py-5 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 shadow-[0_5px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 transition-all"
              >
                {loading ? 'מעבד תשלום...' : 'אשר תשלום'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
