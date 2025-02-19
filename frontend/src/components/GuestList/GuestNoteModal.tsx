import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { closeModal, updateGuest } from '../../redux/slices/guestListSlice';
import styles from '../../styles/Couple/GuestRow.module.css';
import Button2 from '../Button2';
import Button1 from '../Button1';

const GuestNoteModal: React.FC = () => {
  const dispatch = useDispatch();
  const selectedGuest = useSelector((state: RootState) => state.guestList.selectedGuest);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (selectedGuest) {
      setNote(selectedGuest.notes || ''); // Synchronizuj notatkę z Redux
    }
  }, [selectedGuest]);
  const handleSave = () => {
    if (selectedGuest) {
      dispatch(
        updateGuest({
          guestId: selectedGuest.guestId,
          updates: { notes: note },
        }) as any // Tymczasowe obejście, jeśli nadal występuje błąd typów
      );
    }
    dispatch(closeModal());
  };

  if (!selectedGuest) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>{selectedGuest.guestName}</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Dodaj lub edytuj notatkę..."
          className={styles.textarea}
        />
    <div className={styles.buttons}>
          <Button2 label="Zapisz" onClick={handleSave} />
          <Button1 label="Anuluj" onClick={() => dispatch(closeModal())} />
        </div>
      </div>
    </div>
  );
};

export default GuestNoteModal;
