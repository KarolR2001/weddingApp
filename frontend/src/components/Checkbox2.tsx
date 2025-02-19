import React from 'react';
import styles from '../styles/Checkbox2.module.css';
import checkIcon from '../assets/check.svg';

interface Checkbox2Props {
  label: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}

const Checkbox2: React.FC<Checkbox2Props> = ({ label, checked, onChange }) => {
    return (
      <div className={styles.checkboxWrapper}>
        <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`} onClick={onChange}>
          {checked && <img src={checkIcon} alt="checked" className={styles.checkIcon} />}
        </div>
        <div className={styles.label}>{label}</div>
      </div>
    );
  };
  

export default Checkbox2;
