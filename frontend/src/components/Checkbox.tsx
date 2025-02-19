import React from 'react';
import styles from '../styles/Checkbox.module.css';
import checkIcon from '../assets/check.svg';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
    return (
      <div className={styles.checkboxWrapper}>
        <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`} onClick={onChange}>
          {checked && <img src={checkIcon} alt="checked" className={styles.checkIcon} />}
        </div>
        <div className={styles.label}>{label}</div>
      </div>
    );
  };
  

export default Checkbox;
