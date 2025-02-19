import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual  } from 'react-redux';
import { RootState } from '../redux/store';
import { Review } from '../redux/slices/reviewsSlice';
import styles from '../styles/ReviewsSection.module.css';
import mapPinIcon from '../assets/map-pin-alt.svg'; 
import angleDownIcon from '../assets/angle-down.svg'; 
import MiniDropdown from './MiniDropdown';

const TextReviewsList: React.FC = () => {
  const reviews = useSelector(
    (state: RootState) => state.reviews.reviews.slice(),
    shallowEqual
  );  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('SORTOWANIE: NAJNOWSZE');
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);

  const toggleExpand = (reviewId: number) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };

  const handleSortSelect = (option: string) => {
    setSortOption(option);
  };

  const calculateOverallRating = (review: Review) => {
    const total =
      review.ratingQuality +
      review.ratingServiceAgreement +
      review.ratingCommunication +
      review.ratingCreativity +
      review.ratingAesthetics;
    return (total / 5).toFixed(1);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

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

  useEffect(() => {
    console.log('Reviews or sortOption changed, recalculating sortedReviews');
    const sorted = [...reviews].sort((a, b) => {
      const ratingA = Number(calculateOverallRating(a));
      const ratingB = Number(calculateOverallRating(b));
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      if (sortOption === 'SORTOWANIE: NAJWYŻSZA OCENA') {
        return ratingB - ratingA;
      } else if (sortOption === 'SORTOWANIE: NAJNIŻSZA OCENA') {
        return ratingA - ratingB;
      } else if (sortOption === 'SORTOWANIE: NAJNOWSZE') {
        return dateB - dateA;
      } else if (sortOption === 'SORTOWANIE: NAJSTARSZE') {
        return dateA - dateB;
      }
      return 0;
    });

    setSortedReviews(sorted);
  }, [reviews, sortOption]);

  useEffect(() => {
    if (sortedReviews.length > 0) {
      setExpandedReviewId(sortedReviews[0].reviewId);
    }
  }, [sortedReviews]);

  return (
    <div className={styles.reviewsList}>
      <div className={styles.sectionHeader}>
        <div className={styles.line}></div>
        <MiniDropdown
          label={sortOption}
          options={[
            'SORTOWANIE: NAJWYŻSZA OCENA',
            'SORTOWANIE: NAJNIŻSZA OCENA',
            'SORTOWANIE: NAJNOWSZE',
            'SORTOWANIE: NAJSTARSZE',
          ]}
          onSelect={handleSortSelect}
        />
      </div>
      
      {sortedReviews.map((review) => {
        const isExpanded = expandedReviewId === review.reviewId;

        return (
          <div key={review.reviewId} className={styles.reviewContainer}>
            <div className={styles.header}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>{getInitial(review.reviewerName)}</div>
              </div>
              
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerName}>
                  <div className={styles.nameStars}>
                  <strong>{review.reviewerName}</strong>
                  <div className={styles.stars}>{renderStars(Number(calculateOverallRating(review)))}
                  {calculateOverallRating(review)} / 5 </div>
                  </div>
                  <button
                    className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
                    onClick={() => toggleExpand(review.reviewId)}
                  >
                    <img src={angleDownIcon} alt="Expand" className={styles.angleIcon} />
                  </button>
                </div>


                <div className={styles.weddingDate}>Data ślubu: {review.weddingDate}</div>
              </div>
              <div className={styles.locationInfo}>
                <div className={styles.location}>
                  <img src={mapPinIcon} alt="Location icon" className={styles.mapPinIcon} />
                  {review.location}
                </div>
                <div className={styles.reviewDate}>
                  Data dodania: {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

             <div className={`${styles.categoryRatings} ${isExpanded ? styles.expanded : ''}`}>
              <div className={styles.category}>
                <span className={styles.categoryLabel}>Jakość obsługi:</span>
                <div className={styles.stars}>{renderStars(review.ratingQuality)}</div>
              </div>
              <div className={styles.category}>
                <span className={styles.categoryLabel}>Zgodność z ustaleniami:</span>
                <div className={styles.stars}>{renderStars(review.ratingServiceAgreement)}</div>
              </div>
              <div className={styles.category}>
                <span className={styles.categoryLabel}>Komunikatywność:</span>
                <div className={styles.stars}>{renderStars(review.ratingCommunication)}</div>
              </div>
              <div className={styles.category}>
                <span className={styles.categoryLabel}>Kreatywność:</span>
                <div className={styles.stars}>{renderStars(review.ratingCreativity)}</div>
              </div>
              <div className={styles.category}>
                <span className={styles.categoryLabel}>Estetyka:</span>
                <div className={styles.stars}>{renderStars(review.ratingAesthetics)}</div>
              </div>
            </div>
            <div className={styles.reviewText}>{review.reviewText}</div> 
          </div>
        );
      })} 
    </div>
  );
};

export default TextReviewsList;
