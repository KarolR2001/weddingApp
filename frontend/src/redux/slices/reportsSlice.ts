import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Report {
  reportId: number;
  reportName: string;
  reportType: string;
  created_at: string;
  reportData: object;
}

interface ReportsState {
  reports: Report[];
  totalReports: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  search: string;
}

const initialState: ReportsState = {
  reports: [],
  totalReports: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  search: '',
};

// Async thunk: Pobieranie raportów
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async ({ page, search }: { page: number; search: string }) => {
    const response = await axios.get(`http://localhost:5000/api/reports?page=${page}&limit=15&search=${search}`);
    return response.data;
  }
);

// Async thunk: Generowanie nowego raportu
export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (reportType: string) => {
    const response = await axios.post('http://localhost:5000/api/reports/generated-reports', { reportType });
    return response.data.report;
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload.reports;
        state.totalReports = action.payload.totalReports;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(fetchReports.rejected, (state) => {
        state.loading = false;
        state.error = 'Nie udało się pobrać raportów.';
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
      });
  },
});

export const { setSearch } = reportsSlice.actions;
export default reportsSlice.reducer;
