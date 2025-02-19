import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveComponent } from '../redux/slices/activeComponentSlice';
import { RootState } from '../redux/store';
import styles from '../styles/Vendor/VendorSidebarMenu.module.css';
import { ReactComponent as HamburgerIcon } from '../assets/hamburger-icon.svg';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as HomeIcon } from '../assets/home.svg';
import { ReactComponent as EmailIcon } from '../assets/email.svg';
import { ReactComponent as WalletIcon } from '../assets/wallet.svg';
import { ReactComponent as PlusSquareIcon } from '../assets/plus-square.svg';

// Nowe ikony dla widoku szczegółowego
import { ReactComponent as CalendarIcon } from '../assets/calendar-month.svg';
import { ReactComponent as ReviewIcon } from '../assets/review.svg';

interface VendorSidebarMenuProps {
  onToggleSidebar: () => void;
}

const VendorSidebarMenu: React.FC<VendorSidebarMenuProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const activeComponent = useSelector((state: RootState) => state.activeComponent.component);
  const viewSidebar = useSelector((state: RootState) => state.activeComponent.viewSidebar);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setActiveComponent({ component: 'offers', viewSidebar: 'default' })); // Ustawia aktywny przycisk jako Strona Główna po załadowaniu
  }, [dispatch]);

  const handleButtonClick = (buttonName: string, sidebarView: 'default' | 'details') => {
    dispatch(setActiveComponent({ component: buttonName, viewSidebar: sidebarView }));
  };

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
    onToggleSidebar();
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
        {/* Stały przycisk Strona główna */}
        <button 
          className={`${styles.navButton} ${activeComponent === 'offers' ? styles.activeButton : ''}`} 
          onClick={() => handleButtonClick('offers', 'default')}
        >
          <HomeIcon className={`${styles.icon} ${activeComponent === 'offers' ? styles.activeIcon : ''}`} />
          {!isCollapsed && <span>Strona główna</span>}
        </button>

        {viewSidebar === 'default' ? (
          <>
            <button 
              className={`${styles.navButton} ${activeComponent === 'messages' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('messages', 'default')}
            >
              <EmailIcon className={`${styles.icon} ${activeComponent === 'messages' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Wiadomości</span>}
            </button>
{/*             <button 
              className={`${styles.navButton} ${activeComponent === 'payments' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('payments', 'default')}
            >
              <WalletIcon className={`${styles.icon} ${activeComponent === 'payments' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Płatności</span>}
            </button> */}
            <button 
              className={`${styles.navButton} ${activeComponent === 'addListing' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('addListing', 'default')}
            >
              <PlusSquareIcon className={`${styles.icon} ${activeComponent === 'addListing' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Dodaj ogłoszenie</span>}
            </button>
          </>
        ) : (
          <>
            <button 
              className={`${styles.navButton} ${activeComponent === 'detailMessages' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('detailMessages', 'details')}
            >
              <EmailIcon className={`${styles.icon} ${activeComponent === 'detailMessages' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Wiadomości</span>}
            </button>
            <button 
              className={`${styles.navButton} ${activeComponent === 'reviews' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('reviews', 'details')}
            >
              <ReviewIcon className={`${styles.icon} ${activeComponent === 'reviews' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Opinie</span>}
            </button>
            <button 
              className={`${styles.navButton} ${activeComponent === 'calendar' ? styles.activeButton : ''}`} 
              onClick={() => handleButtonClick('calendar', 'details')}
            >
              <CalendarIcon className={`${styles.icon} ${activeComponent === 'calendar' ? styles.activeIcon : ''}`} />
              {!isCollapsed && <span>Terminarz</span>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorSidebarMenu;
