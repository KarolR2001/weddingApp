import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import filtersReducer from './slices/filtersSlice';  
import reviewsReducer from './slices/reviewsSlice';
import activeComponentReducer from './slices/activeComponentSlice';  
import calendarReducer from './slices/calendarSlice';
import guestListReducer from './slices/guestListSlice';
import tablePlanReducer from './slices/tablePlanSlice';
import usersReducer from './slices/usersSlice';
import messagesReducer from './slices/messagesSlice';
import notificationsReducer from './slices/notificationsSlice';
import adminNotificationsReducer from './slices/adminNotificationsSlice';
import recipientsReducer from './slices/recipientsSlice';
import adminStatsReducer from './slices/adminStatsSlice';
import reportsReducer from './slices/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,  // Reduktor dla autoryzacji
    user: userReducer,  // Reduktor dla użytkownika
    filters: filtersReducer,  // Reduktor dla filtrów
    reviews: reviewsReducer,
    activeComponent: activeComponentReducer,
    calendar: calendarReducer,
    guestList: guestListReducer,
    tablePlan: tablePlanReducer,
    users: usersReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    adminNotifications: adminNotificationsReducer,
    recipients: recipientsReducer,
    adminStats: adminStatsReducer,
    reports: reportsReducer,
  }
});

// Typowanie dla store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
