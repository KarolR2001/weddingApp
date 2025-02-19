import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import styles from '../styles/AddReviewModal.module.css';
import StarRatingInput from './StarRatingInput';
import Input from '../components/forms/Input2';
import Dropdown3 from '../components/Dropdown3';
import Textarea from '../components/Textarea';
import CustomDatePicker from '../components/DatePicker';
import Checkbox2 from '../components/Checkbox2';
import Button2 from '../components/Button2';
import Spinner from '../components/Spinner';
import SuccessIcon from '../assets/Success.svg';
import { addReview } from '../redux/slices/reviewsSlice';
import axios from 'axios';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
  const userId = user ? user.id : 3;
  const listingId = useSelector((state: RootState) => state.reviews.listingId);
  const [ratings, setRatings] = useState({
    ratingQuality: 0,
    ratingCommunication: 0,
    ratingCreativity: 0,
    ratingServiceAgreement: 0,
    ratingAesthetics: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+48');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toggleText = () => setIsExpanded(!isExpanded);
  const [validation, setValidation] = useState({
    reviewerName: true,
    weddingDate: true,
    location: true,
    reviewerPhone: true,
    reviewText: true,
    consent: true,
    ratings: {
      ratingQuality: true,
      ratingCommunication: true,
      ratingCreativity: true,
      ratingServiceAgreement: true,
      ratingAesthetics: true,
    },
  });

  const handleRatingChange = (key: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [key]: rating }));
    setValidation((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: rating > 0 },
    }));
  };
  const resetForm = () => {
    setRatings({
      ratingQuality: 0,
      ratingCommunication: 0,
      ratingCreativity: 0,
      ratingServiceAgreement: 0,
      ratingAesthetics: 0,
    });
    setReviewText('');
    setWeddingDate(null);
    setLocation('');
    setReviewerName('');
    setReviewerPhone('');
    setCountryCode('+48');
    setConsent(false);
    setValidation({
      reviewerName: true,
      weddingDate: true,
      location: true,
      reviewerPhone: true,
      reviewText: true,
      consent: true,
      ratings: {
        ratingQuality: true,
        ratingCommunication: true,
        ratingCreativity: true,
        ratingServiceAgreement: true,
        ratingAesthetics: true,
      },
    });
  };
  
  const handleSubmit = async () => {
    // Sprawdzanie walidacji przy wysyłaniu
    const isValid = validateFields();
    if (!isValid) return;

    const reviewData = {
      listingId,
      userId,
      ...ratings,
      reviewText,
      weddingDate: weddingDate ? weddingDate.toISOString().split('T')[0] : '',
      location,
      reviewerName,
      reviewerPhone: `${countryCode} ${reviewerPhone}`,
    };

    setIsLoading(true);
    setIsSuccess(false);

    try {
        const response = await axios.post('http://localhost:5000/api/reviews/add', reviewData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response.data);
      dispatch(addReview(response.data.review));
      setIsSuccess(true);
      resetForm();
      // Resetuje stan po 3 sekundach
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
    }, 3000);
    } catch (error) {
    console.error('Error saving review:', error);
    } finally {
    setIsLoading(false);
    }
    };

  const validateFields = () => {
    const newValidation = {
      reviewerName: reviewerName.trim() !== '',
      weddingDate: weddingDate !== null,
      location: location.trim() !== '',
      reviewerPhone: reviewerPhone.trim().length >= 9,
      reviewText: reviewText.trim() !== '',
      consent: consent,
      ratings: {
        ratingQuality: ratings.ratingQuality > 0,
        ratingCommunication: ratings.ratingCommunication > 0,
        ratingCreativity: ratings.ratingCreativity > 0,
        ratingServiceAgreement: ratings.ratingServiceAgreement > 0,
        ratingAesthetics: ratings.ratingAesthetics > 0,
      },
    };
    setValidation(newValidation);
    return Object.values(newValidation).every(Boolean) &&
      Object.values(newValidation.ratings).every(Boolean);
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConsentChange = () => {
    setConsent(!consent);
    setValidation((prev) => ({ ...prev, consent: true }));
  };

  // Funkcje do filtrowania niepoprawnych znaków
  const handleNameChange = (value: string) => {
    const filteredValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, ''); // Tylko litery i polskie znaki
    setReviewerName(filteredValue);
    setValidation((prev) => ({ ...prev, reviewerName: filteredValue.trim() !== '' }));
  };

  const handlePhoneChange = (value: string) => {
    const filteredValue = value.replace(/[^0-9]/g, ''); // Tylko cyfry
    setReviewerPhone(filteredValue);
    setValidation((prev) => ({ ...prev, reviewerPhone: filteredValue.trim().length >= 9 }));
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setValidation((prev) => ({ ...prev, location: value.trim() !== '' }));
  };

  const handleReviewTextChange = (value: string) => {
    setReviewText(value);
    setValidation((prev) => ({ ...prev, reviewText: value.trim() !== '' }));
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        ) : isSuccess ? (
          <div className={styles.successContainer}>
            <img src={SuccessIcon} alt="Sukces" className={styles.successIcon} />
            <p>Opinia została pomyślnie dodana!</p>
          </div>
        ) : (
            <div className={styles.modalContent}>
        <div className={styles.starRatingInput}>
          <StarRatingInput
            label="Jakość obsługi:"
            onChange={(rating) => handleRatingChange('ratingQuality', rating)}
            isValid={validation.ratings.ratingQuality}
          />
          <StarRatingInput
            label="Zgodność z ustaleniami:"
            onChange={(rating) => handleRatingChange('ratingServiceAgreement', rating)}
            isValid={validation.ratings.ratingServiceAgreement}
          />
          <StarRatingInput
            label="Komunikatywność:"
            onChange={(rating) => handleRatingChange('ratingCommunication', rating)}
            isValid={validation.ratings.ratingCommunication}
          />
          <StarRatingInput
            label="Kreatywność:"
            onChange={(rating) => handleRatingChange('ratingCreativity', rating)}
            isValid={validation.ratings.ratingCreativity}
          />
          <StarRatingInput
            label="Estetyka:"
            onChange={(rating) => handleRatingChange('ratingAesthetics', rating)}
            isValid={validation.ratings.ratingAesthetics}
          />
        </div>
        
        <div className={styles.reviewAddForm}>
          <div className={styles.formGroup}>
            <Input 
              placeholder="Imię *" 
              type="text" 
              value={reviewerName} 
              onChange={(e) => handleNameChange(e.target.value)} 
              isValid={validation.reviewerName} 
            />
            <Dropdown3
              options={['+48', '+49', '+44', '+33']}
              onSelect={(option) => setCountryCode(option)}
            />
            <Input
              placeholder="Telefon (nie będzie opublikowany) *"
              type="tel"
              value={reviewerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              isValid={validation.reviewerPhone} 
            />
          </div>
          <div className={styles.formGroup}>
            <CustomDatePicker
              placeholder="Data uroczystości *"
              value={weddingDate}
              onChange={(date) => {
                setWeddingDate(date);
                setValidation((prev) => ({ ...prev, weddingDate: date !== null }));
              }}
              isValid={validation.weddingDate}
            />
            <Input
              placeholder="Miejsce *"
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              isValid={validation.location} 
            />
          </div>
          <div className={styles.formGroup}>
            <Textarea
              placeholder="Treść wiadomości *"
              value={reviewText}
              onChange={(e) => handleReviewTextChange(e.target.value)}
              isValid={validation.reviewText}
            />
          </div>

          <div className={styles.checkboxContainer}>
          <Checkbox2
            label={
                <>
                    {isExpanded ? (
                      <>
                        <p>
                          Wyrażam dobrowolną zgodę na przetwarzanie przez Weselny Zakątek Karol Rembiasz moich danych osobowych takich jak: Imię, data uroczystości, miasto, treść opinii, nr IP urządzenia, a w szczególności nr telefonu, podanych dobrowolnie za pośrednictwem tego formularza w celu dodania opinii w Serwisie Weselny Zakątek.
                        </p>
                        <p>
                          Wyrażona zgoda może zostać cofnięta w dowolnym momencie, bez żadnych negatywnych skutków oraz bez wpływu na zgodność z prawem przetwarzania danych, którego dokonano przed jej cofnięciem. Cofnięcia zgody dokonać można przez wysłanie informacji na adres <a href="mailto:anulowanieopini@weselnyzakątek.pl">anulowanieopini@weselnyzakątek.pl</a>.
                        </p>
                        <p>
                          Ze względu na możliwość wystąpienia próby manipulowania opiniami, każdy wpis wymaga podania w celach weryfikacyjnych numeru telefonu. Numer telefonu nie będzie publikowany na łamach Serwisu. Sposób wykorzystania nr telefonu: Na podstawie art. 6 ust.1 lit f) RODO, tj. prawnie uzasadniony interes Administratora, na podany nr telefonu zostanie jednorazowo przesłany kod weryfikacyjny SMS. W szczególnych sytuacjach, operator Administratora może wykonać na podany numer połączenie w celu dodatkowego potwierdzenia, iż numer ten rzeczywiście należy do osoby, która złożyła opinię.
                        </p>
                      </>
                    ) : (
                      <p>
                        Wyrażam dobrowolną zgodę na przetwarzanie przez Weselny Zakątek Karol Rembiasz moich danych osobowych takich jak: Imię, data uroczystości, miasto, treść opinii, nr IP urządzenia, a w szczególności nr telefonu, podanych dobrowolnie za pośrednictwem tego formularza w celu dodania opinii w Serwisie Weselny Zakątek.... <span className={styles.readMore} onClick={toggleText}>Pokaż więcej</span>
                      </p>
                    )}
                    {isExpanded && <span className={styles.readLess} onClick={toggleText}>Pokaż mniej</span>}
                  </>
                }
            checked={consent}
            onChange={handleConsentChange}
            />
            {!validation.consent && <span className={styles.errorText}>* Wymagane potwierdzenie</span>}
          </div>
        </div>
        
        <Button2 label="Dodaj opinię" onClick={handleSubmit} />
      </div>
    )}
    </div>
    </div>
  );
};

export default AddReviewModal;
