import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { setDatesStatusMap  } from '../../redux/slices/calendarSlice';
import { setViewSidebar } from '../../redux/slices/activeComponentSlice';
import styles from '../../styles/Vendor/VendorCalendarDetails.module.css';
import MonthCalendarComponent from '../../components/VendorMonthCalendarComponent';

const SERVER_URL = "http://localhost:5000";

interface CalendarEntry {
  calendarId: number;
  date: string;
  availabilityStatus: 'booked' | 'reserved';
}

interface Listing {
  listingId: number;
  title: string;
  city: string;
  calendarEntries: CalendarEntry[];
}

const VendorCalendarDetails: React.FC = () => {

  const listingId = useSelector((state: RootState) => state.activeComponent.selectedListingId);
  const datesStatusMap = useSelector((state: RootState) => state.calendar.datesStatusMap);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setViewSidebar('details'))
  }, [dispatch]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/listings/listing/${listingId}`);
        const calendarEntries = response.data.calendarEntries;
        setListing(response.data)
        const mappedDates = calendarEntries.map((entry: any) => ({
          date: entry.date,
          availabilityStatus: entry.availabilityStatus,
        }));

        dispatch(setDatesStatusMap(mappedDates));
      } catch (error) {
        console.error('Błąd podczas pobierania danych kalendarza:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [listingId, dispatch]);

  if (isLoading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner />
      </div>
    );
  }

  if (!listingId) {
    return <p>Nie znaleziono oferty.</p>;
  }

  const currentDate = new Date();

  const generateMonths = () => {
    const calendars = [];
    for (let i = 0; i < 12; i++) {
      const month = (currentDate.getMonth() + i) % 12;
      const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + i) / 12);

      calendars.push(
        <div key={`${year}-${month}`} className={styles.monthCalendar}>
          <MonthCalendarComponent
            month={month}
            year={year}
            
          />
        </div>
      );
    }
    return calendars;
  };

  return (
    <div className={styles.calendarDetailsContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.headerTitle}>Terminarz</div>
        <div className={styles.subHeader}>
            Ogłoszenie: {listing?.title || 'Nazwa ogłoszenia'}
        </div>
      </div>
      <div className={styles.legendContainer}>
      <div className={styles.legendItem}>
        <div className={styles.bookedIndicator}></div>
        <div className={styles.legendText}>Termin zajęty</div>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.reservedIndicator}></div>
        <div className={styles.legendText}>Rezerwacja</div>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.freeIndicator}></div>
        <div className={styles.legendText}>Termin wolny</div>
      </div>
    </div>
      <div className={styles.calendarsContainer}>{generateMonths()}</div>
    </div>
  );
};

export default VendorCalendarDetails;
