import React from 'react';
import styles from '../styles/Button2.module.css';

interface Button2Props {
  label: string;
  onClick: () => void;
}

const Button2: React.FC<Button2Props> = ({ label, onClick }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default Button2;
