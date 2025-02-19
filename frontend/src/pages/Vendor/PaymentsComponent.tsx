import React from 'react';
import styles from '../../styles/Vendor/Payments.module.css';

const Payments: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Płatności</h2>
      <p className={styles.info}>Nie masz żadnych płatności do wyświetlenia</p>
    </div>
  );
};

export default Payments;