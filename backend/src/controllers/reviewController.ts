import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/review';
import { VendorListing } from '../models/vendorListing';
import { NotificationService } from '../services/NotificationService';


export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    listingId,
    userId,
    ratingQuality,
    ratingCommunication,
    ratingCreativity,
    ratingServiceAgreement,
    ratingAesthetics,
    reviewText,
    weddingDate,
    location,
    reviewerName,
    reviewerPhone,
  } = req.body;

  try {
    // Walidacja wymaganych pól
    if (!listingId || !userId || !ratingQuality || !ratingCommunication || !ratingCreativity || !ratingServiceAgreement || !ratingAesthetics) {
      res.status(400).json({ message: 'Brak wymaganych pól.' });
      return;
    }

    // Dodanie opinii do bazy danych
    const createdReview = await Review.create({
      listingId,
      userId,
      ratingQuality,
      ratingCommunication,
      ratingCreativity,
      ratingServiceAgreement,
      ratingAesthetics,
      reviewText,
      weddingDate,
      location,
      reviewerName,
      reviewerPhone,
    });

    // Pobranie pełnych danych opinii, w tym pola 'created_at'
    const newReview = await Review.findByPk(createdReview.reviewId);

    // Pobranie danych ogłoszenia
    const vendorListing = await VendorListing.findByPk(listingId);

    if (!vendorListing) {
      res.status(404).json({ message: 'Ogłoszenie nie zostało znalezione.' });
      return;
    }

    const vendorId = vendorListing.vendorId;

    // Wysłanie powiadomienia do usługodawcy
    await NotificationService.createAutomaticNotification({
      userId: vendorId,
      message: `Dodano nową opinię do ogłoszenia: "${vendorListing.title}"`,
      eventType: 'new_review',
      notificationType: 'app',
    });

    // Powiadomienie e-mail
    const emailNotificationMessage = `
      Otrzymałeś nową opinię w naszej aplikacji dla ogłoszenia:
      "${vendorListing.title}"`;

    await NotificationService.createAutomaticNotification({
      userId: vendorId,
      message: emailNotificationMessage,
      eventType: 'new_review',
      notificationType: 'email',
    });

    res.status(201).json({
      message: 'Opinia została dodana pomyślnie.',
      review: newReview,
    });
  } catch (error) {
    console.error('Błąd podczas dodawania opinii:', error);
    next(error);
  }
};
