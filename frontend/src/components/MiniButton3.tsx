import React from 'react';
import styles from '../styles/MiniButton3.module.css';

interface MiniButton3Props {
  label: string;
  onClick: () => void;
}

const MiniButton3: React.FC<MiniButton3Props> = ({ label, onClick }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default MiniButton3;
