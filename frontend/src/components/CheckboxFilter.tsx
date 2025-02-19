import React from 'react';
import styles from '../styles/CheckboxFilter.module.css';
import Checkbox from './Checkbox';  // Używamy stworzonego wcześniej komponentu Checkbox

interface CheckboxFilterProps {
  label: string;
  options: { id: string; name: string; checked: boolean }[];
  onOptionChange: (id: string) => void;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ label, options, onOptionChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}:</div>
      {options.map((option) => (
        <div key={option.id} className={styles.option}>
          <Checkbox
            label={option.name}
            checked={option.checked}
            onChange={() => onOptionChange(option.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default CheckboxFilter;
