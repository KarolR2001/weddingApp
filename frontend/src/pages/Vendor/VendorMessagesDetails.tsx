import React, { useEffect, useState } from 'react';
import MessageComponent from '../../components/MessageComponent/MessageComponent';
import styles from '../../styles/Vendor/VendorMessagesDetails.module.css';

const VendorMessagesDetails: React.FC = () => {
  return (
    <div className={styles.messagesPage}>
      <h1 className={styles.title}>Wiadomości dla ogłoszenia</h1>
      <MessageComponent />
    </div>
  );
};

export default VendorMessagesDetails;
