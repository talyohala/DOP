import React, { useState } from 'react';
import { Zap, Clock, Skull, ChevronLeft, Check } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Clock size={80} className="text-red-500 mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />,
      title: "הזמן שלך אוזל",
      desc: "DOP היא לא עוד רשת חברתית. כל דרופ שאתה מעלה מקבל קוצב זמן. אם הקהילה לא תיתן לו בוסטים - הוא יישאב לחור השחור ויימחק."
    },
    {
      icon: <Zap size={80} className="text-blue-500 mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" />,
      title: "בוסטים הם החיים",
      desc: "לחץ פעמיים על דרופ בפיד כדי לתת לו בוסט ⚡. כל בוסט מוסיף זמן חיים לסרטון. מצא סרטונים עם 'קופת פרס' ושדוד מהם מטבעות ישר לכיס שלך!"
    },
    {
      icon: <Skull size={80} className="text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />,
      title: "שרוד בשביל להרוויח",
      desc: "דרופים ששורדים 24 שעות בפיד מייצרים לך משכורת יומית קבועה. השתמש בהון שלך ב'שוק השחור' כדי להגן על עצמך או לתקוף אחרים."
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('dop_onboarded', 'true');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 via-black to-black opacity-80"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {slides[step].icon}
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">{slides[step].title}</h1>
        <p className="text-gray-400 text-lg leading-relaxed font-medium mb-12 px-2">{slides[step].desc}</p>
        
        <div className="flex gap-2 mb-12">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className={`w-full py-4.5 font-black text-xl rounded-2xl active:scale-95 transition-all flex justify-center items-center gap-2 ${step === slides.length - 1 ? 'bg-yellow-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
        >
          {step === slides.length - 1 ? <><Check size={24} /> התחל לשחק</> : <><ChevronLeft size={24} /> המשך</>}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
