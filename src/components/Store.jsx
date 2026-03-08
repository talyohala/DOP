import React, { useState } from 'react';
import { X, Shield, Zap, Crown, CircleDollarSign, Gem, CreditCard, Lock, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Store = ({ userCoins = 0, onPurchase, onClose }) => {
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' | 'vault'

  const regularItems = [
    { id: 'shield', name: 'מגן טיטניום', desc: 'מגן על הדרופים שלך משאיבות ל-8 שעות הקרובות.', price: 150, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]' },
    { id: 'mass_siphon', name: 'שאיבת המונים', desc: 'מוריד 10 דקות חיים מכל הדרופים הפעילים כרגע בפיד!', price: 300, icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', shadow: 'shadow-[0_0_15px_rgba(248,113,113,0.1)]' },
    { id: 'halo', name: 'הילת יוקרה', desc: 'מוסיף כתר זהב קבוע ליד השם שלך. כולם יידעו מי הבוס.', price: 500, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.1)]' },
  ];

  const vaultItems = [
    { id: 'sub_syndicate', name: 'Dop Syndicate', desc: 'מנוי VIP: כתר זהב ייחודי, 100 מטבעות מתנה כל יום, והגנה פסיבית מ-20% מהשאיבות.', price: '₪19.90', period: '/ חודש', icon: Gem, color: 'text-yellow-500', bg: 'bg-gradient-to-br from-yellow-500/20 to-black', border: 'border-yellow-500/50', isSub: true },
    { id: 'coins_pack', name: 'מזוודת שודדים', desc: 'קבל 1,000 מטבעות DOP באופן מיידי כדי לשלוט בפיד.', price: '₪9.90', period: '', icon: CircleDollarSign, color: 'text-white', bg: 'bg-zinc-800/80', border: 'border-white/20', isSub: false },
  ];

  const handlePremiumClick = (item) => {
    toast.success(`מערכת הסליקה ל-${item.name} תפתח בקרוב! 💳`, {
      style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col font-sans text-white animate-in fade-in duration-300" dir="rtl">
      
      {/* כותרת החלון */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
        <h2 className="text-2xl font-black flex items-center gap-2">
          {activeTab === 'regular' ? 'השוק השחור' : 'הכספת סודית'}
        </h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-all hover:bg-white/20">
          <X size={24} />
        </button>
      </div>

      {/* מתג ניווט */}
      <div className="p-4 shrink-0 flex justify-center">
        <div className="bg-zinc-900 p-1 rounded-full flex items-center border border-white/10 shadow-xl relative w-[80%] max-w-sm">
          <button 
            onClick={() => setActiveTab('regular')} 
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all z-10 ${activeTab === 'regular' ? 'text-black' : 'text-gray-400'}`}
          >
            במשחק
          </button>
          <button 
            onClick={() => setActiveTab('vault')} 
            className={`flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-1 transition-all z-10 ${activeTab === 'vault' ? 'text-black' : 'text-gray-400'}`}
          >
            <Lock size={14} /> כסף אמיתי
          </button>
          
          {/* רקע זז (Sliding background) */}
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out shadow-md ${activeTab === 'regular' ? 'right-1 bg-white' : 'left-1 bg-yellow-500'}`} />
        </div>
      </div>

      {/* אזור רגיל (מטבעות משחק) */}
      {activeTab === 'regular' && (
        <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar animate-in slide-in-from-right-4 duration-300">
          
          <div className="flex items-center justify-center gap-2 mb-8 mt-2 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
            <span className="text-gray-400 text-sm font-bold">היתרה שלך:</span>
            <div className="flex items-center gap-1 text-yellow-400 font-black text-2xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              <CircleDollarSign size={24} />
              {userCoins?.toFixed(0) || 0}
            </div>
          </div>

          <div className="space-y-4">
            {regularItems.map(item => {
              const Icon = item.icon;
              const canAfford = userCoins >= item.price;
              return (
                <div key={item.id} className={`p-5 rounded-2xl border ${item.bg} ${item.border} ${item.shadow} flex flex-col gap-4 backdrop-blur-sm`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/10 ${item.color}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white">{item.name}</h3>
                        <p className="text-sm text-white/60 font-medium leading-snug w-[90%] mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford}
                    className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${canAfford ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-800 text-gray-500'}`}
                  >
                    קנה ב- {item.price} <CircleDollarSign size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* אזור הכספת (כסף אמיתי) */}
      {activeTab === 'vault' && (
        <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar animate-in slide-in-from-left-4 duration-300">
          
          <div className="text-center mb-8 mt-4">
            <h3 className="text-yellow-500 font-black text-xl flex items-center justify-center gap-2 mb-2">
              <Sparkles size={20} /> אקסקלוסיבי ל-Dop
            </h3>
            <p className="text-sm text-gray-400 font-medium">פריטים מיוחדים ומנויי פרימיום בכסף אמיתי.</p>
          </div>

          <div className="space-y-5">
            {vaultItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`p-6 rounded-3xl border ${item.bg} ${item.border} flex flex-col gap-4 relative overflow-hidden`}>
                  
                  {/* אפקט זוהר ברקע של הפרימיום */}
                  {item.isSub && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />}

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-black/60 border border-white/10 shadow-lg ${item.color}`}>
                        <Icon size={28} />
                      </div>
                      <div>
                        <h3 className={`font-black text-xl ${item.isSub ? 'text-yellow-500' : 'text-white'}`}>{item.name}</h3>
                        <p className="text-sm text-white/70 font-medium leading-snug w-full mt-1.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handlePremiumClick(item)}
                    className={`relative z-10 w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${item.isSub ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white text-black hover:bg-gray-200'}`}
                  >
                    <CreditCard size={20} />
                    {item.price} <span className="text-xs opacity-70 ml-1">{item.period}</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

export default Store;
