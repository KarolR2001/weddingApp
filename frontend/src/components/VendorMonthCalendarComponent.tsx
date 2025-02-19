import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDate, removeDate } from '../redux/slices/calendarSlice';
import styles from '../styles/Vendor/VendorMonthCalendarComponent.module.css';
import { RootState } from '../redux/store';
import axios from 'axios';

interface VendorMonthCalendarProps {
    month: number;
    year: number;
  }

  const VendorMonthCalendarComponent: React.FC<VendorMonthCalendarProps> = ({ month, year }) => {
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);
    const [dropdownDate, setDropdownDate] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const datesStatusMap = useSelector((state: RootState) => state.calendar.datesStatusMap);
    const token = useSelector((state: RootState) => state.auth.token);
    const listingId = useSelector((state: RootState) => state.activeComponent.selectedListingId);
    const dispatch = useDispatch();

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pobierz token i listingId z Redux
  

  const daysOfWeek = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (dateKey: string) => {
    setDropdownDate(dropdownDate === dateKey ? null : dateKey);
  };
  const handleDropdownAction = async (dateKey: string, action: 'add' | 'delete', status?: 'booked' | 'reserved') => {
    try {
      if (action === 'add' && status) {
        dispatch(addDate({ date: dateKey, availabilityStatus: status }));
      } else if (action === 'delete') {
        dispatch(removeDate(dateKey));
      }

      await axios.post(
        'http://localhost:5000/api/calendar/modify',
        {
          action,
          listingId,
          date: dateKey,
          availabilityStatus: status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDropdownDate(null);
    } catch (error) {
      console.error('Błąd podczas modyfikacji terminu:', error);
    }
  };

  const renderDropdown = (dateKey: string, status: 'booked' | 'reserved' | undefined) => (
    <div ref={dropdownRef} className={styles.dropdown}>
      {status !== 'booked' && (
        <div className={styles.dropdownItem} onClick={() => handleDropdownAction(dateKey, 'add', 'booked')}>
          Zajmij termin
        </div>
      )}
      {status !== 'reserved' && (
        <div className={styles.dropdownItem} onClick={() => handleDropdownAction(dateKey, 'add', 'reserved')}>
          Zarezerwuj termin
        </div>
      )}
      <div className={styles.dropdownItem} onClick={() => handleDropdownAction(dateKey, 'delete')}>
        Usuń termin
      </div>
    </div>
  );
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear) || 7;
    const totalCells = 42; // 6 rows * 7 days for a full grid
    const days = [];
  
    // Days from the previous month
    const prevMonthDays = firstDayOfMonth - 1;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevMonthYear);
  
    for (let i = prevMonthDays; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const dateKey = `${prevMonthYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
      const dateStatus = datesStatusMap[dateKey];
      const statusClass = dateStatus ? styles[dateStatus] : styles.emptyDay;
  
      const tooltipText =
        dropdownDate === dateKey
          ? '' // Ukryj tooltip, jeśli dropdown jest otwarty
          : dateStatus === 'booked'
          ? 'Zajęty'
          : dateStatus === 'reserved'
          ? 'Zarezerwowany'
          : 'Wolny';
  
      days.push(
        <div
          key={`prev-${day}`}
          className={`${styles.emptyDay} ${statusClass}`}
          data-tooltip={tooltipText}
        >
          <span>{day}</span>
        </div>
      );
    }
  
    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
      const dateStatus = datesStatusMap[dateKey];
      const statusClass = dateStatus ? styles[dateStatus] : '';
      const isDropdownOpen = dropdownDate === dateKey;
  
      const tooltipText =
        isDropdownOpen
          ? '' // Ukryj tooltip, jeśli dropdown jest otwarty
          : dateStatus === 'booked'
          ? 'Zajęty'
          : dateStatus === 'reserved'
          ? 'Zarezerwowany'
          : 'Wolny';
  
      days.push(
        <div
          key={day}
          className={`${styles.day} ${statusClass}`}
          data-tooltip={tooltipText}
          onClick={() => setDropdownDate(dateKey)}
        >
          <span>{day}</span>
          {isDropdownOpen && renderDropdown(dateKey, dateStatus)}
        </div>
      );
    }
  
    // Days from the next month
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const dateKey = `${currentYear}-${(currentMonth + 2).toString().padStart(2, '0')}-${i
        .toString()
        .padStart(2, '0')}`;
      const dateStatus = datesStatusMap[dateKey];
      const statusClass = dateStatus ? styles[dateStatus] : styles.emptyDay;
  
      const tooltipText =
        dropdownDate === dateKey
          ? '' // Ukryj tooltip, jeśli dropdown jest otwarty
          : dateStatus === 'booked'
          ? 'Zajęty'
          : dateStatus === 'reserved'
          ? 'Zarezerwowany'
          : 'Wolny';
  
      days.push(
        <div
          key={`next-${i}`}
          className={`${styles.emptyDay} ${statusClass}`}
          data-tooltip={tooltipText}
        >
          <span>{i}</span>
        </div>
      );
    }
  
    return days;
  };
  
  
  

  const formatMonthYear = (year: number, month: number) => {
    const date = new Date(year, month);
    return date
      .toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <div onClick={handlePreviousMonth} className={styles.navArrow}>
          &lt;
        </div>
        <div className={styles.monthYear}>{formatMonthYear(currentYear, currentMonth)}</div>
        <div onClick={handleNextMonth} className={styles.navArrow}>
          &gt;
        </div>
      </div>
      <div className={styles.weekDays}>
        {daysOfWeek.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.days}>{renderDays()}</div>
    </div>
  );
};

export default VendorMonthCalendarComponent;
