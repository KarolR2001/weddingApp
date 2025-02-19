import React, { useState } from 'react';
import styles from '../../styles/Couple/AddGuestRow.module.css';
import GroupDropdown from './GroupDropdown'; // Importujemy wcześniej stworzony komponent
import { RootState } from '../../redux/store';

interface AddGuestRowProps {
  onAddGuest: (guest: { name: string; status: 'invited' | 'confirmed' | 'declined'; group: string }) => void;
}

const AddGuestRow: React.FC<AddGuestRowProps> = ({ onAddGuest }) => {
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState<'invited' | 'confirmed' | 'declined' | ''>('');
  const [selectedGroup, setSelectedGroup] = useState(''); // Przechowuje wybraną grupę

  const handleAdd = () => {
    if (!guestName || !status || !selectedGroup) {
      alert('Wszystkie pola są wymagane!');
      return;
    }

    onAddGuest({ name: guestName, status, group: selectedGroup });
    setGuestName('');
    setStatus('');
    setSelectedGroup('');
  };

  return (
    <div className={styles.rowContainer}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Wpisz Imię i Nazwisko *"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.dropdownContainer}>
        <select
          className={styles.dropdownStatus}
          value={status}
          onChange={(e) => setStatus(e.target.value as 'invited' | 'confirmed' | 'declined')}
        >
          <option value="">Wybierz status *</option>
          <option value="invited">Zaproszony</option>
          <option value="confirmed">Potwierdzony</option>
          <option value="declined">Odmówił</option>
        </select>
      </div>
      <div className={styles.dropdownContainer}>
        {/* Zamiast zwykłego dropdown używamy komponentu GroupDropdown */}
        <GroupDropdown
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup} // Obsługuje wybór grupy
        />
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.addButton} onClick={handleAdd}>
          Dodaj
        </button>
      </div>
    </div>
  );
};

export default AddGuestRow;
