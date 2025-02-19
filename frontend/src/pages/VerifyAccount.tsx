// src/pages/VerifyAccount.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import SuccessIcon from '../assets/Success.svg';

const VerifyAccount: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        setErrorMessage('Brak tokenu weryfikacyjnego.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/auth/verify?token=${token}`);
        setIsVerified(true);
      } catch (error) {
        setErrorMessage('Nieprawidłowy lub wygasły token weryfikacyjny.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [location.search]);

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        //navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, navigate]);

  return (
    <div style={styles.container}>
      {isLoading ? (
        <Spinner />
      ) : isVerified ? (
        <div style={styles.successMessage}>
          <img src={SuccessIcon} alt="Success" style={{ width: 200, height: 200 }} />
          <p>Konto zostało pomyślnie zweryfikowane </p>
        </div>
      ) : (
        <div style={styles.errorMessage}>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyAccount;

// Style obiektowe
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  successMessage: {
    color: '#C3937C',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily:'Cormorant',
    fontWeight:'700',
    textTransform:'uppercase'
  },
  errorMessage: {
    color: '#dc3545',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily:'Inter',
    fontWeight:'400',
    textTransform:'uppercase'
  },
};
