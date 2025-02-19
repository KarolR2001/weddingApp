import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationSetting {
  settingId: number;
  userId: number;
  notificationType: 'email' | 'sms' | 'app';
  eventType:
    | 'account_change'
    | 'new_device_login'
    | 'payment_reminder'
    | 'new_review'
    | 'monthly_report'
    | 'new_message'
    | 'new_activity';
  isEnabled: boolean;
}

interface VendorProfile {
  vendorId: number;
  companyName: string;
  serviceCategoryId: number | null;
  locationCity: string | null;
  offersNationwideService: boolean;
  googleCalendarId: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: {
    id: number;
    userType: 'vendor' | 'couple' | 'admin';
    email: string;
    phoneNumber: string;
    status: string;
    created_at: string;
    updated_at: string;
    notificationSettings: NotificationSetting[];
    vendorProfile?: VendorProfile | null;
    coupleProfile?: any; // Możesz określić dokładny typ danych dla coupleProfile
  } | null;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserState["user"]; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUserDetails: (state, action: PayloadAction<UserState["user"]>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = action.payload;
      }
      
    },
    updateWeddingDate: (state, action: PayloadAction<string>) => {
      if (state.user?.coupleProfile) {
        const updatedUser = {
          ...state.user,
          coupleProfile: {
            ...state.user.coupleProfile,
            weddingDate: action.payload, // Aktualizacja weddingDate
          },
        };
    
        // Zapisz nowego użytkownika do localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
    
        // Opcjonalnie: jeśli chcesz, aby Redux nie czekał na odświeżenie, możesz ustawić:
        state.user = updatedUser;
      } else {
        console.warn("Brak `coupleProfile` w stanie użytkownika. Sprawdź inicjalizację stanu Redux.");
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, setUserDetails, updateWeddingDate, logout } = userSlice.actions;
export default userSlice.reducer;