import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import styles from '../styles/LoginPage.module.css';
import Input2 from '../components/forms/Input2';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as GoogleIcon } from '../assets/google-icon.svg';
import Dropdown from '../components/Dropdown1';
import Button2 from '../components/Button2';
import Button3 from '../components/Button3';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      const userType = resultAction.payload.user.userType;
      if (userType === 'admin') navigate('/admin/dashboard');
      else if (userType === 'vendor') navigate('/vendor/dashboard');
      else if (userType === 'couple') navigate('/couple/dashboard');
    }
  };
  const loginGoogle = () => {
    alert('Logowanie poprzez Google nie zostało jeszcze zaimplementowane !!!')
  }
  const handleSelect = (option: string) => {
    if (option === 'Para Młoda') {
      window.location.href = '/register-couple';
    } else if (option === 'Usługodawca') {
      window.location.href = '/register-company';
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}><Logo/></div>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.heading}>zaloguj się</div>

          {/* Email Input */}
          <div className={styles.inputWrapper}>
            <Input2
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
          </div>

          {/* Password Input */}
          <div className={styles.inputWrapper}>
            <Input2
                placeholder="Hasło"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>

          <div className={styles.buttonContainer}>
            <Button2 label="Zaloguj się" onClick={handleLogin} />
          </div>{error && <p className={styles.error}>{error}</p>}
          {/* Separator */}
          <div className={styles.separator}>
            <div className={styles.line}></div>
            <span>lub</span>
            <div className={styles.line}></div>
          </div>

          {/* Google Login & Register */}
          <div className={styles.socialAndRegisterWrapper}>
          <Button3 label="Zaloguj się z Google" onClick={loginGoogle} icon={<GoogleIcon />} />
          <Dropdown
          label="Zarejestruj"
          options={['Para Młoda', 'Usługodawca']}
          onSelect={handleSelect}
        />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <img
          className={styles.image}
          src={require('../assets/login-register-image.png')}
          alt="Background"
        />
      </div>
    </div>
  );
};

export default LoginPage;
