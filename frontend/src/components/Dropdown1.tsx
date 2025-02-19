import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Dropdown1.module.css';
import { ReactComponent as DropdownIcon } from '../assets/angle-down.svg';  // Import ikony

interface Dropdown1Props {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
}

const Dropdown1: React.FC<Dropdown1Props> = ({ label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);  // Przechowywanie wybranej opcji
  const dropdownRef = useRef<HTMLDivElement>(null);  // Ref do elementu dropdownu

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);  // Ustaw wybraną opcję
    onSelect(option);  // Wywołaj funkcję `onSelect` przekazaną jako props
    setIsOpen(false);  // Zamknij dropdown po wybraniu opcji
  };

  // Nasłuchuj kliknięć poza dropdownem i zamknij, jeśli użytkownik kliknie gdzie indziej
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
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      {/* Główne pole dropdown z etykietą lub wybraną opcją */}
      <div className={styles.dropdownHeader} onClick={toggleDropdown}>
        <div className={styles.borderBox}></div>
        {/* Wyświetlaj wybraną opcję, jeśli jest, w przeciwnym razie etykietę */}
        <div className={styles.dropdownLabel}>
          {selectedOption ? selectedOption : label}
        </div>
        <div className={`${styles.iconContainer} ${isOpen ? styles.iconRotated : ''}`}>
          <DropdownIcon className={styles.icon} />
        </div>
      </div>

      {/* Menu rozwijane */}
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <li
              key={index}
              className={styles.dropdownItem}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown1;
