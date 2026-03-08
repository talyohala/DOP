import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const CommentsOverlay = ({ videoId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
      fetchComments();
    };
    init();

    const channel = supabase.channel(`comments_${videoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dop_comments', filter: `video_id=eq.${videoId}` }, payload => {
        fetchComments();
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, [videoId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('dop_comments')
      .select('*, dop_users(username, has_halo)')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });
      
    if (error) console.error("Error fetching comments:", error);
    if (data) setComments(data);
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!userId) {
      return toast.error('שגיאה: לא מחובר למערכת', { style: { background: '#18181b', color: '#fff' }});
    }

    setSending(true);
    try {
      const { error } = await supabase.from('dop_comments').insert({
        video_id: videoId,
        user_id: userId,
        content: newComment.trim()
      });

      if (error) throw error;
      setNewComment('');
    } catch (error) { 
      console.error('Send error:', error);
      toast.error('שגיאה בשליחת תגובה: ' + error.message, { style: { background: '#18181b', color: '#ef4444' }});
    } finally { 
      setSending(false); 
    }
  };

  if (!document.body) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex flex-col justify-end" dir="rtl" onClick={onClose}>
      <div 
        className="w-full h-[65vh] bg-[#121212] rounded-t-[2rem] flex flex-col shadow-[0_-10px_50px_rgba(0,0,0,0.8)] border-t border-white/5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/5 shrink-0 bg-[#121212] rounded-t-[2rem]">
          <h3 className="font-black text-lg text-white">תגובות ({comments.length})</h3>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-[#050505]">
          {loading ? (
            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-white/30" size={32} /></div>
          ) : comments.length === 0 ? (
            <div className="text-center mt-10 text-white/30 font-bold">היה הראשון להגיב!</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-white/5 p-3 rounded-2xl w-fit max-w-[85%]">
                <span className={`text-xs font-black ${comment.dop_users?.has_halo ? 'text-yellow-400' : 'text-gray-400'}`}>@{comment.dop_users?.username || 'אנונימי'}</span>
                <p className="text-sm mt-1 text-white">{comment.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-[#121212] border-t border-white/5 shrink-0 pb-6">
          <div className="flex items-center gap-3 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסף תגובה..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm outline-none focus:border-white/30 transition-all text-white placeholder-white/40"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || sending}
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-black active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:shadow-none shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-1" />}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CommentsOverlay;
