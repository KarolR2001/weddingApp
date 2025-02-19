import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Typy
interface User {
  id: number;
  email: string;
  userType: 'admin' | 'couple' | 'vendor';
  status: string;
  created_at: string;
  lastLoginAt: string | null;
}

interface Category {
  category_id: number;
  categoryName: string;
}

interface RecipientsState {
  users: User[];
  categories: Category[];
  statuses: string[];
  userIds: number[]; // Przechowuje ID użytkowników na podstawie filtrów
  selectedRecipientType: 'all' | 'individual' | 'group' | null; // Wybrany typ odbiorcy
  selectedIndividualUser: number | null; // Wybrany użytkownik dla "Indywidualne konto"
  selectedGroupFilters: {
    userType?: 'vendor' | 'couple';
    categoryId?: number | null;
    status?: 'active' | 'blocked' | 'deleted' | null;
  }; // Filtry dla grupy odbiorców
  loading: boolean;
  error: string | null;
}

const initialState: RecipientsState = {
  users: [],
  categories: [],
  statuses: ['active', 'blocked', 'deleted'], // Można dostosować na podstawie aplikacji
  userIds: [], // Domyślnie brak ID użytkowników
  selectedRecipientType: null, // Domyślnie brak wybranego typu
  selectedIndividualUser: null, // Domyślnie brak wybranego użytkownika
  selectedGroupFilters: {}, // Domyślne filtry grupowe
  loading: false,
  error: null,
};


// Thunk: Pobieranie użytkowników
export const fetchUsers = createAsyncThunk(
  'recipients/fetchUsers',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        params: { page, limit },
      });
      return response.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Błąd pobierania użytkowników.');
    }
  }
);

// Thunk: Pobieranie kategorii
export const fetchCategories = createAsyncThunk(
  'recipients/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/names');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Błąd pobierania kategorii.');
    }
  }
);
export const fetchUserIdsByFilters = createAsyncThunk(
  'recipients/fetchUserIdsByFilters',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/ids', {
        params: filters,
      });
      return response.data.userIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Błąd pobierania ID użytkowników.');
    }
  }
);


// Slice
const recipientsSlice = createSlice({
  name: 'recipients',
  initialState,
  reducers: {
    setRecipientType(state, action: PayloadAction<'all' | 'individual' | 'group' | null>) {
      state.selectedRecipientType = action.payload;
      if (action.payload !== 'individual') {
        state.selectedIndividualUser = null;
      }
    },
    setIndividualUser(state, action: PayloadAction<number | null>) {
      state.selectedIndividualUser = action.payload;
    },
    setGroupFilters(state, action: PayloadAction<Partial<RecipientsState['selectedGroupFilters']>>) {
      state.selectedGroupFilters = { ...state.selectedGroupFilters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Nieznany błąd';
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Nieznany błąd';
      })
      .addCase(fetchUserIdsByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserIdsByFilters.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.userIds = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserIdsByFilters.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Błąd';
      });
  },
});

export const { setRecipientType, setIndividualUser, setGroupFilters } = recipientsSlice.actions;

export default recipientsSlice.reducer;