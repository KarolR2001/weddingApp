import React from 'react';
import styles from '../styles/PriceFilter.module.css';

interface PriceFilterProps {
  label: string;
  minValue: number | string;
  maxValue: number | string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ label, minValue, maxValue, onMinChange, onMaxChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}:</div>
      <div className={styles.priceInputs}>
        <div className={styles.priceInput}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Od"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
          />
        </div>
        <div className={styles.separator}>-</div>
        <div className={styles.priceInput}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Do"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
