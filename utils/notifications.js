import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Notification permissions are required for reminders to work!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

// Schedule a notification for a reminder
export async function scheduleReminderNotification(reminder) {
  if (!reminder || !reminder.notificationDate) {
    console.error('Invalid reminder data for notification scheduling');
    return null;
  }

  const trigger = new Date(reminder.notificationDate);

  // Check if the date is valid
  if (isNaN(trigger.getTime())) {
    console.error('Invalid notification date:', reminder.notificationDate);
    return null;
  }

  // Don't schedule if the date is in the past
  if (trigger <= new Date()) {
    console.log('Reminder date is in the past, not scheduling notification');
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PingWards Reminder',
        body: reminder.text,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    console.log('Scheduled notification with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelReminderNotification(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Cancelled notification:', notificationId);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all scheduled notifications');
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled;
}

// Handle notification response (snooze/dismiss)
export function setupNotificationResponseHandler(onResponse) {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { actionIdentifier, notification } = response;

    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // Notification tapped
      onResponse?.('tap', notification);
    } else if (actionIdentifier === 'snooze') {
      // Snooze action
      onResponse?.('snooze', notification);
    } else if (actionIdentifier === 'dismiss') {
      // Dismiss action
      onResponse?.('dismiss', notification);
    }
  });

  return subscription;
}

// Setup notification categories for actions
export async function setupNotificationCategories() {
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('reminder', [
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 10min',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          isDestructive: true,
          isAuthenticationRequired: false,
        },
      },
    ]);
  } else if (Platform.OS === 'android') {
    // Android handles actions differently, but we can still use categories
    await Notifications.setNotificationCategoryAsync('reminder', [
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze',
        options: {},
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {},
      },
    ]);
  }
}
