import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sounds } from '../utils/sounds';

export default function ChatRoom() {
  const { id: receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReceiver = async () => {
      const { data } = await supabase.from('dop_users').select('display_name').eq('id', receiverId).single();
      if (data) setReceiver(data);
    };
    fetchReceiver();
  }, [receiverId]);

  useEffect(() => {
    if (!user || !receiverId) return;

    // שליפת היסטוריית השיחה
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('dop_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      if (error) console.error("Error fetching messages:", error);
    };

    fetchMessages();

    // האזנה גלובלית ויציבה בזמן אמת בלי פילטרים שחוסמים בקשות
    const channel = supabase.channel(`public:dop_messages`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'dop_messages'
      }, (payload) => {
        const newMsg = payload.new;
        // בודק אם ההודעה החדשה היא אליי, מאת המשתמש שאיתו אני בשיחה!
        if (newMsg.sender_id === receiverId && newMsg.receiver_id === user.id) {
          setMessages(prev => [...prev, newMsg]);
          sounds.playTick(); // משמיע צליל שיש הודעה חדשה
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, receiverId]);

  // גלילה אוטומטית למטה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !receiverId) return;
    
    const text = newMessage;
    setNewMessage('');
    
    // מוסיף למסך מיד כדי שירגיש מיידי
    const tempMsg = {
      id: `temp_${Date.now()}`,
      sender_id: user.id,
      receiver_id: receiverId,
      text: text,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    sounds.playZap();

    // דוחף למסד הנתונים
    const { error } = await supabase.from('dop_messages').insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      text: text
    }]);

    if (error) {
      toast.error('שגיאה בשליחת ההודעה: ' + error.message);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); // מסיר את ההודעה אם נכשלה
    }
  };

  return (
    <div style={{ background: '#000', height: '100dvh', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ 
        background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', 
        padding: 'calc(16px + env(safe-area-inset-top)) 20px 16px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <ArrowRight size={28} color="#fff" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 900 }}>
            {receiver?.display_name?.charAt(0) || 'U'}
          </div>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{receiver?.display_name || 'טוען...'}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={msg.id || idx}
              style={{ alignSelf: isMe ? 'flex-start' : 'flex-end', maxWidth: '75%' }}
            >
              <div style={{ 
                background: isMe ? '#fff' : 'rgba(255,255,255,0.08)', 
                color: isMe ? '#000' : '#fff',
                padding: '12px 18px', 
                borderRadius: isMe ? '24px 8px 24px 24px' : '8px 24px 24px 24px',
                fontSize: 15, fontWeight: 600, lineHeight: 1.4,
                boxShadow: isMe ? '0 4px 15px rgba(255,255,255,0.15)' : 'none',
                border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: isMe ? 'none' : 'blur(10px)'
              }}>
                {msg.text}
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ 
        background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', zIndex: 10 
      }}>
        <div style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 30, padding: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
          <input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="הודעה..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '0 16px', fontSize: 16 }}
          />
          <motion.button 
            whileTap={{ scale: 0.9 }} onClick={sendMessage}
            style={{ width: 44, height: 44, background: '#fff', color: '#000', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: newMessage.trim() ? 1 : 0.5 }}
          >
            <Send size={20} style={{ transform: 'translateX(-2px)' }} />
          </motion.button>
        </div>
      </div>

    </div>
  );
}
