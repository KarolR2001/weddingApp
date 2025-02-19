import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { deleteAdminNotification, resendAdminNotification, fetchNotificationDetails } from '../../redux/slices/adminNotificationsSlice';
import styles from '../../styles/Admin/Notifications/NotificationRow.module.css';
import OptionsButtonIcon from '../../assets/OptionsButton.svg';
import NotificationDetailsModal from './NotificationDetailsModal';

interface NotificationRowProps {
  notification: {
    notificationId: number;
    sentAt: string;
    title: string;
    recipientsGroup: string;
    status: 'sent' | 'pending' | 'failed';
  };
}

// Funkcja mapująca statusy na polskie odpowiedniki
const mapStatusToPolish = (status: 'sent' | 'pending' | 'failed'): string => {
  const statusMap: Record<string, string> = {
    sent: 'Wysłane',
    pending: 'Oczekujące',
    failed: 'Nieudane',
  };
  return statusMap[status] || 'Nieznany';
};

const NotificationRow: React.FC<NotificationRowProps> = ({ notification }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<any>(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleDetails = async () => {
    try {
      await dispatch(fetchNotificationDetails(notification.notificationId)).unwrap();
      setDetailsModalOpen(true);
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów:', error);
    }
  };
  useEffect(() => {
    console.log('Modal state:', detailsModalOpen); // Sprawdzanie stanu
  }, [detailsModalOpen]);

  const handleDelete = () => {
    dispatch(deleteAdminNotification(notification.notificationId));
  };

  const handleResend = () => {
    dispatch(resendAdminNotification(notification.notificationId));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
    <div className={styles.tableRow}>
      <div className={styles.tableColumn}>
        <div className={styles.text}>{new Date(notification.sentAt).toLocaleDateString()}</div>
      </div>
      <div className={styles.tableColumn}>
        <div className={styles.text}>{notification.title || 'Brak tytułu'}</div>
      </div>
      <div className={styles.tableColumn}>
        <div className={styles.shape}>{notification.recipientsGroup || 'Brak grupy'}</div>
      </div>
      <div className={styles.tableColumn}>
        <div
          className={`${styles.statusBadge} ${
            notification.status === 'sent' ? styles.sent : styles.pending
          }`}
        >
          {mapStatusToPolish(notification.status)}
        </div>
      </div>
      <div className={styles.actionsColumn}>
        <button onClick={toggleMenu} className={styles.optionsButton}>
          <img src={OptionsButtonIcon} alt="Opcje" className={styles.icon} />
        </button>
        {isMenuOpen && (
          <div ref={menuRef} className={styles.optionsMenu}>
            <div className={styles.option} onClick={handleDetails}>
              Szczegóły
            </div>
            <div className={styles.option} onClick={handleDelete}>
              Usuń
            </div>
            <div className={styles.option} onClick={handleResend}>
              Wyślij ponownie
            </div>
          </div>
        )}
      </div>
    </div>
    
    {detailsModalOpen && (
  <>
  {console.log('Renderowanie modala', notificationDetails)}
  <NotificationDetailsModal
    details={notificationDetails}
    onClose={() => setDetailsModalOpen(false)}
  />
</>
    )}
  </>
);
};

export default NotificationRow;
