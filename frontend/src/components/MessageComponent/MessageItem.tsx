import React from 'react';
import { Message } from '../../redux/slices/messagesSlice';
import styles from '../../styles/MessageComponent/MessageItem.module.css';
import usersIcon from '../../assets/miniUsers.svg';

interface Props {
  message: Message;
}

const MessageItem: React.FC<Props> = ({ message }) => {
  if (!message || !message.messageContent) {
    return null; 
  }

  const isSender = true; 

  return (
    <div className={styles.container}>
        <div className={styles.iconContainer}>
         <img src={usersIcon} alt="Pen Icon" className={styles.icon} />
        </div>
        <div className={`${styles.messageItem} ${isSender ? styles.sender : styles.receiver}`}>
        <div className={styles.messageContent}>{message.messageContent}</div>
        <span className={styles.date}>
            {new Date(message.created_at).toLocaleString()} 
        </span>
        </div>
    </div>
  );
};

export default MessageItem;
