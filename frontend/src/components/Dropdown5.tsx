import React, { useState } from 'react';
import styles from '../styles/Dropdown5.module.css';
import angleDownIcon from '../assets/angle-down.svg';

interface Dropdown5Props {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const Dropdown5: React.FC<Dropdown5Props> = ({ label, options, onSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div
      className={`${styles.dropdownWrapper} ${disabled ? styles.disabled : ''}`}
      onClick={toggleDropdown}
    >
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownLabel}>{selectedOption || label}</span>
        <img src={angleDownIcon} alt="Toggle Dropdown" className={styles.dropdownIcon} />
      </div>
      {isOpen && !disabled && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.option}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown5;