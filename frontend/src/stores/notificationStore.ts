import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useAuthStore } from '@/stores/authStore';

export interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'visit' | 'unlike';
  message: string;
  timestamp: number;
  read: boolean;
  userId?: number;
  db?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          timestamp: Date.now(),
          read: false,
          ...notificationData,
        };

        const oldNotifications = useNotificationStore.getState().notifications;
        const { user } = useAuthStore.getState();

        if (notificationData.userId && user && notificationData.userId === user.id) {
          
          if (oldNotifications[oldNotifications.length - 1]?.timestamp + 100 < newNotification.timestamp || newNotification.db ||
            oldNotifications.length === 0
          ) {
            set((state) => {
              const updated = [...state.notifications, newNotification];
              // console.log("Updated notifications:", updated);
              const unreadCount = updated.filter(n => !n.read).length;
              return {
                notifications: updated,
                unreadCount,
                error: null,
              };
            });
          } else {
            // console.log("Notification ignored due to timestamp proximity", oldNotifications[oldNotifications.length - 1]?.timestamp, newNotification.timestamp);
          }
        } else {
          // console.log("Notification ignored due to wrong id", user?.id, notificationData.userId);
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          const unreadCount = updated.filter(n => !n.read).length;
          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const updated = state.notifications.filter(notification => notification.id !== id);
          const unreadCount = updated.filter(n => !n.read).length;
          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
          error: null,
        });
      },

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length;
        set({
          notifications,
          unreadCount,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      reset: () => {
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: 'NotificationStore' }
  )
);

export type { NotificationStore };