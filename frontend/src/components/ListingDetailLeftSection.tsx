import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../redux/store';
import styles from '../styles/ListingDetailLeftSection.module.css';
import mapPinIcon from '../assets/map-pin-alt.svg';
import HeartOutlineIcon from '../assets/heartIcon.svg';
import HeartFilledIcon from '../assets/HeartFilledIcon.svg';
import ReviewsSection from '../components/ReviewsSection';

interface FilterOption {
  optionName: string;
  filterCategory: {
    filterName: string;
    displayType: string;
  };
}

interface ListingDetailLeftSectionProps {
  listingId: number; // Dodaj ID ogłoszenia
  title: string;
  city: string;
  aboutText: string;
  priceMin: string;
  priceMax: string;
  videoUrls: string[];
  filters: { filterOption: FilterOption }[];
}

const ListingDetailLeftSection: React.FC<ListingDetailLeftSectionProps> = ({
  listingId,
  title,
  city,
  aboutText,
  priceMin,
  priceMax,
  videoUrls,
  filters,
}) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const averageRating = useSelector((state: RootState) => state.reviews.averageRating); 
  const totalReviews = useSelector((state: RootState) => state.reviews.totalReviews);
  const [liked, setLiked] = useState(false);

  // Sprawdzenie, czy ogłoszenie jest ulubione podczas ładowania strony
  useEffect(() => {
    if (user && token) {
      axios
        .get(`http://localhost:5000/api/favorites/${user.id}/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setLiked(response.data.isFavorite);
        })
        .catch((error) => {
          console.error('Error checking favorite status:', error);
        });
    }
  }, [user, token, listingId]);

  const handleLikeClick = () => {
    if (!user || !token) {
      console.log('Użytkownik musi być zalogowany, aby dodać do ulubionych.');
      return;
    }

    const endpoint = liked
      ? `http://localhost:5000/api/favorites/remove`
      : `http://localhost:5000/api/favorites/add`;

    axios
      .post(
        endpoint,
        { userId: user.id, listingId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setLiked(!liked);
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error('Error updating favorite status:', error);
      });
  };

  const groupedFilters = filters.reduce((acc: Record<string, { displayType: string; options: string[] }>, filter) => {
    const { filterName, displayType } = filter.filterOption.filterCategory;
    const optionName = filter.filterOption.optionName;
    if (!acc[filterName]) {
      acc[filterName] = { displayType, options: [] };
    }
    acc[filterName].options.push(optionName);
    return acc;
  }, {});

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviewsSection');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {Array(fullStars)
          .fill(null)
          .map((_, i) => (
            <span key={`full-${i}`} className={styles.starFull}>★</span>
          ))}
        {halfStar && <span className={styles.starHalf}>★</span>}
        {Array(emptyStars)
          .fill(null)
          .map((_, i) => (
            <span key={`empty-${i}`} className={styles.starEmpty}>★</span>
          ))}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.locationRating}>
            <img src={mapPinIcon} alt="Location" />
            <span className={styles.locationText}>{city}</span>
            <div className={styles.rating}>{renderStars(Number(averageRating))}</div>
            <a onClick={scrollToReviews} className={styles.addOpinion}>
              ({totalReviews}) Dodaj opinię
            </a>
          </div>
        </div>
        {user && (
          <img
            src={liked ? HeartFilledIcon : HeartOutlineIcon}
            alt="Like"
            className={styles.likeIcon}
            onClick={handleLikeClick}
          />
        )}
      </div>

      <div className={styles.sectionHeader}>
        <div>O nas</div>
        <div className={styles.line}></div>
      </div>
      <div className={styles.aboutText}> <div style={{ whiteSpace: 'pre-wrap' }}>{aboutText}</div></div>

      <div className={styles.sectionHeader}>
        <span>Oferta</span>
        <div className={styles.line}></div>
      </div>

      <div className={styles.offer}>
        <ul className={styles.servicesList}>
          {Object.entries(groupedFilters).map(([filterName, { displayType, options }]) => (
            <li key={filterName} className={styles.filterItem}>
              <strong>{filterName}:</strong>
              {displayType === 'checkbox' ? (
                <ul>
                  {options.map((option, index) => (
                    <li key={index}>- {option}</li>
                  ))}
                </ul>
              ) : (
                <span> {options[0]}</span>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.priceSection}>
          <span>
            Cena:<strong> Od {priceMin} do {priceMax} zł</strong>
          </span>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <span>Video prezentacja</span>
        <div className={styles.line}></div>
      </div>

      <div className={styles.videoGallery}>
        {videoUrls.length > 0 ? (
          videoUrls.map((url, index) => (
            <div key={index} className={styles.videoContainer}>
              <iframe
                className={styles.fullSizeVideo}
                src={url}
                title={`Video ${index + 1}`}
                allowFullScreen
              ></iframe>
            </div>
          ))
        ) : (
          <p>Brak dostępnych wideo.</p>
        )}
      </div>
      <ReviewsSection />
    </div>
  );
};

export default ListingDetailLeftSection;
