import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import styles from '../styles/LoginPage.module.css';
import Input2 from '../components/forms/Input2';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as GoogleIcon } from '../assets/google-icon.svg';
import Dropdown from '../components/Dropdown1';
import Button2 from '../components/Button2';
import Button3 from '../components/Button3';

const LoginPage: React.FC = () => {
  console.log('LoginPage - Rendering');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null); // Tymczasowy token dla nowych użytkowników
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  console.log('LoginPage - Redux state:', { user, loading, error });

  const handleLogin = async () => {
    console.log('LoginPage - handleLogin called with:', { email, password });
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      const userType = resultAction.payload.user.userType;
      console.log('LoginPage - Login successful, userType:', userType);
      if (userType === 'admin') navigate('/admin/dashboard');
      else if (userType === 'vendor') navigate('/vendor/dashboard');
      else if (userType === 'couple') navigate('/couple/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    console.log('LoginPage - handleGoogleLogin called');
    // Przekierowanie do Google bez userType
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleGoogleTypeSelect = async (userType: 'vendor' | 'couple') => {
    console.log('LoginPage - handleGoogleTypeSelect called with:', { userType, tempToken });
    if (!tempToken) {
      setLoginError('Brak tymczasowego tokenu.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/auth/google/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ userType }),
      });
  
      console.log('LoginPage - Fetch response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('LoginPage - Fetch response data:', data);
  
      if (response.ok) {
        const { token, user: userData } = data;
        console.log('LoginPage - Google complete response:', { token, userData });
  
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({ type: 'auth/loginUser/fulfilled', payload: { user: userData, token } });
  
        if (userData.userType === 'vendor') navigate('/vendor/dashboard');
        else if (userData.userType === 'couple') navigate('/couple/dashboard');
      } else {
        setLoginError(data.message || 'Błąd podczas wyboru typu konta.');
      }
    } catch (err) {
      console.error('LoginPage - Error completing Google login:', err instanceof Error ? err.message : err);
      setLoginError('Błąd podczas finalizacji logowania.');
    }
    setShowModal(false);
    setTempToken(null);
  };

  const handleSelect = (option: string) => {
    console.log('LoginPage - handleSelect called with:', option);
    if (option === 'Para Młoda') window.location.href = '/register-couple';
    else if (option === 'Usługodawca') window.location.href = '/register-company';
  };

  useEffect(() => {
    console.log('LoginPage - useEffect triggered, location:', location.pathname, location.search);
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const tempTokenParam = params.get('tempToken');
    const userData = params.get('user');
    const isNewUser = params.get('isNewUser');

    console.log('LoginPage - URL params:', { token, tempToken: tempTokenParam, userData, isNewUser });
    if (token && userData) {
      console.log('LoginPage - Processing Google login for existing user');
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        console.log('LoginPage - Parsed user:', parsedUser);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(parsedUser));
        console.log('LoginPage - Saved to localStorage:', { token, user: parsedUser });

        dispatch({ type: 'auth/loginUser/fulfilled', payload: { user: parsedUser, token } });
        console.log('LoginPage - Dispatched to Redux');

        if (parsedUser.userType === 'admin') {
          console.log('LoginPage - Navigating to /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (parsedUser.userType === 'vendor') {
          console.log('LoginPage - Navigating to /vendor/dashboard');
          navigate('/vendor/dashboard');
        } else if (parsedUser.userType === 'couple') {
          console.log('LoginPage - Navigating to /couple/dashboard');
          navigate('/couple/dashboard');
        }
      } catch (err) {
        console.error('LoginPage - Error parsing Google user data:', err);
        setLoginError('Błąd przetwarzania danych logowania.');
      }
    } else if (tempTokenParam && isNewUser === 'true') {
      console.log('LoginPage - New user detected, showing modal');
      setTempToken(tempTokenParam);
      setShowModal(true);
    } else if (location.search.includes('error')) {
      console.log('LoginPage - Error detected in URL');
      setLoginError('Błąd logowania z Google.');
    } else {
      console.log('LoginPage - No token or user data in URL');
    }
  }, [location, dispatch, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}><Logo /></div>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.heading}>zaloguj się</div>
          <div className={styles.inputWrapper}>
            <Input2 placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.inputWrapper}>
            <Input2 placeholder="Hasło" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={styles.buttonContainer}>
            <Button2 label="Zaloguj się" onClick={handleLogin} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {loginError && <p className={styles.error}>{loginError}</p>}
          <div className={styles.separator}>
            <div className={styles.line}></div>
            <span>lub</span>
            <div className={styles.line}></div>
          </div>
          <div className={styles.socialAndRegisterWrapper}>
            <Button3 label="Zaloguj się z Google" onClick={handleGoogleLogin} icon={<GoogleIcon />} />
            <Dropdown label="Zarejestruj" options={['Para Młoda', 'Usługodawca']} onSelect={handleSelect} />
          </div>
        </div>
      </div>
      <div className={styles.rightSection}>
        <img className={styles.image} src={require('../assets/login-register-image.png')} alt="Background" />
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Wybierz typ konta</h3>
            <Button3 label="Para Młoda" onClick={() => handleGoogleTypeSelect('couple')} />
            <Button3 label="Usługodawca" onClick={() => handleGoogleTypeSelect('vendor')} />
            <Button2 label="Anuluj" onClick={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;