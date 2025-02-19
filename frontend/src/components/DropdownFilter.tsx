import React from 'react';
import styles from '../styles/DropdownFilter.module.css';
import Dropdown1 from './Dropdown1';  // Używamy stworzonego przez Ciebie komponentu Dropdown1

interface DropdownFilterProps {
  label: string;
  options: { id: string; name: string }[];
  selectedOption: string;
  onSelect: (id: string) => void;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ label, options, selectedOption, onSelect }) => {
  const handleSelect = (optionName: string) => {
    const selected = options.find(option => option.name === optionName);
    if (selected) {
      onSelect(selected.id);  // Przekazujemy ID wybranej opcji
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}:</div>
      <Dropdown1
        label={selectedOption || 'Wybierz opcję'}
        options={options.map(option => option.name)}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default DropdownFilter;
