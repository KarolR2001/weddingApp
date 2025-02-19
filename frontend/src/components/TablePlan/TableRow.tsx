import React, { useState, useRef, useEffect } from 'react';
import TableGuestList from './TableGuestList';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { deleteTable, updateTable } from '../../redux/slices/tablePlanSlice';
import styles from '../../styles/Couple/TableRow.module.css';
import { ReactComponent as AngleDownIcon } from '../../assets/angle-down.svg';
import EditTableModal from './EditTableModal'; // Import modal

interface Guest {
  guestId: number;
  guestName: string;
  guestStatus: 'invited' | 'confirmed' | 'declined';
}

interface Table {
  tableId: number;
  tableName: string;
  tableShape: 'round' | 'rectangular';
  maxGuests: number;
  guests: Guest[];
}

interface TableRowProps {
  table: Table;
}

const TableRow: React.FC<TableRowProps> = ({ table }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const dispatch: AppDispatch = useDispatch();

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 150; // Approximate menu width
      const viewportWidth = window.innerWidth;

      let left = rect.left + window.scrollX;

      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth + 10 ;
      }

      setMenuPosition({
        top: rect.bottom + 3 + window.scrollY,
        left: left,
      });

      setIsMenuOpen((prev) => !prev);
    }
  };

  const handleMenuOptionClick = (option: string) => {
    if (option === 'Usuń') {
      dispatch(deleteTable(table.tableId));
    } else if (option === 'Edytuj') {
      setIsEditModalOpen(true);
    }
    setIsMenuOpen(false);
  };

  const handleUpdateTable = (updatedTable: Partial<Table>) => {
    dispatch(updateTable({ tableId: table.tableId, updates: updatedTable }));
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div
        className={`${styles.tableRow} ${isExpanded ? styles.expanded : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.tableColumn}>
          <div className={styles.text}>{table.tableName}</div>
        </div>
        <div className={styles.tableColumn}>
          <div className={styles.text}>{`${table.guests.length}/${table.maxGuests}`}</div>
        </div>
        <div className={styles.tableColumn}>
          <div className={styles.shape}>
            <div className={styles.shapeText}>
              {table.tableShape === 'round' ? 'Okrągły' : 'Prostokątny'}
            </div>
          </div>
        </div>
        <div className={styles.options}>
          <div
            className={styles.expandButton}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <AngleDownIcon className={styles.angleIcon} />
          </div>
          <div
            ref={buttonRef}
            className={styles.optionDotContainer}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMenu();
            }}
          >
            <div className={styles.optionDot}></div>
            <div className={styles.optionDot}></div>
            <div className={styles.optionDot}></div>
          </div>
        </div>
      </div>
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
            onClick={() => handleMenuOptionClick('Edytuj')}
          >
            Edytuj
          </div>
        </div>
      )}
      {isExpanded && (
        <div className={styles.expandedRow}>
          <TableGuestList table={table} />
        </div>
      )}
      {isEditModalOpen && (
        <EditTableModal
          table={table}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateTable}
        />
      )}
    </>
  );
};

export default TableRow;
