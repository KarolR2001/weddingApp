import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Notification {
  notificationId: number;
  message: string;
  isRead: boolean;
}

interface NotificationsState {
  notifications: {
    notification: Notification;
    isRead: boolean;
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

// Pobranie powiadomień
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      return response.data.notifications;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Błąd podczas pobierania powiadomień');
    }
  }
);

// Oznaczenie powiadomienia jako przeczytane
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ userId, notificationId }: { userId: number; notificationId: number }, { rejectWithValue }) => {
    try {
      await axios.post('http://localhost:5000/api/notifications/mark-as-read', { userId, notificationId });
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Błąd podczas oznaczania powiadomienia jako przeczytanego');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        // Rozpakowanie danych, aby uprościć strukturę
        state.notifications = action.payload.map((n: any) => ({
          notification: {
            notificationId: n.notification.notificationId,
            message: n.notification.message,
            isRead: n.isRead,
          },
          isRead: n.isRead,
        }));
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find((n) => n.notification.notificationId === notificationId);
        if (notification) {
          notification.isRead = true;
        }
      });
  },
});

export default notificationsSlice.reducer;
