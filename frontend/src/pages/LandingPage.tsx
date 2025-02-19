import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import NoLoginTopMenu from '../components/NoLoginTopMenu';
import LoginTopMenu from '../components/LoginTopMenu';
import styles from '../styles/LandingPage.module.css';
import LeftSection from '../components/LeftSectionLandingPage';

const LandingPage: React.FC = () => {

  const { user, token } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      {/* Komponent top menu */}
      {token && user ? <LoginTopMenu /> : <NoLoginTopMenu />}

      {/* Dwa divy obok siebie */}
      <div className={styles.container}>
        <div className={styles.leftDiv}>
        <LeftSection />
        </div>
        <div className={styles.rightDiv}>
        <img
          src={require('../assets/RightLandingPage.png')}  // Importujemy obraz
          alt="Right Landing Page"
          className={styles.rightImage}
        />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
