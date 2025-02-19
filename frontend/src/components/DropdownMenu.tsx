import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { setActiveComponent } from '../redux/slices/activeComponentSlice';
import styles from '../styles/DropdownMenu.module.css';

const DropdownMenu: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Funkcja do zamknięcia dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Funkcja do pobrania inicjałów
  const getInitials = () => {
    if (!user) return '';
    if (user.userType === 'couple' && user.coupleProfile) {
      let initials = user.coupleProfile.partner1Name.charAt(0);
      if (user.coupleProfile.partner2Name) {
        initials += user.coupleProfile.partner2Name.charAt(0);
      }
      return initials.toUpperCase();
    } else if (user.userType === 'vendor' && user.vendorProfile) {
      return user.vendorProfile.companyName.charAt(0).toUpperCase();
    }
    return 'A';
  };
  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };
  const handleDashboardRedirect = () => {
    if (user?.userType === 'couple') {
      navigate('/couple/dashboard');
    } else if (user?.userType === 'vendor') {
      navigate('/vendor/dashboard');
    } else if (user?.userType === 'admin') {
        navigate('/admin/dashboard');
    }
    setIsOpen(false);
  };

  const handleSettings = () => {
    if (user?.userType === 'vendor') {
      dispatch(setActiveComponent({ component: 'settings', viewSidebar: 'default' }));
    } if (user?.userType === 'couple') {
      navigate('/couple/dashboard/settings');
    } else if (user?.userType === 'admin') {
      navigate('/admin/dashboard/settings')
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.avatar} onClick={toggleDropdown}>
        <span>{getInitials()}</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.menuItem} onClick={handleDashboardRedirect}>Panel Główny</div>
          <div className={styles.menuItem} onClick={handleSettings}>Ustawienia</div>
          <div className={styles.menuItem} onClick={handleLogout}>Wyloguj</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
