import React, { useState } from 'react';
import styles from '../styles/MonthCalendarComponent.module.css';

interface DateStatus {
  date: Date;
  status: 'available' | 'booked' | 'reserved';
}

interface MonthCalendarProps {
  month: number;
  year: number;
  datesStatusMap: Map<string, 'available' | 'booked' | 'reserved'>;
}

const MonthCalendarComponent: React.FC<MonthCalendarProps> = ({ month, year, datesStatusMap }) => {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

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

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear) || 7;
    const totalCells = 42; // 6 rows * 7 days for a full 5x7 grid
    const days = [];

    // Days from the previous month
    const prevMonthDays = firstDayOfMonth - 1;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevMonthYear);

    for (let i = prevMonthDays; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const dateKey = `${prevMonthYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dateStatus = datesStatusMap.get(dateKey);
      const statusClass = dateStatus ? styles[dateStatus] : '';
      const tooltipText = dateStatus === 'booked' ? 'Termin zajęty' : dateStatus === 'reserved' ? 'Termin zarezerwowany' : '';

      days.push(
        <div
          key={`prev-${day}`}
          className={`${styles.emptyDay} ${statusClass} ${tooltipText ? styles.tooltip : ''}`}
          data-tooltip={tooltipText}
        >
          <span>{day}</span>
        </div>
      );
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dateStatus = datesStatusMap.get(dateKey);
      const statusClass = dateStatus ? styles[dateStatus] : '';
      const tooltipText = dateStatus === 'booked' ? 'Termin zajęty' : dateStatus === 'reserved' ? 'Termin zarezerwowany' : '';

      days.push(
        <div
          key={day}
          className={`${styles.day} ${statusClass} ${tooltipText ? styles.tooltip : ''}`}
          data-tooltip={tooltipText}
        >
          <span>{day}</span>
        </div>
      );
    }

    // Days from the next month
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const dateKey = `${currentYear}-${(currentMonth + 2).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const dateStatus = datesStatusMap.get(dateKey);
      const statusClass = dateStatus ? styles[dateStatus] : '';
      const tooltipText = dateStatus === 'booked' ? 'Termin zajęty' : dateStatus === 'reserved' ? 'Termin zarezerwowany' : '';

      days.push(
        <div
          key={`next-${i}`}
          className={`${styles.emptyDay} ${statusClass} ${tooltipText ? styles.tooltip : ''}`}
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
    return date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
               .replace(/^\w/, c => c.toUpperCase()); // Capitalizes the first letter
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Terminy</h2>
      </div>
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <div onClick={handlePreviousMonth} className={styles.navArrow}>&lt;</div>
          <div className={styles.monthYear}>{formatMonthYear(currentYear, currentMonth)}</div>
          <div onClick={handleNextMonth} className={styles.navArrow}>&gt;</div>
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
    </div>
  );
};

export default MonthCalendarComponent;
