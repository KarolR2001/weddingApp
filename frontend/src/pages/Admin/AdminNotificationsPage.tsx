import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsHeader from '../../components/AdminNotifications/NotificationsHeader';
import NotificationsTable from '../../components/AdminNotifications/NotificationsTable';
import NotificationModal from '../../components/AdminNotifications/NotificationModal';
import Pagination from '../../components/Pagination';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchAdminNotifications, setCurrentPage, addAdminNotification } from '../../redux/slices/adminNotificationsSlice';
import styles from '../../styles/Admin/AdminNotificationsPage.module.css';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, totalPages, currentPage, loading, search, sortBy, order } = useSelector(
    (state: RootState) => state.adminNotifications
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminNotifications({ page: currentPage, search, sortBy, order }));
  }, [dispatch, currentPage, search, sortBy, order]);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };
  const handleAddNotification = async (data: any) => {
    // Wywołanie thunka do dodawania nowego powiadomienia
    await dispatch(addAdminNotification(data));
    setIsModalOpen(false); // Zamknij modal po dodaniu
  };
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  return (
    <div className={styles.notificationsPage}>
      <div className={styles.contentWrapper}>
        <NotificationsHeader onAddNotification={toggleModal} />
        <NotificationsTable notifications={notifications} loading={loading} />
      </div>
      <div className={styles.paginationWrapper}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      {isModalOpen && <NotificationModal onClose={toggleModal} />}
    </div>
  );
};

export default NotificationsPage;