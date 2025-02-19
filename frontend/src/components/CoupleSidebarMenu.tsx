import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Couple/CoupleSidebarMenu.module.css';
import { ReactComponent as HamburgerIcon } from '../assets/hamburger-icon.svg';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as HomeIcon } from '../assets/home.svg';
import { ReactComponent as EmailIcon } from '../assets/email.svg';
import { ReactComponent as StarIcon } from '../assets/HeartFilledIconBlack.svg';
import { ReactComponent as GuestListIcon } from '../assets/guest-list.svg';
import { ReactComponent as TablePlanIcon } from '../assets/table-plan.svg';

const CoupleSidebarMenu: React.FC = () => {
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
          to="/couple/dashboard/home"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <HomeIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Strona główna</span>}
        </NavLink>

        <NavLink
          to="/couple/dashboard/messages"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <EmailIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Wiadomości</span>}
        </NavLink>

        <NavLink
          to="/couple/dashboard/favorites"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <StarIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Ulubione</span>}
        </NavLink>

        <NavLink
          to="/couple/dashboard/guest-list"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <GuestListIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Lista gości</span>}
        </NavLink>

        <NavLink
          to="/couple/dashboard/table-plan"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.activeButton : ''}`
          }
        >
          <TablePlanIcon className={`${styles.icon}`} />
          {!isCollapsed && <span>Plan stołów</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default CoupleSidebarMenu;
