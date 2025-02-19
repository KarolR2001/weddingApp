import React from 'react';
import styles from '../../styles/Admin/AdminHomePage.module.css';

const AdminHomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strona Główna</h1>
      <p>Witaj w panelu administracyjnym. Tutaj znajdziesz podsumowanie najważniejszych informacji.</p>
    </div>
  );
};

export default AdminHomePage;
