import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const SERVER_URL = "http://localhost:5000";

export const fetchCalendarData = createAsyncThunk(
  'calendar/fetchCalendarData',
  async (listingId: number, { dispatch }) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/calendar/${listingId}`);
      const calendarEntries = response.data;

      // Przekształcenie danych na format dla Redux
      const formattedData = calendarEntries.map((entry: { date: string; availabilityStatus: string }) => ({
        date: entry.date,
        status: entry.availabilityStatus as 'available' | 'booked' | 'reserved',
      }));

      
    } catch (error) {
      console.error('Błąd podczas pobierania danych kalendarza:', error);
    }
  }
);
