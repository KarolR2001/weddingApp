import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../redux/slices/notificationsSlice';
import { RootState, AppDispatch } from '../redux/store';
import styles from '../styles/NotificationBell.module.css';
import { ReactComponent as BellIcon } from '../assets/bell.svg';
import { ReactComponent as BellRingIcon } from '../assets/bell-ring.svg'; // Import ikony

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Domyślna liczba wyświetlanych powiadomień
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId)); // Pobierz wszystkie powiadomienia z backendu
    }
  }, [dispatch, userId]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeMenu);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
    };
  }, []);

  const handleNotificationClick = (notificationId: number) => {
    if (userId) {
      dispatch(markNotificationAsRead({ userId, notificationId }));
    }
  };

  const loadMoreNotifications = () => {
    setVisibleCount((prev) => prev + 5); // Wyświetlaj o 5 więcej powiadomień
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={styles.notificationBell} ref={menuRef}>
      <div className={styles.bellIconWrapper} onClick={toggleMenu}>
        <BellIcon />
        {unreadNotificationsCount > 0 && (
          <span className={styles.unreadCount}>{unreadNotificationsCount}</span>
        )}
      </div>
      {isMenuOpen && (
        <div className={styles.menu}>
          {loading ? (
            <p>Ładowanie...</p>
          ) : notifications.length > 0 ? (
            <>
              {notifications.slice(0, visibleCount).map((n) => (
                <div
                  key={n.notification.notificationId}
                  className={`${styles.notificationItem} ${
                    !n.isRead ? styles.unread : styles.read
                  }`}
                  onClick={() => handleNotificationClick(n.notification.notificationId)}
                >
                  <p className={styles.message}>{n.notification.message}</p>
                  {!n.isRead && (
                    <BellRingIcon className={styles.bellRingIcon} /> // Dodanie ikony dla nieprzeczytanych
                  )}
                </div>
              ))}
              {visibleCount < notifications.length && (
                <button className={styles.loadMoreButton} onClick={loadMoreNotifications}>
                  Załaduj więcej
                </button>
              )}
            </>
          ) : (
            <p>Brak powiadomień</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
