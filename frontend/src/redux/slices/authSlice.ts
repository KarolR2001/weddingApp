import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface UserState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue('Nieudane logowanie. Sprawdź swoje dane.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    loadUserFromLocalStorage: (state) => {
      state.user = JSON.parse(localStorage.getItem('user') || 'null');
      state.token = localStorage.getItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.token;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { logout, loadUserFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;
