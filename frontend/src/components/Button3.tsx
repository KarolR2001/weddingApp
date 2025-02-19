import React from 'react';
import styles from '../styles/Button3.module.css';

interface Button3Props {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;  // Nowa właściwość dla ikony
}

const Button3: React.FC<Button3Props> = ({ label, onClick, icon }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}  {/* Wyświetl ikonkę jeśli jest */}
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default Button3;
