import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { fetchSystemStats } from '../../redux/slices/adminStatsSlice';
import StatsOverview from '../../components/AdminStats/StatsOverview';
import ReportsControls from '../../components/AdminStats/ReportsControls';
import ChartsSection from '../../components/AdminStats/ChartsSection';
import ReportsList from '../../components/AdminStats/ReportsList';
import styles from '../../styles/Admin/AdminReportsPage.module.css';


const AdminReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchSystemStats());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Raporty i Statystyki</h1>
      <div className={styles.row1}>      
        <StatsOverview />
        <ReportsControls />
      </div>

      <ChartsSection />
      <ReportsList />
    </div>
  );
};

export default AdminReportsPage;
