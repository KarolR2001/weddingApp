import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Couple/CoupleSidebarMenu.module.css';
import { ReactComponent as HamburgerIcon } from '../assets/hamburger-icon.svg';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as HomeIcon } from '../assets/home.svg';
import { ReactComponent as EmailIcon } from '../assets/message-circle.svg';
import { ReactComponent as ReportIcon } from '../assets/chart-pie.svg';
import { ReactComponent as AccountIcon } from '../assets/guest-list.svg';
import { ReactComponent as NotificationIcon } from '../assets/email.svg';

const AdminSidebarMenu: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Hamburger icon */}
      <div className={styles.hamburgerWrapper} onClick={toggleMenu}>
        <HamburgerIcon />
      </div>

      {/* Logo section */}
      {!isCollapsed && (
        <div className={styles.logoSection}>
          <Logo />
        </div>
      )}

      {/* Navigation buttons */}
      <div className={styles.navButtons}>
        <NavLink
          to="/admin/dashboard/home"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <HomeIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Strona główna</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/messages"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <EmailIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Wiadomości</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/account-management"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <AccountIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Zarządzanie kontami</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/notifications"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <NotificationIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Powiadomienia do użytkowników</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebarMenu;
