import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return null;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // In production with EAS project ID, getExpoPushTokenAsync fetches token
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        return tokenData.data;
      } catch {
        return 'local_push_token_mock';
      }
    } catch {
      return null;
    }
  }

  async sendLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch {
      // Fallback
    }
  }
}

export const notificationService = new NotificationService();

