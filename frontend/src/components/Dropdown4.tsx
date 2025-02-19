import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Dropdown4.module.css';
import IconDown from '../assets/angle-down.svg';

interface Dropdown4Props {
  placeholder: string;
  options: string[];
  onSelect: (option: string) => void;
  value?: string; // Opcjonalna wartość
  isValid?: boolean; // Czy dropdown jest poprawny
  errorMessage?: string; // Wiadomość błędu
}

const Dropdown4: React.FC<Dropdown4Props> = ({
  placeholder,
  options = [],
  onSelect,
  value = '',
  isValid = true,
  errorMessage = '* Pole jest wymagane',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  // Zamknięcie dropdown, gdy klikniemy poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        className={`${styles.dropdownWrapper} ${!isValid ? styles.invalid : ''}`}
        onClick={toggleDropdown}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={value} // Wyświetlana wartość
          readOnly
          className={`${styles.input} ${!isValid ? styles.invalidInput : ''}`}
        />
        <img
          src={IconDown}
          alt="dropdown icon"
          className={`${styles.caretIcon} ${isOpen ? styles.rotated : ''}`}
        />
      </div>
      {isOpen && options.length > 0 && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option)} // Obsługa kliknięcia
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {!isValid && <span className={styles.errorText}>{errorMessage}</span>}
    </div>
  );
};

export default Dropdown4;
