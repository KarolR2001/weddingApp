import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { fetchAdminNotifications, setSearch } from '../../redux/slices/adminNotificationsSlice';
import styles from '../../styles/Admin/Notifications/NotificationsHeader.module.css';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';

interface NotificationsHeaderProps {
  onAddNotification: () => void;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({ onAddNotification }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setSearch(value));
    dispatch(fetchAdminNotifications({ page: 1, search: value, sortBy: 'sentAt', order: 'DESC' }));
  };

  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.title}>Powiadomienia</h1>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
        <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Wyszukaj powiadomienie..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className={styles.addButton} onClick={onAddNotification}>
          Nowe powiadomienie
        </button>
      </div>
    </div>
  );
};

export default NotificationsHeader;
