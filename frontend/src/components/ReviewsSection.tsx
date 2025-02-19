// ReviewsSection.tsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import styles from '../styles/ReviewsSection.module.css';
import StarRatingSummary from './StarRatingSummary';
import TextReviewsList from './TextReviewsList';
import Button from './Button2';
import AddReviewModal from './AddReviewModal';

const ReviewsSection: React.FC = () => {
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const totalReviews = useSelector((state: RootState) => state.reviews.totalReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddReviewClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    // Wymusza renderowanie przy każdej zmianie liczby opinii
    console.log('Total reviews changed:', totalReviews);
  }, [totalReviews]);

 
  return (
    <div className={styles.containerReview} id="reviewsSection">
      <div className={styles.sectionHeaderNav}>
        <div>Opinie ({totalReviews})</div>
        <div className={styles.line}></div>
      </div>
      <Button label="+ DODAJ OPINIĘ" onClick={handleAddReviewClick} />
     <AddReviewModal isOpen={isModalOpen} onClose={handleModalClose} />
      {totalReviews > 0 && <StarRatingSummary reviews={reviews} />}  
      {totalReviews > 0 && <TextReviewsList />} 
    </div>
  );
};

export default ReviewsSection;
