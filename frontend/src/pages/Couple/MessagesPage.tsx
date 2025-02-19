import React from 'react';
import MessageComponent from '../../components/MessageComponent/MessageComponent';
import styles from '../../styles/Couple/MessagesPage.module.css';

const MessagesPage: React.FC = () => {
  return (
    <div className={styles.messagesPage}>
      <h1 className={styles.title}>Wiadomości</h1>
      <MessageComponent />
    </div>
  );
};

export default MessagesPage;
