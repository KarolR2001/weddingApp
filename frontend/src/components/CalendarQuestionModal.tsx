import React from 'react';
import styles from '../styles/CalendarQuestionModal.module.css';
import Button1 from './Button1';
import Button2 from './Button2';

interface CalendarQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

const CalendarQuestionModal: React.FC<CalendarQuestionModalProps> = ({ isOpen, onClose, onYes, onNo }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Czy chcesz uzupełnić kalendarz terminów?</h2>
        <div className={styles.buttonContainer}>
          <Button1 label="Nie" onClick={onNo} />
          <Button2 label="Tak" onClick={onYes} />
        </div>
      </div>
    </div>
  );
};

export default CalendarQuestionModal; 