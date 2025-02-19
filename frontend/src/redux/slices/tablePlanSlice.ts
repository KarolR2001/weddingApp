import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Guest {
  guestId: number;
  guestName: string;
  guestStatus: 'invited' | 'confirmed' | 'declined';
  notes?: string;
}
interface Assignment {
    assignmentId: number;
    tableId: number;
    guestId: number;
    guest: Guest;
  }

export interface Table {
  tableId: number;
  tableName: string;
  tableShape: 'round' | 'rectangular';
  maxGuests: number;
  guests: Guest[];
  assignments?: Assignment[];
}

interface TablePlanState {
  tables: Table[];
  unassignedGuests: Guest[];
  loading: boolean;
  error: string | null;
  sortColumn: 'tableName' | 'maxGuests' | 'tableShape' | null;
  sortOrder: 'asc' | 'desc' | null;
}

const initialState: TablePlanState = {
  tables: [],
  unassignedGuests: [],
  loading: false,
  error: null,
  sortColumn: null,
  sortOrder: null,
};

// Async thunks

export const fetchTables = createAsyncThunk(
    'tablePlan/fetchTables',
    async (coupleId: number, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token'); // Pobierz token z localStorage
        const response = await axios.get(`http://localhost:5000/api/tables/${coupleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.tables;
      } catch (error) {
        return rejectWithValue('Failed to fetch tables.');
      }
    }
  );

  export const addTable = createAsyncThunk(
    'tablePlan/addTable',
    async (tableData: { coupleId: number; tableName: string; tableShape: string; maxGuests: number }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token'); // Pobierz token
        const response = await axios.post('http://localhost:5000/api/tables/add', tableData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.table;
      } catch (error) {
        return rejectWithValue('Failed to add table.');
      }
    }
  );

export const updateTable = createAsyncThunk(
  'tablePlan/updateTable',
  async ({ tableId, updates }: { tableId: number; updates: Partial<Table> }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/tables/${tableId}`, updates,
        {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      return { tableId, updates: response.data.table };
    } catch (error) {
      return rejectWithValue('Failed to update table.');
    }
  }
);

export const deleteTable = createAsyncThunk(
  'tablePlan/deleteTable',
  async (tableId: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tables/${tableId}`, 
        {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      return tableId;
    } catch (error) {
      return rejectWithValue('Failed to delete table.');
    }
  }
);

export const assignGuest = createAsyncThunk(
  'tablePlan/assignGuest',
  async ({ tableId, guestId }: { tableId: number; guestId: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/tables/assign', 
            { tableId, guestId }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
      return { tableId, guestId };
    } catch (error) {
      return rejectWithValue('Failed to assign guest.');
    }
  }
);

export const unassignGuest = createAsyncThunk(
  'tablePlan/unassignGuest',
  async ({ tableId, guestId }: { tableId: number; guestId: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tables/remove-assignment', 
        { tableId, guestId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { tableId, guestId };
    } catch (error) {
      return rejectWithValue('Failed to unassign guest.');
    }
  }
);

export const fetchUnassignedGuests = createAsyncThunk(
    'tablePlan/fetchUnassignedGuests',
    async (coupleId: number, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/tables/guests/${coupleId}/without-table`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        console.log(response.data.unassignedGuests); // Log the response
        return response.data.guests;
      } catch (error) {
        return rejectWithValue('Failed to fetch unassigned guests.');
      }
    }
  );
  

// Slice

const tablePlanSlice = createSlice({
  name: 'tablePlan',
  initialState,
  reducers: {
    sortTables: (state, action: PayloadAction<{ column: 'tableName' | 'maxGuests' | 'tableShape'; order: 'asc' | 'desc' }>) => {
      const { column, order } = action.payload;
      state.sortColumn = column;
      state.sortOrder = order;

      state.tables.sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action: PayloadAction<Table[]>) => {
        state.tables = action.payload.map((table) => ({
          ...table,
          guests: table.assignments?.map((assignment) => assignment.guest) || [], 
        }));
        state.loading = false;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTable.fulfilled, (state, action: PayloadAction<Table>) => {
        state.tables.push({ ...action.payload, guests: [] });
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const { tableId, updates } = action.payload;
        const table = state.tables.find((t) => t.tableId === tableId);
        if (table) Object.assign(table, updates);
      })
      .addCase(deleteTable.fulfilled, (state, action: PayloadAction<number>) => {
        state.tables = state.tables.filter((table) => table.tableId !== action.payload);
      })
      .addCase(assignGuest.fulfilled, (state, action) => {
        const { tableId, guestId } = action.payload;
        const table = state.tables.find((t) => t.tableId === tableId);
        const guestIndex = state.unassignedGuests.findIndex((g) => g.guestId === guestId);
      
        if (table && guestIndex !== -1) {
          // Tworzenie nowego przypisania
          const newAssignment = {
            assignmentId: Date.now(), // Tymczasowy ID, można zastąpić rzeczywistym z backendu
            tableId,
            guestId,
            guest: state.unassignedGuests[guestIndex],
          };
      
          // Aktualizacja assignments i guests
          table.assignments?.push(newAssignment);
          table.guests.push(state.unassignedGuests[guestIndex]);
      
          // Usunięcie gościa z listy nieprzypisanych
          state.unassignedGuests.splice(guestIndex, 1);
        }
      })
      .addCase(unassignGuest.fulfilled, (state, action) => {
        const { tableId, guestId } = action.payload;
        const table = state.tables.find((t) => t.tableId === tableId);
      
        if (table) {
          // Usunięcie przypisania z assignments
          table.assignments = table.assignments?.filter((assignment) => assignment.guestId !== guestId);
      
          // Usunięcie gościa z guests
          const guestIndex = table.guests.findIndex((g) => g.guestId === guestId);
          if (guestIndex !== -1) {
            state.unassignedGuests.push(table.guests[guestIndex]);
            table.guests.splice(guestIndex, 1);
          }
        }
      })
      .addCase(fetchUnassignedGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.unassignedGuests = action.payload || [];
      });
  },
});

export const { sortTables } = tablePlanSlice.actions;
export default tablePlanSlice.reducer;
