import React from 'react';
import { Home, Aperture, Plus, ShoppingBag, User } from 'lucide-react';

const FloatingNav = ({ activeTab, setActiveTab }) => {
  // הסדר מוגדר משמאל לימין כדי שיתאים בדיוק לתמונה (פרופיל בשמאל, בית בימין)
  const tabs = [
    { id: 'profile', icon: User },
    { id: 'store', icon: ShoppingBag },
    { id: 'create_main', isCenter: true },
    { id: 'blackhole', icon: Aperture }, // הנה התיקון: עכשיו זה מנווט ל-blackhole!
    { id: 'home', icon: Home },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 h-16 bg-[#0a0a0a] border-t border-white/5 z-50 flex items-center justify-around px-2" dir="ltr">
      {tabs.map((tab) => {
        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab('create')}
              className="w-16 h-10 bg-white rounded-[1.2rem] flex items-center justify-center active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Plus size={26} className="text-black" strokeWidth={2.5} />
            </button>
          );
        }
        
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-2 transition-all ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
};

export default FloatingNav;
