import api from './api';

export const getNotificationRoute = (notification) => {
  if (notification?.route) return notification.route;
  const type = (notification?.type || '').toLowerCase();
  const relType = (notification?.related_entity_type || '').toLowerCase();
  const title = (notification?.title || '').toLowerCase();
  const message = (notification?.message || '').toLowerCase();
  const combined = `${type} ${relType} ${title} ${message}`;

  if (combined.includes('risk') || combined.includes('prediction') || combined.includes('readmission')) {
    return '/risk-analyzer';
  }
  if (combined.includes('appointment') || combined.includes('reminder') || combined.includes('schedule')) {
    return '/appointments';
  }
  if (combined.includes('report') || combined.includes('download') || combined.includes('export')) {
    return '/reports';
  }
  if (combined.includes('patient') || combined.includes('care plan')) {
    return '/patients';
  }
  if (combined.includes('hospital') || combined.includes('analytics') || combined.includes('capacity')) {
    return '/analytics';
  }

  return '/dashboard/doctor';
};

export const formatNotificationTime = (createdAt) => {
  if (!createdAt) return 'Just now';
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

export const notificationService = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications/');
      const items = Array.isArray(response.data) ? response.data : [];
      return items.map((n) => ({
        ...n,
        time: formatNotificationTime(n.created_at),
        route: getNotificationRoute(n),
      }));
    } catch (err) {
      console.warn('Could not fetch notifications from backend:', err?.message || err);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data?.unread_count ?? 0;
    } catch (err) {
      console.warn('Could not fetch unread count:', err?.message || err);
      return 0;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (err) {
      console.warn(`Could not mark notification ${id} as read:`, err?.message || err);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (err) {
      console.warn('Could not mark all notifications as read:', err?.message || err);
      return { success: false, marked_count: 0 };
    }
  },

  getDetail: async (id) => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (err) {
      console.warn(`Could not fetch notification detail ${id}:`, err?.message || err);
      return null;
    }
  },
};

export default notificationService;
