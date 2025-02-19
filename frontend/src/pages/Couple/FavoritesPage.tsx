import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../redux/store';
import styles from '../../styles/OfferListPage.module.css';
import OfferCard from '../../components/OfferCard';
import Spinner from '../../components/Spinner';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const SERVER_URL = 'http://localhost:5000';

  // Fetch favorites from the server
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        const response = await axios.get(`${SERVER_URL}/api/favorites/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add token for protected routes if needed
          },
        });
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania ulubionych ofert:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Twoje ulubione ogłoszenia:</h2>
      <div className={styles.listContainer}>
        {loading ? (
          <Spinner />
        ) : Array.isArray(favorites) && favorites.length > 0 ? (
          favorites.map((favorite) => (
            <OfferCard
              key={favorite.listing.listingId}
              listingId={favorite.listing.listingId}
              title={favorite.listing.title}
              location={favorite.listing.city}
              description={favorite.listing.shortDescription}
              imageUrl={
                favorite.listing.media[0]?.mediaUrl
                  ? `${SERVER_URL}${favorite.listing.media[0].mediaUrl}`
                  : 'https://via.placeholder.com/416x185'
              }
              priceMin={favorite.listing.priceMin}
              priceMax={favorite.listing.priceMax}
              onClick={() => alert(`Wybrano ofertę: ${favorite.listing.title}`)}
            />
          ))
        ) : (
          <p>Nie masz jeszcze ulubionych ogłoszeń</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
