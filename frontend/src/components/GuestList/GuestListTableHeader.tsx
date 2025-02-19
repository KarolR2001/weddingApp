import React from 'react';
import styles from '../../styles/Couple/GuestListTableHeader.module.css';
import { ReactComponent as SortIcon } from '../../assets/bxs_sort-alt.svg'; // Import ikony jako komponent SVG

interface GuestListTableHeaderProps {
  onSort: (column: 'name' | 'status' | 'group') => void;
}

const GuestListTableHeader: React.FC<GuestListTableHeaderProps> = ({ onSort }) => {
  return (
    <div className={styles.headerContainer}>
      <div
        className={styles.headerColumn}
        onClick={() => onSort('name')}
        role="button"
        tabIndex={0}
      >
        <span>Imię i Nazwisko</span>
        <SortIcon className={styles.sortIcon} />
      </div>
      <div
        className={styles.headerColumn}
        onClick={() => onSort('status')}
        role="button"
        tabIndex={0}
      >
        <span>Status</span>
        <SortIcon className={styles.sortIcon} />
      </div>
      <div
        className={styles.headerColumn}
        onClick={() => onSort('group')}
        role="button"
        tabIndex={0}
      >
        <span>Grupa</span>
        <SortIcon className={styles.sortIcon} />
      </div>
      <div className={styles.emptyColumn}></div>
    </div>
  );
};

export default GuestListTableHeader;
