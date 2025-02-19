import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { sortUsers } from '../../redux/slices/usersSlice';
import UserRow from './UserRow';
import styles from '../../styles/Admin/UsersList/UsersTable.module.css';
import { ReactComponent as SortIcon } from '../../assets/bxs_sort-alt.svg'; // Ikona sortowania

interface User {
  id: number;
  email: string;
  userType: string;
  status: string;
  created_at: string;
  lastLoginAt: string | null;
}

interface UsersTableProps {
  users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const dispatch: AppDispatch = useDispatch();
  const { sortColumn, sortOrder } = useSelector((state: RootState) => state.users);

  const toggleSortOrder = (column: keyof User) => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(sortUsers({ column, order: newOrder }));
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.headerContainer}>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('email')}
          role="button"
          tabIndex={0}
        >
          <span>Email</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'email' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('userType')}
          role="button"
          tabIndex={0}
        >
          <span>Typ konta</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'userType' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('status')}
          role="button"
          tabIndex={0}
        >
          <span>Status</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'status' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('created_at')}
          role="button"
          tabIndex={0}
        >
          <span>Data rejestracji</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'created_at' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div
          className={styles.headerColumn}
          onClick={() => toggleSortOrder('lastLoginAt')}
          role="button"
          tabIndex={0}
        >
          <span>Ostatnie logowanie</span>
          <SortIcon
            className={`${styles.sortIcon} ${
              sortColumn === 'lastLoginAt' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''
            }`}
          />
        </div>
        <div className={styles.emptyColumn}></div>
      </div>
      <div className={styles.bodyContainer}>
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UsersTable;
