import React from 'react';
import styles from '../../styles/Admin/AdminMessagesPage.module.css';
import MessageComponent from '../../components/MessageComponent/MessageComponent';

const AdminMessagesPage: React.FC = () => {
  return (
    <div className={styles.messagesPage}>
      <h1 className={styles.title}>Wiadomości dla ogłoszenia</h1>
      <MessageComponent />
    </div>
  );
};

export default AdminMessagesPage;
