import React, { useState, useEffect } from 'react';
import Input2 from '../components/forms/Input2';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CoupleRegisterPage.module.css';
import { ReactComponent as Logo } from '../assets/TopMenuLOGO.svg';
import { ReactComponent as GoogleIcon } from '../assets/google-icon.svg';
import { ReactComponent as SuccessIcon } from '../assets/Success.svg';
import Button1 from '../components/Button1';
import Button2 from '../components/Button2';
import Button3 from '../components/Button3';
import Spinner from '../components/Spinner';
import axios from 'axios';

interface ValidationState {
  companyName: boolean;
  email: boolean;
  phoneNumber: boolean;
  password: boolean;
  confirmPassword: boolean;
}

const CompanyRegisterPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    companyName: true,
    email: true,
    phoneNumber: true,
    password: true,
    confirmPassword: true,
  });

  const navigate = useNavigate();

  const handleNameChange = (name: string) => {
    const filteredName = name.replace(/[^a-zA-Z\s]/g, '');
    setCompanyName(filteredName);
    setValidation((prevValidation) => ({
      ...prevValidation,
      companyName: filteredName.trim() !== '',
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
    setValidation((prevValidation) => ({
      ...prevValidation,
      email: /\S+@\S+\.\S+/.test(email),
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '');
    setPhoneNumber(phone);
    setValidation((prevValidation) => ({
      ...prevValidation,
      phoneNumber: phone.length >= 9,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
    setValidation((prevValidation) => ({
      ...prevValidation,
      password: password.length >= 6,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    setValidation((prevValidation) => ({
      ...prevValidation,
      confirmPassword: confirmPassword === password,
    }));
  };

  const validateAllFields = () => {
    const isCompanyNameValid = companyName.trim() !== '';
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    const isPhoneNumberValid = phoneNumber.length >= 9;
    const isPasswordValid = password.length >= 6;
    const isConfirmPasswordValid = confirmPassword === password;

    setValidation({
      companyName: isCompanyNameValid,
      email: isEmailValid,
      phoneNumber: isPhoneNumberValid,
      password: isPasswordValid,
      confirmPassword: isConfirmPasswordValid,
    });

    return (
      isCompanyNameValid &&
      isEmailValid &&
      isPhoneNumberValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  };

  const handleRegister = async () => {
    const allValid = validateAllFields();

    if (!allValid) {
      alert('Proszę uzupełnić wszystkie pola poprawnie.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/auth/register', {
        email,
        password,
        phoneNumber,
        userType: 'vendor',
        companyName,
      });

      const intervalId = setInterval(async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/auth/check-verification?email=${email}`);
          if (data.isVerified) {
            clearInterval(intervalId);
            setIsVerified(true);
            setIsLoading(false);
            navigate('/login');
          }
        } catch (error) {
          console.log('Błąd podczas sprawdzania statusu weryfikacji.');
        }
      }, 5000);
    } catch (error) {
      console.log('Rejestracja nie powiodła się. Spróbuj ponownie.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        {isLoading ? (
          <div className={styles.successMessage}><Spinner /> <p>Oczekuję na weryfikację...</p></div>
        ) : isSuccess ? (
          <div className={styles.successMessage}>
            <SuccessIcon style={{ width: 100, height: 100 }} />
            <p>Wiadomość została wysłana pomyślnie!</p>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <div className={styles.logoContainer}>
              <div className={styles.logo}><Logo /></div>
            </div>
            <div className={styles.heading}>zarejestruj się</div>
            <div className={styles.inputWrapper}>
              <Input2
                placeholder="Nazwa Firmy"
                type="text"
                value={companyName}
                onChange={(e) => handleNameChange(e.target.value)}
                isValid={validation.companyName}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input2
                placeholder="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                isValid={validation.email}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input2
                placeholder="Telefon"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                isValid={validation.phoneNumber}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input2
                placeholder="Hasło"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                isValid={validation.password}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input2
                placeholder="Powtórz Hasło"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                isValid={validation.confirmPassword}
              />
            </div>

            <div className={styles.buttonContainer}>
              <Button2 label="Zarejestruj się" onClick={handleRegister} />
            </div>

            <div className={styles.separator}>
              <div className={styles.line}></div>
              <span>lub</span>
              <div className={styles.line}></div>
            </div>

            <div className={styles.socialAndRegisterWrapper}>
              <Button3 label="Zaloguj się z Google" onClick={() => alert('Logowanie poprzez Google nie zostało jeszcze zaimplementowane!')} icon={<GoogleIcon />} />
              <Button1 label="Zaloguj się" onClick={() => navigate('/login')} />
            </div>
          </div>
        )}
      </div>

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

export default CompanyRegisterPage;
