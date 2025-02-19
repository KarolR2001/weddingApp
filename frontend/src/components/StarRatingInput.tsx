import React, { useState } from 'react';
import styles from '../styles/ReviewsSection.module.css';
import warningIcon from '../assets/warning.svg';

interface StarRatingInputProps {
  label: string;
  onChange: (rating: number) => void;
  isValid?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ label, onChange, isValid = true }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleStarClick = (index: number) => {
    setRating(index);
    onChange(index);
  };

  const handleStarHover = (index: number) => {
    setHoverRating(index);
  };

  const handleStarHoverOut = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    return (
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={
              i < (hoverRating || rating)
                ? styles.starFull
                : styles.starEmpty
            }
            onClick={() => handleStarClick(i + 1)}
            onMouseEnter={() => handleStarHover(i + 1)}
            onMouseLeave={handleStarHoverOut}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.category}>
      <span className={styles.categoryLabel}>{label}</span>
      {renderStars()}
      {!isValid && <img src={warningIcon} alt="Warning" className={styles.warningIcon} />}
    </div>
  );
};

export default StarRatingInput;
