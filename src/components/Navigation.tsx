import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home },
    { path: '/chat', icon: MessageCircle },
    { path: '/camera', isMain: true },
    { path: '/wallet', icon: ShoppingBag },
    { path: '/profile', icon: User },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(24px + env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: 400,
      background: 'rgba(15, 15, 20, 0.75)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 32,
      padding: '8px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 9999,
      boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
      direction: 'rtl'
    }}>
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path || (item.path === '/chat' && location.pathname.startsWith('/chat'));

        // כפתור אליפסה לבן ונקי
        if (item.isMain) {
          return (
            <motion.button
              key="main-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
              style={{
                height: 48,
                width: 72, // רוחב גדול יותר ליצירת אליפסה
                borderRadius: 24, // חצי מהגובה כדי שהפינות יהיו עגולות לגמרי
                background: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                cursor: 'pointer',
                margin: '0 4px',
                flexShrink: 0
              }}
            />
          );
        }

        const Icon = item.icon!;
        return (
          <button
            key={item.path || index}
            onClick={() => navigate(item.path)}
            style={{
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              width: 44,
              height: 44,
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              flexShrink: 0
            }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
}
