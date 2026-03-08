import React from 'react';
import { Fingerprint, Cpu, VenetianMask, Flame, X, CircleDollarSign, Infinity, EyeOff, Radio } from 'lucide-react';

const BlackMarket = ({ userCoins, onClose, onPurchase }) => {
  const formattedCoins = Intl.NumberFormat('en-US', { 
    notation: "compact", 
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  }).format(userCoins || 0);

  const items = [
    { id: 'time_heist', name: 'שוד זמן', desc: 'שואב 60 דקות מדרופ אקראי ומעביר אותן אליך.', price: 500.0, icon: <Flame size={40} className="text-cyan-400" />, bg: 'from-cyan-400/10' },
    { id: 'ghost_mode', name: 'פרוטוקול רפאים', desc: 'גלישה אנונימית ל-24 שעות. הזהות שלך תוסתר מהלוגים.', price: 300.0, icon: <VenetianMask size={40} className="text-purple-400" />, bg: 'from-purple-400/10' },
    { id: 'algo_bribe', name: 'שוחד אלגוריתם', desc: 'הקפצה מיידית לראש הפיד תוך עקיפת חוקי החשיפה.', price: 1000.0, icon: <Cpu size={40} className="text-indigo-400" />, bg: 'from-indigo-400/10' },
    { id: 'mass_syphon', name: 'שאיבת המונים', desc: 'שואב 5 דקות מכל הדרופים שפעילים כרגע בבת אחת.', price: 2500.0, icon: <Infinity size={40} className="text-teal-400" />, bg: 'from-teal-400/10' },
    { id: 'shadow_ban', name: 'חסימת צל', desc: 'מעלים דרופ של משתמש אחר מהפיד למשך 30 דקות.', price: 1500.0, icon: <EyeOff size={40} className="text-zinc-400" />, bg: 'from-zinc-400/10' },
    { id: 'signal_jam', name: 'שיבוש אותות', desc: 'מונע מכל המשתמשים בפיד לעשות בוסטים לדקה אחת.', price: 3000.0, icon: <Radio size={40} className="text-blue-400" />, bg: 'from-blue-400/10' },
  ];

  return (
    <div className="fixed inset-0 bg-[#020205] z-[100] flex flex-col font-sans text-white animate-in zoom-in-95 duration-500" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#020205] to-[#020205] opacity-90 pointer-events-none"></div>
      
      <div className="relative z-10 p-6 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            המחתרת
          </h2>
          <p className="text-cyan-400/70 text-xs font-bold mt-2 flex items-center gap-2 tracking-widest uppercase">
            <Fingerprint size={14} /> ערוץ מוצפן ודיסקרטי
          </p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/5">
          <X size={20} />
        </button>
      </div>

      <div className="relative z-10 px-6 mt-2">
         <div className="inline-flex items-center gap-3 bg-cyan-950/20 border border-cyan-900/30 rounded-full py-2.5 px-5 backdrop-blur-md shadow-lg">
            <CircleDollarSign size={20} className="text-cyan-400" />
            <span className="text-2xl font-black tracking-wider text-cyan-400">{formattedCoins} DOP</span>
         </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center overflow-x-auto snap-x snap-mandatory px-6 pb-12 pt-4 hide-scrollbar space-x-4 space-x-reverse">
         {items.map(item => (
           <div key={item.id} className="snap-center shrink-0 w-[85vw] max-w-sm h-[60vh] bg-black/40 border border-cyan-900/20 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-cyan-500/30 transition-all overflow-hidden relative group ml-4 shadow-2xl">
             <div className={`absolute -inset-20 bg-gradient-to-br ${item.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl z-0 pointer-events-none`}></div>
             
             <div className="relative z-10 text-right">
               <div className="flex justify-between items-start mb-10">
                 <div className="p-4 bg-black/80 rounded-2xl border border-cyan-900/30 shadow-xl group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm">
                   {item.icon}
                 </div>
                 <div className="text-left bg-black/80 px-4 py-2 rounded-2xl border border-cyan-900/30 backdrop-blur-sm" dir="ltr">
                   <span className="text-[10px] font-bold text-cyan-500/70 block mb-0.5 tracking-widest uppercase">Cost</span>
                   <span className="text-xl font-black text-cyan-400">{item.price.toFixed(1)}</span>
                 </div>
               </div>
               
               <h3 className="text-3xl font-black mb-4 tracking-wide text-zinc-100">{item.name}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.desc}</p>
             </div>

             <button onClick={() => onPurchase(item)} className="relative z-10 w-full py-4.5 bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-500 hover:text-black font-black text-lg rounded-2xl active:scale-95 transition-all">
               הפעל יכולת
             </button>
           </div>
         ))}
      </div>
    </div>
  );
};

export default BlackMarket;
