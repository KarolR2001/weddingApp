import React from 'react';
import styles from '../../styles/Input2.module.css';

interface Input2Props {
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValid?: boolean;
  errorMessage?: string;
}

const Input2: React.FC<Input2Props> = ({
  placeholder,
  type,
  value,
  onChange,
  isValid = true,
  errorMessage = '* Pole jest wymagane'
}) => {
  return (
    <div className={styles.container}>
      <input
        className={`${styles.inputField} ${!isValid ? styles.invalidPlaceholder : ''}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className={`${styles.inputLine} ${!isValid ? styles.invalidLine : ''}`}></div>
      {!isValid && <span className={styles.errorText}>{errorMessage}</span>}
    </div>
  );
};

export default Input2;
