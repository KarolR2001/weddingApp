import React from 'react';
import styles from '../../styles/Admin/Notifications/NotificationModalDetails.module.css';

interface NotificationDetailsModalProps {
  details: any;
  onClose: () => void;
}


const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({ details, onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Szczegóły Powiadomienia</h2>
        <p><strong>Tytuł:</strong> {details.title}</p>
        <p><strong>Treść:</strong> {details.message}</p>
        <p><strong>Grupa odbiorców:</strong> {details.recipientsGroup}</p>
        <p><strong>Typ:</strong> {details.notificationType}</p>
        <p><strong>Wysłano:</strong> {new Date(details.sentAt).toLocaleString()}</p>
        <button onClick={onClose}>Zamknij</button>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
