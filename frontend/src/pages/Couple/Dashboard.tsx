import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CoupleSidebarMenu from '../../components/CoupleSidebarMenu';
import LoginTopMenu from '../../components/LoginTopMenu';
import HomePage from '../Couple/HomePage';
import MessagesPage from '../Couple/MessagesPage';
import FavoritesPage from '../Couple/FavoritesPage';
import GuestListPage from '../Couple/GuestListPage';
import TablePlanPage from '../Couple/TablePlanPage';
import Settings from '../../components/CoupleSettingComponent';
import styles from '../../styles/Couple/CoupleDashboard.module.css';

const CoupleDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <CoupleSidebarMenu />
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topMenu}>
          <LoginTopMenu />
        </header>
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<Navigate to="home" />} />
            <Route path="home" element={<HomePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="guest-list" element={<GuestListPage />} />
            <Route path="table-plan" element={<TablePlanPage />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default CoupleDashboard;
