import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../redux/store';

// Typ użytkownika
export interface User {
  id: number;
  email: string;
  userType: 'vendor' | 'couple' | 'admin';
  status: 'active' | 'blocked' | 'deactivated' | 'deleted';
  created_at: string;
  lastLoginAt: string | null;
}

// Typ stanu
interface UsersState {
  users: User[];
  pagination: {
    totalPages: number;
    totalUsers: number;
  };
  searchQuery: string;
  loading: boolean;
  sortColumn: 'email' | 'userType' | 'status' | 'created_at' | 'lastLoginAt' |null;
  sortOrder: 'asc' | 'desc' | null;
}

// Początkowy stan
const initialState: UsersState = {
  users: [],
  pagination: { totalPages: 1, totalUsers: 0 },
  searchQuery: '',
  loading: false,
  sortColumn: null,
  sortOrder: null,
};

// AsyncThunk: Pobranie użytkowników
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ({ page, searchQuery }: { page: number; searchQuery: string }) => {
      const response = await axios.get(`http://localhost:5000/api/users?page=${page}&search=${searchQuery}`);
      return response.data as { users: User[]; pagination: UsersState['pagination'] };
    }
  );

// AsyncThunk: Aktualizacja statusu użytkownika
export const updateUserStatus = createAsyncThunk(
    'users/updateUserStatus',
    async (
      { userId, status }: { userId: number; status: string },
      { getState }
    ) => {
      const state = getState() as RootState; 
      const token = state.auth.token; 
      const response = await axios.put(
        `http://localhost:5000/api/users/status`,
        { userId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      return response.data as { user: User };
    }
  );

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    sortUsers(state, action: PayloadAction<{ column: keyof User; order: 'asc' | 'desc' }>) {
      const { column, order } = action.payload;

      // Sortowanie użytkowników
      state.users.sort((a, b) => {
        const valueA = a[column] as string | number;
        const valueB = b[column] as string | number;

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; pagination: UsersState['pagination'] }>) => {
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUserStatus.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) state.users[index] = updatedUser;
      });
  },
});

export const { setSearchQuery, sortUsers } = usersSlice.actions;
export default usersSlice.reducer;
