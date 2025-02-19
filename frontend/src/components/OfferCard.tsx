import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from '../styles/OfferCard.module.css';
import { ReactComponent as LocationIcon } from '../assets/map-pin-alt.svg';
import MiniButton2 from './MiniButton2';

interface OfferCardProps {
  listingId:number;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  priceMin: number;
  priceMax: number;
  onClick: () => void;  // Funkcja na kliknięcie przycisku
}


const OfferCard: React.FC<OfferCardProps> = ({ listingId,title, location, description, imageUrl, priceMin, priceMax, onClick }) => {

    const navigate = useNavigate();

    const handleOfferClick = () => {
      navigate(`/listing/${listingId}`);
      };


  return (
    <div className={styles.offerCard}>
      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={title} className={styles.image} />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.locationWrapper}>
          <LocationIcon className={styles.locationIcon} />
          <div className={styles.locationText}>Jesteśmy z {location}</div>
        </div>
        <div className={styles.descriptionWrapper}>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.buttonAndPriceWrapper}> {/* Zmiana nazwy wrappera na bardziej odpowiednią */}
          <MiniButton2 label="Sprawdź ofertę" onClick={handleOfferClick} />
          <div className={styles.priceWrapper}> 
            <span className={styles.priceText}>
              {Math.round(priceMin)} - {Math.round(priceMax)} zł
            </span>
          </div>
        </div>
      </div>
    </div>

  );
};

export default OfferCard;
