import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DeviceTypeDistribution {
  mobile: number;
  desktop: number;
}

interface SystemStats {
  statId: number;
  totalUsers: number;
  activeUsers: number;
  couplesCount: number;
  vendorsCount: number;
  avgListingViews: string;
  mostActiveCategory: string;
  totalInquiries: number;
  mostActiveHour: string;
  mostActiveDay: string;
  deviceTypeDistribution: DeviceTypeDistribution;
  reportPeriod: string;
}

interface AdminStatsState {
  stats: SystemStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminStatsState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchSystemStats = createAsyncThunk('adminStats/fetchSystemStats', async () => {
  const response = await axios.get('http://localhost:5000/api/system-stats');
  return response.data.data[0];
});

const adminStatsSlice = createSlice({
  name: 'adminStats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.loading = false;
      })
      .addCase(fetchSystemStats.rejected, (state) => {
        state.loading = false;
        state.error = 'Nie udało się pobrać statystyk.';
      });
  },
});

export default adminStatsSlice.reducer;
