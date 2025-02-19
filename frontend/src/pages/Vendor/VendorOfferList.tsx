import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import axios from 'axios';
import styles from '../../styles/OfferListPage.module.css';
import VendorOfferCard from '../../components/VendorOfferCard';
import Spinner from '../../components/Spinner'; 

const VendorOfferList: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const SERVER_URL = "http://localhost:5000";

  // Function to fetch offers from the server
  const fetchOffers = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        const response = await axios.get(`${SERVER_URL}/api/listings/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add token for protected routes if needed
          },
        });
        setOffers(response.data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania ofert:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch offers on component mount
  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className={styles.container}>
        <h2 className={styles.header}>Twoje ogłoszenia:</h2>
      <div className={styles.listContainer}>
        {loading ? (
          <Spinner />
        ) : Array.isArray(offers) && offers.length > 0 ? (
          offers.map((offer) => (
            <VendorOfferCard
              key={offer.listingId}
              listingId={offer.listingId}
              title={offer.title}
              location={offer.city}
              description={offer.shortDescription}
              imageUrl={offer.media[0]?.mediaUrl ? `${SERVER_URL}${offer.media[0].mediaUrl}` : 'https://via.placeholder.com/416x185'}
              priceMin={offer.priceMin}
              priceMax={offer.priceMax}
              onClick={() => alert(`Wybrano ofertę: ${offer.title}`)}
            />
          ))
        ) : (
          <p>Nie masz jeszcze ogłoszeń</p>
        )}
      </div>
    </div>
  );
};

export default VendorOfferList;
