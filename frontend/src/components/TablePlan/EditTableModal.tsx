import React, { useState } from 'react';
import styles from '../../styles/Couple/ControlPanel.module.css';
import Input2 from '../forms/Input2';
import Dropdown4 from '../Dropdown4';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { unassignGuest } from '../../redux/slices/tablePlanSlice';
import { Guest, Table } from '../../redux/slices/tablePlanSlice';
import { ReactComponent as RoundTableIcon } from '../../assets/roundTable.svg';
import { ReactComponent as RectangularTableIcon } from '../../assets/rectangularTable.svg';

interface EditTableModalProps {
  table: Table;
  onClose: () => void;
  onSave: (updatedTable: Partial<Table>) => void;
}

const EditTableModal: React.FC<EditTableModalProps> = ({ table, onClose, onSave }) => {
  const [tableName, setTableName] = useState(table.tableName);
  const [tableShape, setTableShape] = useState<'round' | 'rectangular'>(table.tableShape);
  const [maxGuests, setMaxGuests] = useState(table.maxGuests);
  const [showWarning, setShowWarning] = useState(false);
  const [excessGuests, setExcessGuests] = useState<Guest[]>([]);
  const dispatch: AppDispatch = useDispatch();

  const handleSave = () => {
    if (maxGuests < table.guests.length) {
      const guestsToRemove = table.guests.slice(maxGuests);
      setExcessGuests(guestsToRemove);
      setShowWarning(true); // Wyświetl modal z ostrzeżeniem
    } else {
      onSave({ tableName, tableShape, maxGuests });
      onClose();
    }
  };

  const confirmSave = () => {
    // Usuń nadmiarowych gości
    excessGuests.forEach((guest) => {
      dispatch(unassignGuest({ tableId: table.tableId, guestId: guest.guestId }));
    });

    // Zapisz zmienione dane
    onSave({ tableName, tableShape, maxGuests });
    setShowWarning(false);
    onClose();
  };

  const handleShapeChange = (value: string) => {
    setTableShape(value === 'Okrągły' ? 'round' : 'rectangular');
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {!showWarning ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>Edytuj Stół</h2>
              <button className={styles.addButton} onClick={handleSave}>
                Zapisz
              </button>
            </div>
            <div className={styles.form}>
              <div className={styles.inputGroup}>
                <Input2
                  placeholder="Wpisz nazwę stołu *"
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  isValid={!!tableName}
                  errorMessage="Nazwa stołu jest wymagana"
                />
              </div>
              <div className={styles.inputGroup}>
                <Dropdown4
                  placeholder="Wybierz kształt stołu *"
                  options={['Okrągły', 'Prostokątny']}
                  onSelect={handleShapeChange}
                  value={tableShape === 'round' ? 'Okrągły' : 'Prostokątny'}
                  isValid={!!tableShape}
                  errorMessage="Kształt stołu jest wymagany"
                />
              </div>
              <div className={styles.inputGroup}>
                <Input2
                  placeholder="Wpisz maksymalną liczbę osób *"
                  type="number"
                  value={maxGuests.toString()}
                  onChange={(e) => setMaxGuests(parseInt(e.target.value) || 0)}
                  isValid={maxGuests > 0}
                  errorMessage="Liczba osób musi być większa od 0"
                />
              </div>
              <div className={styles.tablePreview}>
                {tableShape === 'rectangular' ? <RectangularTableIcon /> : <RoundTableIcon />}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.form}>
            <h3 className={styles.warningTitle}>Przekroczono maksymalną liczbę miejsc !!!</h3>
            <p className={styles.warningMessage}>
              Liczba przypisanych gości przekracza nową maksymalną liczbę miejsc. Goście dodani jako
              ostatni zostaną usunięci z listy. Czy na pewno chcesz kontynuować?
            </p>
            <div className={styles.warningActions}>
              <button className={styles.cancelButton} onClick={() => setShowWarning(false)}>
                Anuluj
              </button>
              <button className={styles.confirmButton} onClick={confirmSave}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTableModal;
