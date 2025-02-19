import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/NoLoginTopMenu.module.css';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as BellIcon } from '../assets/bell.svg';
import { ReactComponent as MailIcon } from '../assets/mail.svg';
import { ReactComponent as HamburgerIcon } from '../assets/hamburger-icon.svg';
import { ReactComponent as CloseIcon } from '../assets/close-icon.svg';
import { setActiveComponent } from '../redux/slices/activeComponentSlice'; // Import akcji Redux
import DropdownMenu from './DropdownMenu';
import NotificationBell from './NotificationBell';

const LoginTopMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { listingId } = useSelector((state: RootState) => state.reviews);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isLogoVisible = ['/', '/list', `/listing/${listingId}`].some((path) => {
    return location.pathname === path;
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleMailClick = () => {
    if (!user) return; // Użytkownik niezalogowany, nie podejmuj akcji

    if (user.userType === 'vendor') {
      dispatch(setActiveComponent({ component: 'messages', viewSidebar: 'default' }));
    } else if (user.userType === 'couple') {
      navigate('/couple/dashboard/messages');
    } else if (user.userType === 'admin') {
      navigate('/admin/dashboard/messages');
    }
  };

  return (
    <div className={styles.menu}>
      {/* Logo */}
        {isLogoVisible && (
        <div className={styles.logo}>
          <Logo />
        </div>
        )}

      {/* Hamburger Icon */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
      </div>

      {/* Nawigacja i ikony */}
      <nav className={`${styles.nav} ${isMenuOpen ? styles.showMenu : ''}`}>
        <a href="/">Główna</a>
        <a href="/contact">Kontakt</a>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
          <NotificationBell />
          </div>
          <div className={styles.iconWrapper} onClick={handleMailClick}>
            <MailIcon />
          </div>
        </div>
        <div className={styles.avatarWrapper}>
            <DropdownMenu />
        </div>
      </nav>
    </div>
  );
};

export default LoginTopMenu;
