import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveComponent } from '../redux/slices/activeComponentSlice';
import styles from '../styles/OfferCard.module.css';
import { ReactComponent as LocationIcon } from '../assets/map-pin-alt.svg';
import MiniButton2 from './MiniButton2';

interface VendorOfferCardProps {
  listingId: number;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  priceMin: number;
  priceMax: number;
  onClick: () => void;  // Funkcja na kliknięcie przycisku
}

const VendorOfferCard: React.FC<VendorOfferCardProps> = ({ listingId, title, location, description, imageUrl, priceMin, priceMax }) => {
  const dispatch = useDispatch();

  const handleOfferClick = () => {
    dispatch(setActiveComponent({ component: 'offerListDetail', selectedListingId: listingId, viewSidebar: 'details' }));
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
        <div className={styles.buttonAndPriceWrapper}>
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

export default VendorOfferCard;
