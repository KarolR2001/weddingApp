import React from 'react';
import styles from '../../styles/Vendor/Messages.module.css';
import MessageComponent from '../../components/MessageComponent/MessageComponent';

const Messages: React.FC = () => {
  return (
    <div className={styles.messagesPage}>
      <h1 className={styles.title}>Wiadomości</h1>
      <MessageComponent />
    </div>
  );
};

export default Messages;