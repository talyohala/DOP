import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { ChevronRight, Send, User, MessageSquare } from 'lucide-react';

export default function ChatScreen({ currentUser, onClose, targetUserId }) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // נורת בקרה ל-Realtime
  const [isConnected, setIsConnected] = useState(false);
  
  const activeChatRef = useRef(activeChat);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
    
    // יצירת ערוץ ייחודי וחדש כדי למנוע ניתוקים
    const channelName = `chat_sync_${currentUser.id}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dop_messages' }, 
      (payload) => {
        const msg = payload.new;
        const currentActive = activeChatRef.current;
        
        // רענון רשימת השיחות בצד תמיד
        fetchConversations();

        // אם אנחנו בתוך השיחה שקיבלה את ההודעה
        if (currentActive && (msg.sender_id === currentActive.id || msg.receiver_id === currentActive.id)) {
          setMessages(prev => {
            // מניעת כפילות אם זה כבר על המסך (Optimistic UI)
            if (prev.find(m => m.id === msg.id || m.content === msg.content)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        }
      }
    ).subscribe((status) => {
      // עדכון נורת הבקרה לפי סטטוס החיבור
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [currentUser]);

  useEffect(() => {
    if (targetUserId) {
      supabase.from('dop_users').select('*').eq('id', targetUserId).single()
        .then(({ data }) => {
          if (data) {
            setActiveChat(data);
            fetchMessages(data.id);
          }
        });
    }
  }, [targetUserId]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('dop_messages')
      .select(`id, content, created_at, sender_id, receiver_id, sender:dop_users!sender_id(id, username, avatar_url), receiver:dop_users!receiver_id(id, username, avatar_url)`)
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const chats = [];
      const seen = new Set();
      data.forEach(m => {
        const other = m.sender_id === currentUser.id ? m.receiver : m.sender;
        if (other && !seen.has(other.id)) {
          seen.add(other.id);
          chats.push({ ...other, lastMessage: m.content, time: m.created_at });
        }
      });
      setConversations(chats);
    }
    setLoading(false);
  };

  const fetchMessages = async (otherId) => {
    const { data } = await supabase
      .from('dop_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    scrollToBottom();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const content = newMessage;
    setNewMessage('');

    // Optimistic UI - הוספה מיידית למסך
    const tempMsg = {
      tempId: Date.now(),
      sender_id: currentUser.id,
      receiver_id: activeChat.id,
      content: content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    // שמירה בשרת
    const { error } = await supabase.from('dop_messages').insert({
      sender_id: currentUser.id,
      receiver_id: activeChat.id,
      content: content
    });

    if (error) {
      toast.error(`שגיאה בשליחה: ${error.message}`);
      setMessages(prev => prev.filter(m => m.tempId !== tempMsg.tempId));
      setNewMessage(content);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#030303] text-white flex flex-col font-sans" dir="rtl">
      <div className="bg-[#0a0a0a] border-b border-white/10 p-5 flex items-center justify-between shadow-lg relative">
        <div className="flex items-center gap-3">
          {activeChat && <button onClick={() => setActiveChat(null)} className="ml-2 bg-white/5 p-2 rounded-full active:scale-90"><ChevronRight size={20}/></button>}
          <div className="relative">
            <MessageSquare size={24} className="text-emerald-400" />
            {/* נורת הבקרה של ה-Realtime */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
          </div>
          <h1 className="text-xl font-black">{activeChat ? activeChat.username : 'הודעות'}</h1>
        </div>
        <button onClick={onClose} className="bg-white/10 p-3 rounded-[16px] active:scale-90"><ChevronRight size={20} /></button>
      </div>

      {!activeChat ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversations.map(chat => (
            <div key={chat.id} onClick={() => { setActiveChat(chat); fetchMessages(chat.id); }} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[24px] flex items-center gap-4 active:scale-95 transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden">
                {chat.avatar_url ? <img src={chat.avatar_url} className="w-full h-full object-cover" /> : <User className="text-emerald-400" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center"><span className="font-black text-sm">{chat.username}</span></div>
                <p className="text-xs text-white/50 truncate font-medium">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={msg.id || msg.tempId || i} className={`flex ${msg.sender_id === currentUser.id ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-[24px] ${msg.sender_id === currentUser.id ? 'bg-emerald-600 rounded-tr-none' : 'bg-[#1a1a1a] rounded-tl-none border border-white/5'}`}>
                  <p className="text-sm font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-[#0a0a0a] border-t border-white/5 pb-10">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="הקלד הודעה..." className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-full px-6 py-4 text-sm outline-none focus:border-emerald-500/50" />
              <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"><Send size={20} className="text-white -ml-1" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
