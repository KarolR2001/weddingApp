import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Dropdown3.module.css';
import IconDown from '../assets/caret-down.svg';

interface Dropdown3Props {
  countryCode?: string;
  options: string[];
  onSelect: (option: string) => void;
}

const Dropdown3: React.FC<Dropdown3Props> = ({ countryCode = '+48', options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(countryCode); // Set initial selected value to countryCode
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option: string) => {
    setSelectedOption(option); // Set the selected option as the display value
    onSelect(option);
    setIsOpen(false); // Close dropdown after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.dropdownWrapper} onClick={toggleDropdown}>
        <div className={styles.countryCode}>{selectedOption}</div> {/* Show selected option */}
        <img src={IconDown} alt="dropdown icon" className={styles.caretIcon} />
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown3;
