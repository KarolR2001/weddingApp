// reviewsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Review {
  reviewId: number;
  ratingQuality: number;
  ratingCommunication: number;
  ratingCreativity: number;
  ratingServiceAgreement: number;
  ratingAesthetics: number;
  reviewText: string;
  weddingDate: string;
  location: string;
  reviewerName: string;
  created_at: string;
}

interface ReviewsState {
  reviews: Review[];
  totalReviews: number;
  averageRating: string;
  listingId: string | null; // Dodaj pole listingId
}

const initialState: ReviewsState = {
  reviews: [],
  totalReviews: 0,
  averageRating: '0.0',
  listingId: null, // Inicjalizuj listingId jako null
};

// Funkcja do obliczania średniej oceny
const calculateAverageRating = (reviews: Review[]): string => {
  if (reviews.length === 0) return '0.0';

  const totalRatings = reviews.reduce((acc, review) => {
    const ratings = [
      review.ratingQuality,
      review.ratingServiceAgreement,
      review.ratingCommunication,
      review.ratingCreativity,
      review.ratingAesthetics,
    ];

    // Filtruj nieprawidłowe wartości
    const validRatings = ratings.filter((r) => typeof r === 'number' && !isNaN(r));

    const averageReviewRating = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;

    return acc + averageReviewRating;
  }, 0);

  return (totalRatings / reviews.length).toFixed(2);
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews(state, action: PayloadAction<{ reviews: Review[]; listingId: string }>) {
      console.log('Setting reviews:', action.payload.reviews);
      state.reviews = action.payload.reviews;
      state.totalReviews = action.payload.reviews.length;
      state.averageRating = calculateAverageRating(action.payload.reviews);
      state.listingId = action.payload.listingId;
    },
    addReview(state, action: PayloadAction<Review>) {
      console.log('Before adding review:', state.reviews);
      state.reviews = [...state.reviews, action.payload];
      console.log('After adding review:', state.reviews);
      state.totalReviews += 1;
      state.averageRating = calculateAverageRating(state.reviews);
      console.log('Updated reviews state:', state.reviews);
    },
  },
});

export const { setReviews, addReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;
