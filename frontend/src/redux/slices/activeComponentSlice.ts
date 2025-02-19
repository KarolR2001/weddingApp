import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveComponentState {
  component: string;
  viewSidebar: 'default' | 'details'; 
  selectedListingId?: number; 
}

const initialState: ActiveComponentState = {
  component: 'offers', 
  viewSidebar: 'default', 
  selectedListingId: undefined, 
};

const activeComponentSlice = createSlice({
  name: 'activeComponent',
  initialState,
  reducers: {
    // Ustawienie wszystkich pól jednocześnie
    setActiveComponent: (
      state,
      action: PayloadAction<{ component: string; viewSidebar?: 'default' | 'details'; selectedListingId?: number }>
    ) => {
      state.component = action.payload.component;
      state.viewSidebar = action.payload.viewSidebar ?? 'default';
    
      // Zachowaj poprzednią wartość selectedListingId, jeśli nie jest przekazane
      if (action.payload.selectedListingId !== undefined) {
        state.selectedListingId = action.payload.selectedListingId;
      }
    },

    // Aktualizacja tylko `viewSidebar`
    setViewSidebar: (
      state,
      action: PayloadAction<'default' | 'details'>
    ) => {
      state.viewSidebar = action.payload;
    },

    // Aktualizacja tylko `selectedListingId`
    setSelectedListingId: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.selectedListingId = action.payload;
    },
  },
});

export const { setActiveComponent, setViewSidebar, setSelectedListingId } = activeComponentSlice.actions;
export default activeComponentSlice.reducer;
