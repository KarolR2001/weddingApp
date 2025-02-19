import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Guest {
  guestId: number;
  coupleId: number;
  guestName: string;
  guestStatus: 'invited' | 'confirmed' | 'declined';
  groupId?: number;
  notes?: string;
}

interface Group {
  groupId: number;
  coupleId: number;
  groupName: string;
}

interface GuestState {
  guests: Guest[];
  groups: Group[];
  searchTerm: string;
  selectedGuest: Guest | null;
  isModalOpen: boolean;
  sortOrder: { column: 'name' | 'status' | 'group'; direction: 'asc' | 'desc' } | null;
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guests: [],
  groups: [],
  searchTerm: '',
  selectedGuest: null,
  isModalOpen: false,
  sortOrder: null,
  loading: false,
  error: null,
};

// Async Thunks for API calls

export const fetchGuests = createAsyncThunk(
  'guests/fetchGuests',
  async (coupleId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/guests/${coupleId}`);
      return response.data.guestList; // Zakładamy, że odpowiedź to lista gości
    } catch (error) {
      return rejectWithValue('Nie udało się pobrać listy gości.');
    }
  }
);

export const fetchGroups = createAsyncThunk(
  'guests/fetchGroups',
  async (coupleId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/guests/groups/${coupleId}`);
      return response.data.guestGroups; // Zakładamy, że odpowiedź to lista grup
    } catch (error) {
      return rejectWithValue('Nie udało się pobrać listy grup.');
    }
  }
);

export const addGuest = createAsyncThunk(
  'guests/addGuest',
  async (newGuest: Omit<Guest, 'guestId'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/guests/add', newGuest);
      return response.data; // Zakładamy, że odpowiedź to dodany gość
    } catch (error) {
      return rejectWithValue('Nie udało się dodać gościa.');
    }
  }
);

export const updateGuest = createAsyncThunk(
  'guests/updateGuest',
  async ({ guestId, updates }: { guestId: number; updates: Partial<Guest> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/guests/${guestId}`, updates);
      return { guestId, updates }; // Zakładamy, że API nie zwraca całej listy gości
    } catch (error) {
      return rejectWithValue('Nie udało się zaktualizować danych gościa.');
    }
  }
);

export const deleteGuest = createAsyncThunk(
  'guests/deleteGuest',
  async (guestId: number, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/guests/${guestId}`);
      return guestId; // Zwrot ID usuniętego gościa
    } catch (error) {
      return rejectWithValue('Nie udało się usunąć gościa.');
    }
  }
);

export const addGroup = createAsyncThunk(
  'guests/addGroup',
  async (newGroup: Omit<Group, 'groupId'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/guests/group/add', newGroup);
      return response.data; // Zakładamy, że odpowiedź to dodana grupa
    } catch (error) {
      return rejectWithValue('Nie udało się dodać grupy.');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'guests/deleteGroup',
  async (groupId: number, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/guests/group/${groupId}`);
      return groupId; // Zwrot ID usuniętej grupy
    } catch (error) {
      return rejectWithValue('Nie udało się usunąć grupy.');
    }
  }
);
export const selectFilteredGuests = createSelector(
    [(state: RootState) => state.guestList.guests, (state: RootState) => state.guestList.searchTerm],
    (guests, searchTerm) => {
      if (!searchTerm) return guests; // Jeśli searchTerm jest pusty, zwróć wszystkich gości
      return guests.filter((guest) =>
        guest.guestName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );
  
// Slice Definition

const guestSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
        state.searchTerm = action.payload;
      },
      openModal(state, action: PayloadAction<number>) {
        const guest = state.guests.find((g) => g.guestId === action.payload);
        state.selectedGuest = guest || null;
        state.isModalOpen = true;
      },
      closeModal(state) {
        state.isModalOpen = false;
        state.selectedGuest = null;
      },
      sortGuests(state, action: PayloadAction<{ column: 'name' | 'status' | 'group' }>) {
        const { column } = action.payload;
      
        // Toggle between 'asc' and 'desc'
        const direction =
          state.sortOrder?.column === column && state.sortOrder.direction === 'asc' ? 'desc' : 'asc';
      
        state.sortOrder = { column, direction };
      
        // Sort logic
        state.guests.sort((a, b) => {
          let valA: string = '';
          let valB: string = '';
      
          // Dopasuj klucze do nazw kolumn
          if (column === 'name') {
            valA = a.guestName || ''; // Domyślna wartość pustego stringa
            valB = b.guestName || ''; // Domyślna wartość pustego stringa
          } else if (column === 'status') {
            valA = a.guestStatus || ''; // Domyślna wartość pustego stringa
            valB = b.guestStatus || ''; // Domyślna wartość pustego stringa
          } else if (column === 'group') {
            const groupA = state.groups.find((group) => group.groupId === a.groupId);
            const groupB = state.groups.find((group) => group.groupId === b.groupId);
            valA = groupA?.groupName || ''; // Domyślna wartość pustego stringa
            valB = groupB?.groupName || ''; // Domyślna wartość pustego stringa
          }
      
          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      },
      setLoading(state, action: PayloadAction<boolean>) {
        state.loading = action.payload;
      },
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.guests = action.payload;
        state.loading = false;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.groups = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(addGuest.fulfilled, (state, action) => {
        const { newGuest } = action.payload; // Ekstrakcja danych nowego gościa
        if (newGuest) {
          state.guests.push({
            ...newGuest,
            group: state.groups.find((g) => g.groupId === newGuest.groupId) || {
              groupId: newGuest.groupId,
              groupName: 'Nieznana grupa',
            },
          });
        }
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        const { guestId, updates } = action.payload;
        const index = state.guests.findIndex((guest) => guest.guestId === guestId);
        if (index !== -1) {
          state.guests[index] = { ...state.guests[index], ...updates };
        }
      })
      .addCase(deleteGuest.fulfilled, (state, action: PayloadAction<number>) => {
        state.guests = state.guests.filter((guest) => guest.guestId !== action.payload);
      })
      .addCase(addGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.groups.push(action.payload);
      })
      .addCase(deleteGroup.fulfilled, (state, action: PayloadAction<number>) => {
        state.groups = state.groups.filter((group) => group.groupId !== action.payload);
      });
  },
});

export default guestSlice.reducer;
export const { setSearchTerm, openModal, closeModal, sortGuests, setLoading } = guestSlice.actions;

