import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import axios from 'axios';
import NoLoginTopMenu from '../components/NoLoginTopMenu';
import LoginTopMenu from '../components/LoginTopMenu';
import FilterComponent from '../components/FilterComponent';
import styles from '../styles/OfferListPage.module.css';
import OfferCard from '../components/OfferCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner'; // Dodaj komponent Spinner (zdefiniowany niżej)

const OfferListPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Dodaj stan dla ładowania
  const selectedCategory = useSelector((state: RootState) => state.filters.selectedCategoryId);
  const selectedFilters = useSelector((state: RootState) => state.filters.selectedFilters);
  const selectedTravelOption = useSelector((state: RootState) => state.filters.selectedTravelOption);
  const selectedCity = useSelector((state: RootState) => state.filters.selectedCity);
  const sortOption = useSelector((state: RootState) => state.filters.sortOption);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const SERVER_URL = "http://localhost:5000";

  // Function to fetch offers from the server based on filters
  const fetchOffers = async () => {
/*     console.log('Rozpoczęcie pobierania ofert:', {
      selectedCategory,
      selectedFilters,
      selectedTravelOption,
      sortOption,
      currentPage,
    }); */
    setLoading(true); // Ustaw loading na true, gdy rozpoczyna się pobieranie
    try {
      const categoryId = selectedCategory || 1;
      const response = await axios.post(`${SERVER_URL}/api/listings/category/${categoryId}`, {
        selectedFilters,
        selectedTravelOption,
        selectedCity,
        sortOption,
        page: currentPage,
        limit: 12,
      });
     // console.log('Odpowiedź z backendu:', response.data);  
      setOffers(response.data.listings);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      //console.error('Błąd podczas pobierania ofert:', error);
      setOffers([]); // Wyczyść oferty w przypadku błędu
    } finally {
      //console.log('Zakończenie fetchOffers');
      setLoading(false); // Ustaw loading na false po zakończeniu pobierania (sukces lub błąd)
    }
  };
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchOffers();
  }, [selectedCategory, selectedFilters, currentPage]);

  return (
    <div className={styles.container}>
      {token && user ? <LoginTopMenu /> : <NoLoginTopMenu />}
      <FilterComponent onFilter={fetchOffers} /> 

      <div className={styles.listContainer}>
        {loading ? (
          <Spinner /> // Wyświetl spinner, gdy trwa ładowanie
        ) : Array.isArray(offers) && offers.length > 0 ? (
          offers.map((offer) => (
            <OfferCard
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
          <p>Brak dostępnych ofert</p>
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default OfferListPage;
