import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// הפונקציה שמפעילה את הבוסט מול השרת
export const executeBoost = async (dropId, minutes = 5) => {
  const { data, error } = await supabase.rpc('boost_drop', {
    drop_id: dropId,
    added_minutes: minutes
  });
  
  if (error) {
    if (error.message.includes('Not enough')) {
      alert('אין לך מספיק מטבעות! כנס לשוק השחור.');
    }
    throw error;
  }
  
  return data;
};
