import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Input1.module.css';

interface Input1Props {
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  filteredCities: { placeName: string; adminName2: string }[]; // Zmiana: Dodajemy powiat
  onCitySelect: (city: string) => void; // Funkcja obsługująca wybór miasta
}

const Input1: React.FC<Input1Props> = ({ placeholder, value = '', onChange, filteredCities, onCitySelect }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsDropdownOpen(true); // Otwórz dropdown po wpisaniu tekstu
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} ref={inputRef}>
      <input
        type="text"
        className={styles.inputField}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
      />

      {isDropdownOpen && filteredCities.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredCities.map((city, index) => (
            <li
              key={index}
              className={styles.dropdownItem}
              onClick={() => {
                setInputValue(city.placeName);
                onCitySelect(city.placeName);
                setIsDropdownOpen(false); // Zamknij dropdown po wybraniu miasta
              }}
            >
              <span className={styles.cityName}>{city.placeName}</span>,   <span/> 
              <span className={styles.adminName2}>{city.adminName2}</span> {/* Wyświetlamy powiat */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Input1;
