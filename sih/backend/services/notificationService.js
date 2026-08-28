const supabase = require('../utils/supabase');

class NotificationService {
  constructor() {
    this.interval = null;
    this.io = null;
  }

  init(io) {
    this.io = io;
  }

  start() {
    console.log('✅ Notification WebSocket Scheduler Started');
    // Check every hour (simplified for prototype, we'll run it every 1 minute for testing)
    this.interval = setInterval(() => this.checkAndSendNotifications(), 60 * 1000);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  async checkAndSendNotifications() {
    if (!this.io) return;

    try {
      // Fetch all users with notifications enabled
      const { data: users, error } = await supabase
        .from('users')
        .select('id, notification_enabled, mood_reminders, routine_reminders')
        .eq('notification_enabled', true);
        
      if (error || !users) return;
      
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      users.forEach(user => {
        // Send a demo reminder every minute for the prototype if they are connected
        if (currentMinute % 2 === 0 && user.mood_reminders) {
          this.sendPushNotification(user.id, "How are you feeling today? 🌱", "Take a moment to log your mood.");
        } else if (currentMinute % 2 !== 0 && user.routine_reminders) {
          this.sendPushNotification(user.id, "Time for your routine ☀️", "Don't forget to check off your tasks.");
        }
      });
      
    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  }

  sendPushNotification(userId, title, body) {
    if (!this.io) return;
    
    // Emit to the specific user's room
    this.io.to(`user_${userId}`).emit('notification', {
      title,
      body,
      timestamp: new Date()
    });
    
    console.log(`[WS PUSH] Emitted to user_${userId}: ${title}`);
  }
}

module.exports = new NotificationService();
