import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setViewSidebar } from '../../redux/slices/activeComponentSlice';
import axios from 'axios';
import styles2 from '../../styles/Vendor/VendorReviewDetails.module.css';
import StarRatingSummary from '../../components/StarRatingSummary';
import TextReviewsList from '../../components/TextReviewsList';
import Spinner from '../../components/Spinner';
import { Review } from '../../redux/slices/reviewsSlice';
import { setReviews } from '../../redux/slices/reviewsSlice';
import { RootState } from '../../redux/store';

const SERVER_URL = "http://localhost:5000";

interface Listing {
  listingId: number;
  title: string;
  city: string;
  reviews: Review[];
}

const VendorReviewDetails: React.FC = () => {
  const listingId = useSelector((state: RootState) => state.activeComponent.selectedListingId);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Dodanie stanu ładowania

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setViewSidebar('details'));
  }, [dispatch]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        console.error('Brak listingId w stanie Redux.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${SERVER_URL}/api/listings/listing/${listingId}`);
        setListing(response.data);
        dispatch(setReviews({ reviews: response.data.reviews, listingId: String(listingId) }));
      } catch (error) {
        console.error('Błąd podczas pobierania szczegółów oferty:', error);
      } finally {
        setIsLoading(false); // Ustawienie ładowania na false po zakończeniu
      }
    };

    fetchListing();
  }, [dispatch, listingId]);

  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const totalReviews = useSelector((state: RootState) => state.reviews.totalReviews);

  useEffect(() => {
    console.log('Total reviews changed:', totalReviews);
  }, [totalReviews]);

  return (
    <div className={styles2.containerReview} id="reviewsSection">
      {isLoading ? (
        <div className={styles2.spinnerContainer}>
          <Spinner /> {/* Wyświetlanie komponentu Spinner podczas ładowania */}
        </div>
      ) : (
        <>
          <div className={styles2.headerContainer}>
            <div className={styles2.headerTitle}>Opinie i oceny</div>
            <div className={styles2.subHeader}>
              Ogłoszenie: {listing?.title || 'Nazwa ogłoszenia'}
            </div>
          </div>
          {totalReviews > 0 ? (
            <>
              <StarRatingSummary reviews={reviews} />
              <TextReviewsList />
            </>
          ) : (
            <p className={styles2.subHeader}>Brak opinii dla tego ogłoszenia.</p>
          )}
        </>
      )}
    </div>
  );
};

export default VendorReviewDetails;
