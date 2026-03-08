import React from 'react';
import { FaHome, FaSearch, FaPlus, FaShoppingCart, FaUser } from 'react-icons/fa';

export default function Navigation({ currentScreen, setCurrentScreen }) {
  const navItems = [
    { id: 'feed', icon: <FaHome /> },
    { id: 'search', icon: <FaSearch /> },
    { id: 'upload', icon: <FaPlus />, special: true },
    { id: 'market', icon: <FaShoppingCart /> }, // השוק השחור בניווט
    { id: 'profile', icon: <FaUser /> }
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentScreen(item.id)}
          className={`${
            item.special 
              ? 'bg-emerald-500 text-black p-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transform -translate-y-4 hover:scale-110 transition-transform' 
              : currentScreen === item.id 
                ? 'text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                : 'text-white/40 hover:text-white'
          } text-2xl transition-all duration-300`}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
