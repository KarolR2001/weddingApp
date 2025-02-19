import React from 'react';
import NotificationRow from './NotificationRow';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchAdminNotifications, setSort } from '../../redux/slices/adminNotificationsSlice';
import styles from '../../styles/Admin/Notifications/NotificationsTable.module.css';
import { ReactComponent as SortIcon } from '../../assets/bxs_sort-alt.svg';
import Spinner from '../Spinner';

interface NotificationsTableProps {
  notifications: any[];
  loading: boolean;
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({ notifications, loading }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sortBy, order, currentPage } = useSelector((state: RootState) => state.adminNotifications);

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && order === 'ASC' ? 'DESC' : 'ASC';
    dispatch(setSort({ sortBy: column, order: newOrder }));
    dispatch(fetchAdminNotifications({ page: currentPage, search: '', sortBy: column, order: newOrder }));
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.headerColumn} onClick={() => handleSort('sentAt')}><span>Data i czas wysłania</span><SortIcon className={styles.sortIcon} /></div>
        <div className={styles.headerColumn} onClick={() => handleSort('title')}><span>Tytuł powiadomienia</span><SortIcon className={styles.sortIcon} /></div>
        <div className={styles.headerColumn} onClick={() => handleSort('recipientsGroup')}><span>Adresaci</span><SortIcon className={styles.sortIcon} /></div>
        <div className={styles.headerColumn} onClick={() => handleSort('status')}><span>Status</span><SortIcon className={styles.sortIcon} /></div>
        <div className={styles.emptyColumn}></div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        notifications.map((notification) => (
          <NotificationRow key={notification.notificationId} notification={notification} />
        ))
      )}
    </div>
  );
};

export default NotificationsTable;
