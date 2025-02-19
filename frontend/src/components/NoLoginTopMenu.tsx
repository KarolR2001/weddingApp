import React, { useState } from 'react';
import styles from '../styles/NoLoginTopMenu.module.css';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';  // Import SVG logo
import Dropdown from './Dropdown1';
import Button1 from './Button1';
import { ReactComponent as HamburgerIcon } from '../assets/hamburger-icon.svg';  // Ikona hamburgera
import { ReactComponent as CloseIcon } from '../assets/close-icon.svg';  // Ikona "X" do zamykania menu

const NoLoginTopMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);  // Stan do otwierania/zamykania menu na mobilnych

  const handleSelect = (option: string) => {
    if (option === 'Para Młoda') {
      window.location.href = '/register-couple';
    } else if (option === 'Usługodawca') {
      window.location.href = '/register-company';
    }
  };

  const handleClick = () => {
    window.location.href = '/login';
  };

  // Funkcja do otwierania i zamykania menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.menu}>
      {/* Logo wyrównane do lewej */}
      <div className={styles.logo}>
        <Logo />
      </div>

      {/* Hamburger lub ikona zamknięcia (X) */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />} {/* Wyświetla hamburgera lub "X" */}
      </div>

      {/* Nawigacja i przyciski - pokaż menu po kliknięciu na hamburger na mobilnych */}
      <nav className={`${styles.nav} ${isMenuOpen ? styles.showMenu : ''}`}>
        <a href="/">Główna</a>
        <a href="/contact">Kontakt</a>
        <Button1 label="Zaloguj" onClick={handleClick} />
        <Dropdown
          label="Zarejestruj"
          options={['Para Młoda', 'Usługodawca']}
          onSelect={handleSelect}
        />
      </nav>
    </div>
  );
};

export default NoLoginTopMenu;
