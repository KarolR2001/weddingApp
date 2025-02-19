import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { sortTables } from '../../redux/slices/tablePlanSlice';
import TableRow from './TableRow';
import styles from '../../styles/Couple/TableList.module.css';
import { ReactComponent as SortIcon } from '../../assets/bxs_sort-alt.svg';

const TableList: React.FC = () => {
  const { tables, sortColumn, sortOrder } = useSelector((state: RootState) => state.tablePlan);
  const dispatch: AppDispatch = useDispatch();

  const toggleSortOrder = (column: 'tableName' | 'maxGuests' | 'tableShape') => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(sortTables({ column, order: newOrder }));
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.headerContainer}>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('tableName')}
          role="button"
          tabIndex={0}
        >
          <span>Nazwa</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'tableName' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('maxGuests')}
          role="button"
          tabIndex={0}
        >
          <span>Ilość miejsc</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'maxGuests' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('tableShape')}
          role="button"
          tabIndex={0}
        >
          <span>Typ</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'tableShape' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div className={styles.emptyColumn}></div>
      </div>
      <div className={styles.bodyContainer}>
        {tables.map((table) => (
          <TableRow key={table.tableId} table={table} />
        ))}
      </div>
    </div>
  );
};

export default TableList;
