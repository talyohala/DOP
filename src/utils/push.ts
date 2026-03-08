export const initPushNotifications = async () => {
  // בודק אם הדפדפן/מכשיר תומך בהתראות
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('התראות פוש לא נתמכות במכשיר זה');
    return false;
  }

  try {
    // רישום קובץ הרקע
    await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker נרשם בהצלחה');

    // בקשת אישור מהמשתמש
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('המשתמש סירב לקבל התראות');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בהפעלת התראות:', error);
    return false;
  }
};

// פונקציה להקפצת התראה מקומית (למשל כשמישהו שולח לך הודעה בזמן שאתה באפליקציה)
export const sendLocalNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { 
      body, 
      vibrate: [200, 100, 200]
    });
  }
};
