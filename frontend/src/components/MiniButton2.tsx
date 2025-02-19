import React from 'react';
import styles from '../styles/MiniButton2.module.css';

interface MiniButton2Props {
  label: string;
  onClick: () => void;
}

const MiniButton2: React.FC<MiniButton2Props> = ({ label, onClick }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default MiniButton2;
