import React, { useState } from 'react';
import styles from '../styles/Toggle.module.css';

interface ToggleProps {
    isOn: boolean;
    onToggle: (isOn: boolean) => void;
  }
  
  const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
    const handleToggle = () => {
      onToggle(!isOn);
    };
  
    return (
      <div
        className={`${styles.toggleContainer} ${isOn ? styles.on : styles.off}`}
        onClick={handleToggle}
      >
        <div className={styles.toggleCircle}>
          {isOn ? null : <div className={styles.innerCircle}></div>}
        </div>
      </div>
    );
  };
  
  export default Toggle;
