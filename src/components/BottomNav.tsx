import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <Home size={28} />, label: 'פיד' },
    { path: '/upload', icon: <Activity size={28} color="#000" strokeWidth={2.5} />, label: '' },
    { path: '/wallet', icon: <Wallet size={28} />, label: 'חנות' }
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 70, background: 'rgba(10,10,12,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const isCenter = item.path === '/upload';
        return (
          <motion.button
            key={item.path}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(item.path)}
            animate={isCenter ? { boxShadow: ['0 0 10px rgba(255,255,255,0.4)', '0 0 25px rgba(255,255,255,0.9)', '0 0 10px rgba(255,255,255,0.4)'] } : {}}
            transition={isCenter ? { repeat: Infinity, duration: 1.5 } : {}}
            style={{
              background: isCenter ? '#fff' : 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: isActive ? '#fff' : '#666',
              cursor: 'pointer',
              width: isCenter ? 60 : 70,
              height: isCenter ? 60 : 'auto',
              borderRadius: isCenter ? '50%' : 0,
              transform: isCenter ? 'translateY(-20px)' : 'none',
            }}
          >
            {item.icon}
            {!isCenter && <span style={{ fontSize: 11, fontWeight: 700, opacity: isActive ? 1 : 0.7 }}>{item.label}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
