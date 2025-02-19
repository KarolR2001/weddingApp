import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CalendarState {
  datesStatusMap: Record<string, 'booked' | 'reserved'>;
}

const initialState: CalendarState = {
  datesStatusMap: {},
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setDatesStatusMap: (state, action: PayloadAction<{ date: string; availabilityStatus: 'booked' | 'reserved' }[]>) => {
      action.payload.forEach(({ date, availabilityStatus }) => {
        state.datesStatusMap[date] = availabilityStatus;
      });
    },
    addDate: (state, action: PayloadAction<{ date: string; availabilityStatus: 'booked' | 'reserved' }>) => {
      state.datesStatusMap[action.payload.date] = action.payload.availabilityStatus;
    },
    removeDate: (state, action: PayloadAction<string>) => {
      delete state.datesStatusMap[action.payload];
    },
  },
});

export const { setDatesStatusMap, addDate, removeDate } = calendarSlice.actions;
export default calendarSlice.reducer;
