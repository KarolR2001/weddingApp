import React, { useState, useEffect } from 'react';
import styles from '../styles/CustomSlider.module.css';

interface CustomSliderProps {
  min: number;
  max: number;
  initialValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, initialValue, onChange, disabled }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={`${styles.slider} ${disabled ? styles.sliderDisabled : ''}`}
        style={{
          background: disabled ? '#d0d0d0' : `linear-gradient(to right, #C3937C ${percentage}%, #EAD9C9 ${percentage}%)`
        }}
        disabled={disabled}
      />


      <div className={styles.valueLabel} style={{ color: disabled ? '#7a7a7a' : 'inherit' }}>
        {value} km
      </div>
    </div>
  );
};

export default CustomSlider;
