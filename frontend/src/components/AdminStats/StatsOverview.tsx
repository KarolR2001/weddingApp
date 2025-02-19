import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ReactComponent as SuccessIcon } from '../../assets/chart-mixed.svg';
import styles from '../../styles/Admin/AdminReportsPage.module.css';

const StatsOverview: React.FC = () => {
  const { stats, loading, error } = useSelector((state: RootState) => state.adminStats);

  if (loading) return <p>Ładowanie danych...</p>;
  if (error || !stats) return <p>Nie udało się pobrać statystyk.</p>;

  return (
    <div className={styles.statsContainer}>
        <div className={styles.headerContainer}>
        <SuccessIcon/>
        Statystyki
        </div>
      
      <div className={styles.listContainer}>
        <div className={styles.itemList}>Liczba użytkowników: <strong>{stats.totalUsers}</strong></div>
        <div className={styles.itemList}>Liczba aktywnych użytkowników: <strong>{stats.activeUsers}</strong></div>
        <div className={styles.itemList}>Ilość Par Młodych: <strong>{stats.couplesCount}</strong></div>
        <div className={styles.itemList}>Ilość Usługodawców: <strong>{stats.vendorsCount}</strong></div>
        <div className={styles.itemList}>Średni czas przeglądania ogłoszeń:<strong>{stats.avgListingViews} minut</strong> </div>
        <div className={styles.itemList}>Najbardziej aktywne dni: <strong>{stats.mostActiveDay}</strong></div>
        <div className={styles.itemList}>Najbardziej aktywne godziny: <strong>{stats.mostActiveHour}:00</strong></div>
        <div className={styles.itemList}>Najpopularniejsza kategoria: <strong>{stats.mostActiveCategory}</strong></div>
      </div>
    </div>
  );
};

export default StatsOverview;
