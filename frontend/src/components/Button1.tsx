import React from 'react';
import styles from '../styles/Button1.module.css';

interface Button1Props {
  label: string;
  onClick: () => void;
}

const Button1: React.FC<Button1Props> = ({ label, onClick }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default Button1;
