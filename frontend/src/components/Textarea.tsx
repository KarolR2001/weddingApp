import React, { useRef, useEffect } from 'react';
import styles from '../styles/Textarea.module.css';

interface TextareaProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isValid?: boolean;
  maxLength?: number;
}

const Textarea: React.FC<TextareaProps> = ({ placeholder, value, onChange, isValid = true, maxLength }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      e.currentTarget.value = value.substring(0, start) + '\t' + value.substring(end);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1;
      onChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); 
  }, [value]);

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        className={`${styles.textareaField} ${!isValid ? styles.invalidPlaceholder : ''}`}
        value={value}
        onChange={(e) => {
          onChange(e);
          adjustTextareaHeight();
        }}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={maxLength}
      />
      <div className={`${styles.inputLine} ${!isValid ? styles.invalidLine : ''}`}></div>
      {!isValid && <span className={styles.errorText}>* Pole jest wymagane</span>}
      
      {maxLength && (
        <div className={styles.charCount}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default Textarea;
