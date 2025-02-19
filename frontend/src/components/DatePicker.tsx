import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import calendarIcon from '../assets/calendar.svg';
import styles from '../styles/DatePicker.module.css';

interface CustomDatePickerProps {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  isValid?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ placeholder, value, onChange, isValid = true }) => {
  const datePickerRef = useRef<DatePicker>(null); // Referencja do DatePicker

  const handleContainerClick = () => {
    datePickerRef.current?.setOpen(true); // Otwiera kalendarz po kliknięciu w kontener
  };

  return (
    <div className={styles.container}>
    <div
        className={`${styles.datePickerContainer} ${!isValid ? styles.invalidContainer : ''}`}
        onClick={handleContainerClick}
      >
        <DatePicker
          ref={datePickerRef}
          selected={value}
          onChange={onChange}
          placeholderText={placeholder}
          dateFormat="dd/MM/yyyy"
          className={`${styles.inputField} ${!isValid ? styles.invalidInput : ''}`}
        />
        <img src={calendarIcon} alt="Calendar Icon" className={styles.icon} />
      </div>
      {!isValid && <span className={styles.errorText}> * Data jest wymagana</span>} {/* Tekst błędu pod datownikiem */}
    </div>
  );
};

export default CustomDatePicker;
