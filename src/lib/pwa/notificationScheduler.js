import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import PushSubscription from '@/lib/models/PushSubscription';
import webpush from 'web-push';

/**
 * Calculate typical meal time from last 7 entries
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Time in HH:MM format or null
 */
export async function calculateTypicalMealTime(userId) {
  try {
    await dbConnect();

    // Get last 7 entries with firstMealTime
    const entries = await Entry.find({
      userId,
      startTime: { $exists: true, $ne: null },
    })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    if (entries.length === 0) {
      console.log(`No entries found for user ${userId}`);
      return null;
    }

    // Extract meal times and convert to minutes since midnight
    const mealTimes = entries
      .map((entry) => {
        if (!entry.startTime) return null;
        
        // Parse time (format: "HH:MM")
        const [hours, minutes] = entry.startTime.split(':').map(Number);
        return hours * 60 + minutes;
      })
      .filter((time) => time !== null);

    if (mealTimes.length === 0) {
      return null;
    }

    // Calculate average
    const averageMinutes = Math.round(
      mealTimes.reduce((sum, time) => sum + time, 0) / mealTimes.length
    );

    // Subtract 60 minutes for reminder (1 hour before)
    let reminderMinutes = averageMinutes - 60;

    // Handle edge case: if reminder would be before midnight, set to start of day
    if (reminderMinutes < 0) {
      reminderMinutes = 0;
    }

    // Convert back to HH:MM format with zero-padding
    const hours = Math.floor(reminderMinutes / 60);
    const minutes = reminderMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    console.log(
      `✓ Calculated typical meal time for user ${userId}: ${timeString} (from ${mealTimes.length} entries)`
    );

    return timeString;
  } catch (error) {
    console.error('Error calculating typical meal time:', error);
    return null;
  }
}

/**
 * Check if it's time to send a reminder
 * @param {string} scheduledTime - Time in HH:MM format
 * @param {number} toleranceMinutes - Tolerance window (default 5 minutes)
 * @returns {boolean}
 */
export function isTimeToSend(scheduledTime, toleranceMinutes = 5) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
  const scheduledMinutes = schedHours * 60 + schedMinutes;

  // Check if current time is within tolerance window
  return (
    currentMinutes >= scheduledMinutes &&
    currentMinutes < scheduledMinutes + toleranceMinutes
  );
}

/**
 * Format notification payload
 * @param {string} type - Notification type
 * @param {object} data - Additional data
 * @returns {object} Notification payload
 */
export function formatNotificationPayload(type, data = {}) {
  const payloads = {
    fastingReminder: {
      title: '🕐 Fasting Window Starting Soon',
      body: 'Your typical fasting window starts in 1 hour. Prepare your last meal!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'fasting-reminder',
      requireInteraction: false,
      data: {
        url: '/entries',
        type: 'fasting-reminder',
        ...data,
      },
    },
    dailyStreak: {
      title: '🔥 Daily Streak Update',
      body: `Great job! You're on a ${data.streak}-day streak. Keep it up!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'daily-streak',
      requireInteraction: false,
      data: {
        url: '/entries',
        type: 'daily-streak',
        ...data,
      },
    },
    weeklyReport: {
      title: '📊 Your Weekly Fasting Report',
      body: `This week: ${data.completedDays} fasting days. Total: ${data.totalHours} hours.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'weekly-report',
      requireInteraction: true,
      data: {
        url: '/entries',
        type: 'weekly-report',
        ...data,
      },
    },
  };

  return payloads[type] || payloads.fastingReminder;
}

/**
 * Send push notification to a user
 * @param {object} subscription - Push subscription object
 * @param {object} payload - Notification payload
 * @returns {Promise<boolean>} True if sent successfully
 */
export async function sendPushNotification(subscription, payload) {
  try {
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || 'your-email@example.com'}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Format subscription for web-push library
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    // Send notification
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 3600, // 1 hour
        urgency: 'normal',
      }
    );

    console.log('✓ Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);

    // Handle subscription expiration
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired, removing from database');
      
      try {
        await dbConnect();
        await PushSubscription.findOneAndDelete({
          endpoint: subscription.endpoint,
        });
        console.log('✓ Expired subscription removed');
      } catch (dbError) {
        console.error('Error removing expired subscription:', dbError);
      }
    }

    return false;
  }
}

/**
 * Schedule and send notifications for eligible users
 * Called by cron job every 5 minutes
 * @returns {Promise<{ sent: number, failed: number }>} Results
 */
export async function scheduleNotifications() {
  try {
    await dbConnect();

    // Get all active subscriptions with fasting reminder enabled
    const subscriptions = await PushSubscription.find({
      'preferences.fastingWindowReminder': true,
    }).lean();

    console.log(`Found ${subscriptions.length} subscriptions with reminders enabled`);

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        // Calculate typical meal time for this user
        const mealTime = await calculateTypicalMealTime(subscription.userId.toString());

        if (!mealTime) {
          console.log(`No meal time calculated for user ${subscription.userId}`);
          continue;
        }

        // Check if it's time to send (within 5-minute window)
        if (!isTimeToSend(mealTime, 5)) {
          continue;
        }

        // Format notification payload
        const payload = formatNotificationPayload('fastingReminder', {
          userId: subscription.userId.toString(),
        });

        // Send notification
        const success = await sendPushNotification(subscription, payload);

        if (success) {
          sent++;
          
          // Update lastNotificationAt timestamp
          await PushSubscription.findByIdAndUpdate(subscription._id, {
            lastNotificationAt: new Date(),
          });
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription._id}:`, error);
        failed++;
      }
    }

    console.log(`Notification scheduling complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return { sent: 0, failed: 0 };
  }
}

