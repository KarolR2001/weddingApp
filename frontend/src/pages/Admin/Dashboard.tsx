import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebarMenu from '../../components/AdminSidebarMenu';
import LoginTopMenu from '../../components/LoginTopMenu';
import AdminHomePage from '../Admin/AdminHomePage';
import AdminMessagesPage from '../Admin/AdminMessagesPage';
import AdminReportsPage from '../Admin/AdminReportsPage';
import AdminAccountManagementPage from '../Admin/AdminAccountManagementPage';
import AdminNotificationsPage from '../Admin/AdminNotificationsPage';
import Settings from '../../components/CoupleSettingComponent';
import styles from '../../styles/Admin/AdminDashboard.module.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <AdminSidebarMenu />
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topMenu}>
          <LoginTopMenu />
        </header>
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<Navigate to="home" />} />
            <Route path="home" element={<AdminReportsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="account-management" element={<AdminAccountManagementPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
