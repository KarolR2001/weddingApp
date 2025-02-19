import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import styles from '../../styles/Couple/GuestRow.module.css';
import { ReactComponent as OptionsIcon } from '../../assets/OptionsButton.svg';

interface GuestRowProps {
  guestName: string;
  status: string;
  group: string | null; // Grupa może być null
  onStatusChange: (newStatus: string) => void;
  onGroupChange: (newGroup: string) => void;
  onDelete: () => void;
  onNoteClick: () => void;
}

const GuestRow: React.FC<GuestRowProps> = ({
  guestName,
  status,
  group,
  onStatusChange,
  onGroupChange,
  onDelete,
  onNoteClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const groups = useSelector((state: RootState) => state.guestList.groups); // Pobranie grup z Redux

  const handleToggleMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 137; // Przybliżona wysokość menu (możesz dostosować).
      const viewportHeight = window.innerHeight;

      // Sprawdź, czy menu zmieści się poniżej
      const fitsBelow = rect.bottom + 5 + menuHeight <= viewportHeight;

      setMenuPosition({
        top: fitsBelow ? rect.bottom + 5 + window.scrollY : rect.top - menuHeight - 5 + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setIsMenuOpen((prev) => !prev);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuOptionClick = (option: string) => {
    if (option === 'Usuń') {
      onDelete();
    } else if (option === 'Notatka') {
      onNoteClick(); // Wywołanie prop onNoteClick
    }
    setIsMenuOpen(false); // Zamknięcie menu
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: 'rgba(195, 147, 124, 0.46)' };
      case 'invited':
        return { backgroundColor: 'rgba(234, 217, 201, 0.53)' };
      case 'declined':
        return { backgroundColor: 'rgba(120, 120, 120, 0.31)' };
      default:
        return {};
    }
  };

  return (
    <div className={styles.rowContainer}>
      <div className={styles.column}>
        <div className={styles.guestName}>{guestName}</div>
      </div>
      <div className={styles.column}>
        <select
          className={styles.statusDropdown}
          style={getStatusStyle(status)}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="invited">Zaproszony</option>
          <option value="confirmed">Potwierdzony</option>
          <option value="declined">Odmówił</option>
        </select>
      </div>
      <div className={styles.column}>
        <select
          className={styles.groupDropdown}
          value={group || ''} // Wyświetlanie wartości domyślnej, jeśli grupa to null
          onChange={(e) => onGroupChange(e.target.value)}
        >
          <option value="">Wybierz grupę</option> {/* Opcja domyślna */}
          {groups.map((g) => (
            <option key={g.groupId} value={g.groupName}>
              {g.groupName}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.moreOptionsColumn}>
        <button
          ref={buttonRef}
          className={styles.moreOptionsButton}
          onClick={handleToggleMenu}
        >
          <OptionsIcon className={styles.optionsIcon} />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={styles.optionsMenu}
            style={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 10,
            }}
          >
            <div
              className={styles.option}
              onClick={() => handleMenuOptionClick('Usuń')}
            >
              Usuń
            </div>
            <div
              className={styles.option}
              onClick={() => handleMenuOptionClick('Notatka')}
            >
              Notatka
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestRow;
