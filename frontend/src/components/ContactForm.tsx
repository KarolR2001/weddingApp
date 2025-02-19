import React, { useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { sendMessage } from '../redux/slices/messagesSlice';
import styles from '../styles/ContactForm.module.css';
import CustomDatePicker from '../components/DatePicker';
import Input from '../components/forms/Input2';
import Dropdown3 from '../components/Dropdown3';
import Textarea from '../components/Textarea';
import Checkbox2 from '../components/Checkbox2';
import Button2 from '../components/Button2';
import Spinner from '../components/Spinner'; // Import komponentu Spinner
import SuccessIcon from '../assets/Success.svg'; 


interface ContactFormSectionProps {
  vendorId: number;
  recipientEmail: string;
  listingId: number;
}
interface ContactFormData {
  eventDate: Date | null;
  location: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
}
interface ValidationState {
    eventDate: boolean;
    location: boolean;
    name: boolean;
    email: boolean;
    phone: boolean;
    message: boolean;
    consent: boolean;
}

const ContactFormSection: React.FC<ContactFormSectionProps> = ({ vendorId, recipientEmail, listingId  }) => {
    const [text, setText] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const isLoggedIn = useSelector((state: RootState) => !!state.auth.token); // Sprawdź, czy użytkownik jest zalogowany
    const loggedInUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [formData, setFormData] = useState<ContactFormData>({
    eventDate: null,
    location: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
  });
  const [validation, setValidation] = useState<ValidationState>({
    eventDate: true,
    location: true,
    name: true,
    email: true,
    phone: true,
    message: true,
    consent: true,
});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateChange = (date: Date | null) => {
    setFormData((prevData) => ({
      ...prevData,
      eventDate: date,
    }));

    // Automatyczne usuwanie błędu, gdy data jest wybrana
    setValidation((prevValidation) => ({
      ...prevValidation,
      eventDate: date !== null, // Ustaw `true`, gdy data jest wybrana
    }));
};

  const handleSelect = (option: string) => {
    console.log("Selected option:", option);
  };
  const handleConsentChange = () => {
    setFormData((prevData) => ({
        ...prevData,
        consent: !prevData.consent,
    }));
    setValidation((prevValidation) => ({
        ...prevValidation,
        consent: !formData.consent,
    }));
};

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const location = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      location,
    }));
    setValidation((prevValidation) => ({
      ...prevValidation,
      location: location.trim() !== '',
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      name,
    }));
    setValidation((prevValidation) => ({
      ...prevValidation,
      name: name.trim() !== '',
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email,
    }));
    setValidation((prevValidation) => ({
      ...prevValidation,
      email: /\S+@\S+\.\S+/.test(email),
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '');
    setFormData((prevData) => ({
      ...prevData,
      phone,
    }));
    setValidation((prevValidation) => ({
      ...prevValidation,
      phone: phone.trim().length >= 9,
    }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      message,
    }));
    setValidation((prevValidation) => ({
      ...prevValidation,
      message: message.trim() !== '',
    }));
  };


  const handleSubmit = async () => {
     // Sprawdź, czy pola są poprawnie wypełnione
     const newValidation = {
        eventDate: formData.eventDate !== null,
        location: formData.location.trim() !== '',
        name: formData.name.trim() !== '',
        email: /\S+@\S+\.\S+/.test(formData.email),
        phone: formData.phone.trim().length >= 9,
        message: formData.message.trim() !== '',
        consent: formData.consent,
    };
    setValidation(newValidation);

    // Sprawdź, czy wszystkie pola są poprawne
    const isValid = Object.values(newValidation).every(Boolean);
    if (!isValid) return;
    const payload = {
        ...formData,
        eventDate: formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : null,
        recipientEmail,
        listingId,
    };
    setIsLoading(true);
    setIsSuccess(false);

    try {
        await axios.post('http://localhost:5000/auth/send-email', payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        setIsSuccess(true);

        // Jeśli użytkownik jest zalogowany, wyślij wiadomość wewnętrzną
        if (isLoggedIn && loggedInUserId) {
          dispatch(
            sendMessage({
              senderId: loggedInUserId,
              receiverId: vendorId, // Możemy użyć `recipientEmail` jako identyfikatora
              listingId,
              messageContent: formData.message,
            })
          );
        }

        setTimeout(() => {
            setIsSuccess(false);
            setFormData({
                eventDate: null,
                location: '',
                name: '',
                email: '',
                phone: '',
                message: '',
                consent: false,
                
            });
        }, 3000);
    } catch (error) {
        console.error('Nie udało się wysłać e-maila:', error);
    } finally {
        setIsLoading(false);
    }
};

return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.successMessage}><Spinner /></div>
      ) : isSuccess ? (
        <div className={styles.successMessage}>
          <img src={SuccessIcon} alt="Sukces" style={{ width: 300, height: 300 }} />
          <p>Wiadomość została wysłana pomyślnie!</p>
        </div>
      ) : (
        <div className={styles.form}>
          <h2 className={styles.title}>NAPISZ DO NAS</h2>
          <div className={styles.formGroup}>
            <CustomDatePicker
              placeholder="Data imprezy *"
              value={formData.eventDate}
              onChange={handleDateChange}
              isValid={validation.eventDate}
            />
            <Input
              placeholder="Miejsce *"
              type="text"
              value={formData.location}
              onChange={handleLocationChange}
              isValid={validation.location}
            />
          </div>

          <div className={styles.formGroup}>
            <Input
              placeholder="Imię *"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              isValid={validation.name}
            />
            <Input
              placeholder="E-mail *"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              isValid={validation.email}
            />
          </div>

          <div className={styles.formGroup}>
            <Dropdown3
              options={[
                '+48', '+49', '+44', '+33', '+39', '+34', '+1',
                '+7', '+81', '+86', '+61', '+91', '+52', '+55',
                '+47', '+46', '+45', '+41', '+31', '+32', '+30'
              ]}
              onSelect={handleSelect}
            />
            <Input
              placeholder="Telefon *"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              isValid={validation.phone}
            />
          </div>

          <div className={styles.formGroup}>
            <Textarea
              placeholder="Treść wiadomości *"
              value={formData.message}
              onChange={handleMessageChange}
              isValid={validation.message}
            />
          </div>

          <div className={styles.checkboxContainer}>
            <Checkbox2
              label={
                <>
                    Potwierdzam, że wysyłając tę wiadomość zakładam konto i akceptuję{' '}
                    <a href="/regulamin" target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Regulamin
                    </a>{' '}
                    Serwisu Weselny Zakątek i zapoznałem/łam się z{' '}
                    <a
                        href="/polityka-prywatnosci"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        Polityką Prywatności
                    </a>
                    , obowiązek informacyjny *
                </>
            }
              checked={formData.consent}
              onChange={handleConsentChange}
            />
            {!validation.consent && <span className={styles.errorText}>* Wymagane potwierdzenie</span>}
          </div>

          <div className={styles.buttonContainer}>
            <Button2 label="Wyślij" onClick={handleSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFormSection;