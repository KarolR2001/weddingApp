import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Typy dla powiadomień
interface Notification {
    notificationId: number;
    title: string | null;
    message: string;
    recipientsGroup: string | null;
    notificationType: 'email' | 'sms' | 'app';
    sentAt: string;
    status: 'sent' | 'pending' | 'failed';
  }
  
  // Stan początkowy dla slice'a
  interface AdminNotificationsState {
    notifications: Notification[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    search: string;
    sortBy: string;
    order: string;
    loading: boolean;
    error: string | null;
    notificationDetails: Notification | null;
  }
  
  const initialState: AdminNotificationsState = {
    notifications: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    search: '',
    sortBy: 'sentAt',
    order: 'DESC',
    loading: false,
    error: null,
    notificationDetails: null,
  };

// Thunk: Pobieranie powiadomień
export const fetchAdminNotifications = createAsyncThunk(
    'adminNotifications/fetchNotifications',
    async (
      { page, search, sortBy, order }: { page: number; search: string; sortBy: string; order: string },
      { rejectWithValue }
    ) => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/notifications', {
          params: { page, search, sortBy, order },
        });
        return response.data;
      } catch (error: any) {
        console.error('Błąd podczas pobierania powiadomień:', error);
        return rejectWithValue(error.response?.data?.message || 'Błąd pobierania powiadomień.');
      }
    }
  );

// Thunk: Usuwanie powiadomienia
export const deleteAdminNotification = createAsyncThunk(
  'adminNotifications/deleteNotification',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/notifications/${id}`);
      return id;
    } catch (error: any) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
      return rejectWithValue(error.response?.data?.message || 'Błąd usuwania powiadomienia.');
    }
  }
);

// Thunk: Dodawanie powiadomienia
export const addAdminNotification = createAsyncThunk(
  'adminNotifications/addNotification',
  async (
    data: { title: string; message: string; notificationType: string; recipientsGroup?: string; recipientIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/notifications', data);
      return response.data;
    } catch (error: any) {
      console.error('Błąd podczas dodawania powiadomienia:', error);
      return rejectWithValue(error.response?.data?.message || 'Błąd dodawania powiadomienia.');
    }
  }
);

// Thunk: Ponowne wysyłanie powiadomienia
export const resendAdminNotification = createAsyncThunk(
  'adminNotifications/resendNotification',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/notifications/resend/${id}`);
      return id;
    } catch (error: any) {
      console.error('Błąd podczas ponownego wysyłania powiadomienia:', error);
      return rejectWithValue(error.response?.data?.message || 'Błąd ponownego wysyłania powiadomienia.');
    }
  }
);
export const fetchNotificationDetails = createAsyncThunk(
  'adminNotifications/fetchNotificationDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Błąd podczas pobierania szczegółów powiadomienia:', error);
      return rejectWithValue(error.response?.data?.message || 'Błąd pobierania szczegółów powiadomienia.');
    }
  }
);

const adminNotificationsSlice = createSlice({
  name: 'adminNotifications',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
        state.search = action.payload;
      },
      setSort: (state, action: PayloadAction<{ sortBy: string; order: string }>) => {
        state.sortBy = action.payload.sortBy;
        state.order = action.payload.order;
      },
  },
  extraReducers: (builder) => {
    builder
      // Pobieranie powiadomień
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action: PayloadAction<any>) => {
        const { notifications, totalCount, currentPage, totalPages } = action.payload;
        state.notifications = notifications;
        state.totalCount = totalCount;
        state.currentPage = currentPage;
        state.totalPages = totalPages;
        state.loading = false;
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Usuwanie powiadomień
      .addCase(deleteAdminNotification.fulfilled, (state, action: PayloadAction<number>) => {
        state.notifications = state.notifications.filter((n) => n.notificationId !== action.payload);
        state.totalCount -= 1;
      })
      // Dodawanie powiadomień
      .addCase(addAdminNotification.fulfilled, (state, action: PayloadAction<any>) => {
        state.notifications = [action.payload.notification, ...state.notifications];
        state.totalCount += 1;
      })
      // Ponowne wysyłanie powiadomień
      .addCase(resendAdminNotification.fulfilled, (state, action: PayloadAction<number>) => {
        const notification = state.notifications.find((n) => n.notificationId === action.payload);
        if (notification) {
          notification.status = 'sent'; // Możesz zmienić status na `sent` lub inny odpowiedni
        }
      })
      .addCase(fetchNotificationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = null;
        state.notificationDetails = action.payload; // Przechowujemy szczegóły
      })
      .addCase(fetchNotificationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage, setSearch, setSort } = adminNotificationsSlice.actions;
export default adminNotificationsSlice.reducer;
