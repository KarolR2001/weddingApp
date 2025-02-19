import React, { useState } from 'react';
import styles from '../../styles/Couple/ControlPanel.module.css';
import Input2 from '../forms/Input2';
import Dropdown4 from '../Dropdown4';
import { ReactComponent as RoundTableIcon } from '../../assets/roundTable.svg';
import { ReactComponent as RectangularTableIcon } from '../../assets/rectangularTable.svg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { addTable } from '../../redux/slices/tablePlanSlice';

interface AddTableModalProps {
  onClose: () => void;
}

const AddTableModal: React.FC<AddTableModalProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const coupleId = user?.coupleProfile?.coupleId;
  const [tableName, setTableName] = useState('');
  const [tableShape, setTableShape] = useState<'Okrągły' | 'Prostokątny' | ''>('');
  const [maxGuests, setMaxGuests] = useState('');
  const [isNameValid, setIsNameValid] = useState(true);
  const [isShapeValid, setIsShapeValid] = useState(true);
  const [isGuestsValid, setIsGuestsValid] = useState(true);

  const handleAddTable = () => {
    const isValid = validateForm();
    if (isValid) {
      const newTable = {
        coupleId: coupleId, 
        tableName,
        tableShape: tableShape === 'Okrągły' ? 'round' : 'rectangular',
        maxGuests: parseInt(maxGuests, 10),
      };
      dispatch(addTable(newTable));
      onClose();
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!tableName) {
      setIsNameValid(false);
      isValid = false;
    } else {
      setIsNameValid(true);
    }

    if (!tableShape) {
      setIsShapeValid(false);
      isValid = false;
    } else {
      setIsShapeValid(true);
    }

    if (!maxGuests || isNaN(parseInt(maxGuests, 10)) || parseInt(maxGuests, 10) <= 0) {
      setIsGuestsValid(false);
      isValid = false;
    } else {
      setIsGuestsValid(true);
    }

    return isValid;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTableName(value);
    if (value) {
      setIsNameValid(true); // Walidacja w czasie rzeczywistym
    }
  };

  const handleShapeChange = (value: string) => {
    setTableShape(value as 'Okrągły' | 'Prostokątny');
    if (value) {
      setIsShapeValid(true); // Walidacja w czasie rzeczywistym
    }
  };

  const handleMaxGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Akceptuje tylko cyfry
      setMaxGuests(value);
      if (value && parseInt(value, 10) > 0) {
        setIsGuestsValid(true); // Walidacja w czasie rzeczywistym
      }
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose} // Zamknięcie modala przy kliknięciu poza obszarem
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Zatrzymanie propagacji kliknięcia
      >
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>Dodaj stół</h2>
          <button className={styles.addButton} onClick={handleAddTable}>
            + Dodaj
          </button>
        </div>
        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <Input2
              placeholder="Wpisz nazwę stołu *"
              type="text"
              value={tableName}
              onChange={handleNameChange}
              isValid={isNameValid}
              errorMessage="Nazwa stołu jest wymagana"
            />
          </div>
          <div className={styles.inputGroup}>
            <Dropdown4
              placeholder="Wybierz kształt stołu *"
              options={['Okrągły', 'Prostokątny']}
              onSelect={handleShapeChange}
              value={tableShape}
              isValid={isShapeValid}
              errorMessage="Kształt stołu jest wymagany"
            />
          </div>
          <div className={styles.inputGroup}>
            <Input2
              placeholder="Wpisz maksymalna ilość osób przy stole *"
              type="text"
              value={maxGuests}
              onChange={handleMaxGuestsChange}
              isValid={isGuestsValid}
              errorMessage="Liczba miejsc musi być liczbą większą od 0"
            />
          </div>
          <div className={styles.tablePreview}>
            {tableShape === 'Prostokątny' ? <RectangularTableIcon /> : <RoundTableIcon />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;
