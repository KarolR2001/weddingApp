import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Review } from '../redux/slices/reviewsSlice';
import styles from '../styles/ReviewsSection.module.css';

interface StarRatingSummaryProps {
  reviews: Review[];
}

const StarRatingSummary: React.FC<StarRatingSummaryProps> = ({ reviews }) => {
  const calculateAverage = (key: keyof Review) => {
    const total = reviews.reduce((sum, review) => {
      //console.log(`Adding ${review[key]} to sum for key: ${key}`);
      return sum + Number(review[key]);
    }, 0);

    const average = total / reviews.length;
    //console.log(`Average for ${key}: ${average.toFixed(2)}`);
    return average;
  };
  const averageRating = useSelector((state: RootState) => state.reviews.averageRating);

  const averageQuality = calculateAverage('ratingQuality');
  const averageServiceAgreement = calculateAverage('ratingServiceAgreement');
  const averageCommunication = calculateAverage('ratingCommunication');
  const averageCreativity = calculateAverage('ratingCreativity');
  const averageAesthetics = calculateAverage('ratingAesthetics');



  const renderStars = (rating: number) => {
   // console.log(`Rendering stars for rating: ${rating}`);
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
      <h2 className={styles.averageRatingText}>Średnia ocen: {averageRating}</h2>
      <div className={styles.starRatingSummary}>
        <div className={styles.overallRatingBox}>
          <div className={styles.averageRating}>{averageRating}</div>
          <div className={styles.stars}>{renderStars(Number(averageRating))}</div>
        </div>
        <div className={styles.categories}>
          <div className={styles.category}>
            <span className={styles.categoryLabel}>Jakość obsługi:</span>
            <div className={styles.stars}>{renderStars(averageQuality)}</div>
          </div>
          <div className={styles.category}>
            <span className={styles.categoryLabel}>Zgodność z ustaleniami:</span>
            <div className={styles.stars}>{renderStars(averageServiceAgreement)}</div>
          </div>
          <div className={styles.category}>
            <span className={styles.categoryLabel}>Komunikatywność:</span>
            <div className={styles.stars}>{renderStars(averageCommunication)}</div>
          </div>
          <div className={styles.category}>
            <span className={styles.categoryLabel}>Kreatywność:</span>
            <div className={styles.stars}>{renderStars(averageCreativity)}</div>
          </div>
          <div className={styles.category}>
            <span className={styles.categoryLabel}>Estetyka:</span>
            <div className={styles.stars}>{renderStars(averageAesthetics)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarRatingSummary;
