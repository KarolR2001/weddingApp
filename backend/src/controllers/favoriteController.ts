import { Request, Response, NextFunction } from 'express';
import { Favorite } from '../models/favorite';
import { Media } from '../models/media';
import { VendorListing } from '../models/vendorListing';

// Dodanie ogłoszenia do ulubionych
export const addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, listingId } = req.body;

    // Sprawdzenie, czy ogłoszenie jest już w ulubionych
    const existingFavorite = await Favorite.findOne({ where: { userId, listingId } });
    if (existingFavorite) {
      res.status(400).json({ message: 'Ogłoszenie jest już w ulubionych.' });
      return;
    }

    // Dodanie ogłoszenia do ulubionych
    await Favorite.create({ userId, listingId });
    res.status(201).json({ message: 'Dodano ogłoszenie do ulubionych.' });
  } catch (error) {
    console.error('Błąd przy dodawaniu do ulubionych:', error);
    next(error);
  }
};

// Usuwanie ogłoszenia z ulubionych
export const removeFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, listingId } = req.body;

    const favorite = await Favorite.findOne({ where: { userId, listingId } });
    if (!favorite) {
      res.status(404).json({ message: 'Ogłoszenie nie znajduje się w ulubionych.' });
      return;
    }

    await favorite.destroy();
    res.status(200).json({ message: 'Usunięto ogłoszenie z ulubionych.' });
  } catch (error) {
    console.error('Błąd przy usuwaniu z ulubionych:', error);
    next(error);
  }
};

// Sprawdzanie, czy ogłoszenie jest ulubione
export const isFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, listingId } = req.params;

    const favorite = await Favorite.findOne({ where: { userId, listingId } });
    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Błąd przy sprawdzaniu ulubionych:', error);
    next(error);
  }
};
export const getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    // Pobranie wszystkich ulubionych ogłoszeń dla danego użytkownika
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: VendorListing,
          as: 'listing', // Upewnij się, że ta asocjacja jest poprawna
          attributes: ['listingId', 'title', 'shortDescription', 'priceMin', 'priceMax', 'city'],
          include: [
            {
              model: Media,
              as: 'media',
              attributes: ['mediaId', 'mediaType', 'mediaUrl'],
              where: { mediaType: 'image' }, // Tylko zdjęcia
              limit: 1, // Pobierz tylko jedno zdjęcie
              required: false, // Pozwala na listingi bez zdjęcia
            },
          ],
        },
      ],
    });

    res.status(200).json({ favorites });
  } catch (error) {
    console.error('Błąd przy pobieraniu ulubionych ogłoszeń:', error);
    next(error);
  }
};