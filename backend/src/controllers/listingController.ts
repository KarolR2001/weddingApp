import { RequestHandler, Request, Response, NextFunction } from 'express';
import { VendorListing } from '../models/vendorListing';
import { Media } from '../models/media';
import { Favorite } from '../models/favorite';
import { Promotion } from '../models/promotion';
import { PaymentRecord } from '../models/paymentRecord';
import { Vendor } from '../models/vendor';
import { ListingFilter } from '../models/listingFilter';
import { FilterOption } from '../models/filterOption';
import { FilterCategory } from '../models/filterCategory';
import { Calendar } from '../models/calendar';
import { ListingStat } from '../models/listingStat';
import { ServiceCategory } from '../models/serviceCategory';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import fs from 'fs';
import path from 'path';
import haversine from 'haversine-distance'; 
import multer from 'multer';
import aiService from '../services/aiService';



// Typ dla danych z pliku cities.json
interface City {
  countryCode: string;
  postalCode: string;
  placeName: string;
  adminName1: string;
  adminCode1: string;
  adminName2: string;
  adminCode2: string;
  adminName3: string;
  adminCode3: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Wczytaj dane miast z pliku cities.json
const cities: City[] = JSON.parse(fs.readFileSync(path.join(__dirname, './cities.json'), 'utf-8'));
console.log('Liczba miast w cities:', cities.length);
const NEARBY_RADIUS_KM = 25;

export const getListingsByCategory: RequestHandler = async (req, res, next) => {
  const { categoryId } = req.params;
  const { selectedFilters, selectedTravelOption, selectedCity, sortOption, page = 1, limit = 10 } = req.body;

  try {
    console.log('Category ID:', categoryId);
    console.log('Opcja dojazdu:', selectedTravelOption);
    console.log('Wybrane miasto:', selectedCity);

    let whereConditions: any = { categoryId, isSuspended: false };
    let order: any[] = []; // Tutaj przechowujemy warunki sortowania

    // Domyślne sortowanie
    if (sortOption === 'Domyślnie') {
      order = [['created_at', 'DESC']]; // Sortowanie według daty dodania
    }

    // Sortowanie według ceny rosnąco
    if (sortOption === 'Cena: Od najniższej') {
      order = [['priceMin', 'ASC']];
    }

    // Sortowanie według ceny malejąco
    if (sortOption === 'Cena: Od najwyższej') {
      order = [['priceMax', 'DESC']];
    }

    // Sprawdzanie wybranego miasta
    const selectedCityData = cities.find(city => city.placeName.toLowerCase().trim() === selectedCity.toLowerCase().trim());
    if (!selectedCityData) {
      res.status(400).json({ error: 'Miasto nie zostało znalezione.' });
      return;
    }

    // Obsługa opcji "Tylko najbliższa okolica"
    if (selectedTravelOption === 'Tylko najbliższa okolica') {
      const listings = await VendorListing.findAll({
        where: { categoryId, isSuspended: false },
        attributes: ['listingId', 'city', 'rangeInKm', 'offersNationwideService'],
      });

      const nearbyListings = listings
        .map(listing => {
          if (!listing.city) {
            console.log(`Oferta ${listing.listingId} nie ma miasta`);
            return null;
          }

          const offerCityData = cities.find(city => city.placeName.toLowerCase().trim() === listing.city.toLowerCase().trim());
          if (!offerCityData) {
            console.log(`Nie znaleziono miasta dla oferty ${listing.listingId}: ${listing.city}`);
            return null;
          }

          // Oblicz odległość dla wszystkich ofert (nawet lokalnych, dla sortowania)
          const distanceInMeters = haversine(
            { lat: selectedCityData.latitude, lon: selectedCityData.longitude },
            { lat: offerCityData.latitude, lon: offerCityData.longitude }
          );
          const distanceInKm = distanceInMeters / 1000;

          // Zawsze uwzględniamy oferty z wybranej miejscowości
          if (listing.city.toLowerCase().trim() === selectedCity.toLowerCase().trim()) {
            console.log(`Oferta ${listing.listingId} jest z wybranej miejscowości: ${selectedCity}, odległość=${distanceInKm.toFixed(2)} km`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }

          // Uwzględnij oferty w zasięgu NEARBY_RADIUS_KM, jeśli offersNationwideService jest true
          if (listing.offersNationwideService && distanceInKm <= NEARBY_RADIUS_KM) {
            console.log(`Oferta ${listing.listingId} (nationwide) w zasięgu ${NEARBY_RADIUS_KM} km: odległość=${distanceInKm.toFixed(2)} km`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }

          // Uwzględnij oferty w zasięgu rangeInKm, jeśli offersNationwideService jest false
          if (!listing.offersNationwideService && typeof listing.rangeInKm === 'number' && distanceInKm <= listing.rangeInKm) {
            console.log(`Oferta ${listing.listingId}: odległość=${distanceInKm.toFixed(2)} km, rangeInKm=${listing.rangeInKm}`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }
          return null;
        })
        .filter(listing => listing !== null);

      if (nearbyListings.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Sortowanie po odległości, jeśli wybrano "Najbliżej" lub "Najdalej"
      if (sortOption === 'Najbliżej' || sortOption === 'Najdalej') {
        nearbyListings.sort((a, b) => {
          if (sortOption === 'Najbliżej') {
            return a!.distance - b!.distance; // Rosnąco
          } else {
            return b!.distance - a!.distance; // Malejąco
          }
        });
      }

      const listingIds = nearbyListings.map(listing => listing!.listingId);
      whereConditions.listingId = { [Op.in]: listingIds };
    }

    // Obsługa opcji "Pokaż oferty z dojazdem"
    if (selectedTravelOption === 'Pokaż oferty z dojazdem') {
      const listings = await VendorListing.findAll({
        where: { categoryId, isSuspended: false },
        attributes: ['listingId', 'city', 'rangeInKm', 'offersNationwideService'],
      });

      const listingsWithTravel = listings
        .map(listing => {
          if (!listing.city) {
            console.log(`Oferta ${listing.listingId} nie ma miasta`);
            return null;
          }

          const offerCityData = cities.find(city => city.placeName.toLowerCase().trim() === listing.city.toLowerCase().trim());
          if (!offerCityData) {
            console.log(`Nie znaleziono miasta dla oferty ${listing.listingId}: ${listing.city}`);
            return null;
          }

          // Oblicz odległość dla wszystkich ofert (nawet lokalnych i nationwide, dla sortowania)
          const distanceInMeters = haversine(
            { lat: selectedCityData.latitude, lon: selectedCityData.longitude },
            { lat: offerCityData.latitude, lon: offerCityData.longitude }
          );
          const distanceInKm = distanceInMeters / 1000;

          // Zawsze uwzględniamy oferty z wybranej miejscowości
          if (listing.city.toLowerCase().trim() === selectedCity.toLowerCase().trim()) {
            console.log(`Oferta ${listing.listingId} jest z wybranej miejscowości: ${selectedCity}, odległość=${distanceInKm.toFixed(2)} km`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }

          // Oferty z dojazd w każde miejsce
          if (listing.offersNationwideService) {
            console.log(`Oferta ${listing.listingId} ma dojazd w każde miejsce, odległość=${distanceInKm.toFixed(2)} km`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }

          // Uwzględnij oferty w zasięgu rangeInKm
          if (typeof listing.rangeInKm === 'number' && distanceInKm <= listing.rangeInKm) {
            console.log(`Oferta ${listing.listingId}: odległość=${distanceInKm.toFixed(2)} km, rangeInKm=${listing.rangeInKm}`);
            return { listingId: listing.listingId, distance: distanceInKm };
          }
          return null;
        })
        .filter(listing => listing !== null);

      if (listingsWithTravel.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Sortowanie po odległości, jeśli wybrano "Najbliżej" lub "Najdalej"
      if (sortOption === 'Najbliżej' || sortOption === 'Najdalej') {
        listingsWithTravel.sort((a, b) => {
          if (sortOption === 'Najbliżej') {
            return a!.distance - b!.distance; // Rosnąco
          } else {
            return b!.distance - a!.distance; // Malejąco
          }
        });
      }

      const listingIds = listingsWithTravel.map(listing => listing!.listingId);
      whereConditions.listingId = { [Op.in]: listingIds };
    }

    // Obsługa filtrów
    if (selectedFilters && Object.keys(selectedFilters).length > 0) {
      console.log('Przetwarzanie filtrów...');

      const listingIdsArrays: number[][] = [];

      for (const filterCategoryId in selectedFilters) {
        const filterData = selectedFilters[filterCategoryId];

        // Obsługa checkboxów
        if (typeof filterData === 'object' && !Array.isArray(filterData)) {
          const selectedOptionIds = Object.keys(filterData).filter(optionId => filterData[optionId] === true);
          if (selectedOptionIds.length > 0) {
            const listingFilters = await ListingFilter.findAll({
              where: {
                filterOptionId: { [Op.in]: selectedOptionIds },
              },
              attributes: ['listingId'],
              raw: true,
            });
            const listingIds = listingFilters.map(filter => filter.listingId);
            if (listingIds.length === 0) {
              res.status(200).json([]);
              return;
            }
            listingIdsArrays.push(listingIds);
          }
        }

        // Obsługa dropdownów
        if (typeof filterData === 'string' || typeof filterData === 'number') {
          const listingFilters = await ListingFilter.findAll({
            where: { filterOptionId: filterData },
            attributes: ['listingId'],
            raw: true,
          });
          const listingIds = listingFilters.map(filter => filter.listingId);
          if (listingIds.length === 0) {
            res.status(200).json([]);
            return;
          }
          listingIdsArrays.push(listingIds);
        }

        // Obsługa sliderów
        if (filterData.minValue !== undefined || filterData.maxValue !== undefined) {
          const minValue = filterData.minValue === '' ? undefined : filterData.minValue;
          const maxValue = filterData.maxValue === '' ? undefined : filterData.maxValue;
          if (minValue !== undefined || maxValue !== undefined) {
            whereConditions = {
              ...whereConditions,
              [Op.and]: [
                minValue !== undefined ? { priceMax: { [Op.gte]: minValue } } : {},
                maxValue !== undefined ? { priceMin: { [Op.lte]: maxValue } } : {},
              ],
            };
          }
        }
      }

      if (listingIdsArrays.length > 0) {
        let listingIdsSet = new Set(listingIdsArrays[0]);
        for (let i = 1; i < listingIdsArrays.length; i++) {
          const currentSet = new Set(listingIdsArrays[i]);
          listingIdsSet = new Set([...listingIdsSet].filter(id => currentSet.has(id))); // Przecięcie wyników
        }
        if (listingIdsSet.size === 0) {
          res.status(200).json([]);
          return;
        }
        whereConditions.listingId = { [Op.in]: Array.from(listingIdsSet) };
      }
    }

    // Pobieranie ofert
    const listings = await VendorListing.findAll({
      where: whereConditions,
      attributes: ['listingId', 'title', 'shortDescription', 'city', 'priceMin', 'priceMax'],
      include: [
        {
          model: Media,
          as: 'media',
          where: { mediaType: 'image' },
          attributes: ['mediaUrl'],
          required: false,
        },
      ],
      order, // Zastosowanie sortowania
    });
    console.log('Wszystkie ogłoszenia w kategorii:', listings.map(listing => listing.listingId));

    // Podzielenie wyników na strony po określonej liczbie ofert
    const totalListings = listings.length;
    const totalPages = Math.ceil(totalListings / limit);
    const paginatedListings = listings.slice((page - 1) * limit, page * limit);
    console.log('Paginated Listings IDs:', paginatedListings.map(listing => listing.listingId));
    if (paginatedListings.length === 0) {
      res.status(200).json({ listings: [], totalPages: 0 });
      return;
    }

    if (listings.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Pobierz ID ogłoszeń widocznych na danej stronie
    const paginatedListingIds = paginatedListings.map(listing => listing.listingId);

    // Pobierz istniejące wiersze statystyk
    const existingStats = await ListingStat.findAll({
      where: { listingId: { [Op.in]: paginatedListingIds } },
      attributes: ['listingId'],
    });
    const existingStatIds = existingStats.map(stat => stat.listingId);
    console.log('Existing Stat IDs:', existingStatIds);

    // Identyfikacja brakujących wierszy
    const missingStatIds = paginatedListingIds.filter(id => !existingStatIds.includes(id));
    console.log('Missing Stat IDs (to create):', missingStatIds);

    // Dodaj nowe wiersze dla brakujących statystyk
    if (missingStatIds.length > 0) {
      const newStats = missingStatIds.map(id => ({
        listingId: id,
        viewsCount: 1, // Pierwsze wyświetlenie
        clicksCount: 0,
        inquiriesCount: 0,
        avgBrowsingTime: 0,
        period: 'daily' as 'daily', // Jawne określenie typu
      }));
      console.log('New Stats to Create:', newStats);
      await ListingStat.bulkCreate(newStats);
      console.log('Created new stats for missing IDs.');
    }

    // Zaktualizuj liczbę wyświetleń dla istniejących wierszy
    if (existingStatIds.length > 0) {
      console.log('Incrementing viewsCount for IDs:', existingStatIds);
      const incrementPromises = existingStatIds.map(listingId => {
        console.log(`Incrementing views for listingId: ${listingId}`);
        return ListingStat.increment('viewsCount', {
          where: { listingId },
        });
      });

      await Promise.all(incrementPromises);
      console.log('Views count incremented for existing IDs.');
    }

    res.status(200).json({ listings: paginatedListings, totalPages });
  } catch (error) {
    console.error('Błąd podczas pobierania ofert:', error);
    next(error); // Obsługa błędów, przekazanie dalej do middleware
  }
};


import { Review } from '../models/review';
import { User } from '../models/user';

export const getListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const listingId = parseInt(req.params.listingId, 10);

  if (isNaN(listingId)) {
    res.status(400).json({ message: 'Invalid listing ID.' });
    return;
  }

  try {
    const listing = await VendorListing.findOne({
      where: { listingId },
      include: [
        {
          model: Media,
          as: 'media',
          attributes: ['mediaId', 'mediaType', 'mediaUrl', 'order', 'isMain'], 
        },
        {
          model: ListingFilter,
          as: 'listingFilters',
          include: [
            {
              model: FilterOption,
              as: 'filterOption',
              attributes: ['filterOptionId', 'optionName'],
              include: [
                {
                  model: FilterCategory,
                  as: 'filterCategory',
                  attributes: ['filterCategoryId', 'filterName', 'displayType'],
                },
              ],
            },
          ],
        },
        {
          model: Calendar,
          as: 'calendarEntries',
          attributes: ['calendarId', 'date', 'availabilityStatus'],
        },
        {
          model: Review,
          as: 'reviews',
          attributes: [
            'reviewId',
            'ratingQuality',
            'ratingCommunication',
            'ratingCreativity',
            'ratingServiceAgreement',
            'ratingAesthetics',
            'reviewText',
            'weddingDate',
            'location',
            'reviewerName',
            'reviewerPhone',
            'created_at',
          ],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'phoneNumber'],
            },
          ],
        },
      ],
    });

    if (!listing) {
      res.status(404).json({ message: 'Oferta o podanym ID nie istnieje.' });
      return;
    }

    // Aktualizacja kliknięć w statystykach
    const [stat] = await ListingStat.findOrCreate({
      where: { listingId, period: 'daily' },
      defaults: {
        listingId,
        viewsCount: 0,
        clicksCount: 0,
        inquiriesCount: 0,
        avgBrowsingTime: 0,
        period: 'daily',
      },
    });

    // Zwiększenie liczby kliknięć
    stat.clicksCount = (stat.clicksCount || 0) + 1;
    await stat.save();

    console.log(`Zwiększono clicksCount dla ogłoszenia o ID ${listingId}:`, stat.clicksCount);

    res.status(200).json(listing);
  } catch (error) {
    console.error('Błąd pobierania oferty:', error);
    next(error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images')); // Upewnij się, że ścieżka jest poprawna
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const upload = multer({ storage });

export const uploadImages = (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const imagePaths = files.map((file) => `/uploads/images/${file.filename}`);
  res.json({ imagePaths });
};


export const deleteImages = async (req: Request, res: Response) => {
  const { imageUrls } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    res.status(400).json({ message: 'No images specified for deletion.' });
    return;
  }

  try {
    imageUrls.forEach((imageUrl) => {
      const filePath = path.join(__dirname, '../../uploads/images', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.status(200).json({ message: 'Images deleted successfully.' });
  } catch (error) {
    console.error('Error deleting images:', error);

    if (error instanceof Error) {
      res.status(500).json({ message: 'Error deleting images.', error: error.message });
    } else {
      res.status(500).json({ message: 'Error deleting images.', error: 'Unknown error occurred.' });
    }
  }
};


export const addListing = async (req: Request, res: Response, next: NextFunction) => {
  const {
    vendorId,
    categoryId,
    titleOffer,
    shortDescription,
    longDescription,
    priceMin,
    priceMax,
    rangeInKm,
    offersNationwideService,
    contactPhone,
    email,
    city,
    filterOptions,
    media,
    links,
    isSuspended,
  } = req.body;

  const transaction = await sequelize.transaction();
  try {
    // Tworzenie nowego ogłoszenia
    const listing = await VendorListing.create(
      {
        vendorId,
        categoryId,
        title: titleOffer,
        shortDescription,
        longDescription,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        rangeInKm,
        offersNationwideService: Boolean(offersNationwideService),
        contactPhone,
        email,
        city: city,
        websiteUrl: links?.websiteUrl,
        facebookUrl: links?.facebookUrl,
        instagramUrl: links?.instagramUrl,
        youtubeUrl: links?.youtubeUrl,
        tiktokUrl: links?.tiktokUrl,
        spotifyUrl: links?.spotifyUrl,
        soundcloudUrl: links?.soundcloudUrl,
        pinterestUrl: links?.pinterestUrl,
        isSuspended: Boolean(isSuspended) || false,
      },
      { transaction }
    );

    // Dodanie mediów do nowego ogłoszenia z kolejnością i isMain
    if (Array.isArray(media) && media.length > 0) {
      const mediaEntries = media.map((mediaItem: { mediaType: 'image' | 'video'; mediaUrl: string }, index: number) => {
        if (mediaItem.mediaType !== 'image' && mediaItem.mediaType !== 'video') {
          throw new Error("Invalid mediaType: must be 'image' or 'video'");
        }

        let mediaUrl = mediaItem.mediaUrl;

        // Przetwarzanie linków wideo: zapisujemy tylko videoId
        if (mediaItem.mediaType === 'video') {
          const urlParts = mediaUrl.split('/');
          mediaUrl = urlParts[urlParts.length - 1]; // Zapisujemy tylko końcówkę (videoId)
        }

        // Przetwarzanie zdjęć: pełna ścieżka
        if (mediaItem.mediaType === 'image') {
          mediaUrl = mediaItem.mediaUrl; // Pełna ścieżka dla zdjęć
        }

        return {
          listingId: listing.listingId,
          mediaType: mediaItem.mediaType,
          mediaUrl: mediaUrl,
          order: index, // Ustawienie kolejności
          isMain: index === 0 && mediaItem.mediaType === 'image', // Pierwsze zdjęcie jest główne
        };
      });

      await Media.bulkCreate(mediaEntries, { transaction });
    }

    // Dodanie filtrów do ogłoszenia
    if (Array.isArray(filterOptions) && filterOptions.length > 0) {
      const filterEntries = filterOptions.map((optionId: number) => ({
        listingId: listing.listingId,
        filterOptionId: optionId,
      }));
      await ListingFilter.bulkCreate(filterEntries, { transaction });
    }

    // Zatwierdzenie transakcji
    await transaction.commit();
    // Wyzwól aktualizację embeddingu (nie blokuje odpowiedzi)
    aiService.post('/recommendation/updateEmbedding', { listingId: listing.listingId }).catch(() => {});

    res.status(201).json({ message: 'Ogłoszenie zostało dodane.', listingId: listing.listingId });
  } catch (error) {
    await transaction.rollback();
    console.error('Błąd dodawania ogłoszenia:', error);
    next(error);
  }
};


export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  const { listingId } = req.params;

  const transaction = await sequelize.transaction();
  try {
    // Sprawdzenie, czy ogłoszenie istnieje
    const listing = await VendorListing.findByPk(listingId);
    if (!listing) {
      res.status(404).json({ message: 'Ogłoszenie nie istnieje.' });
      return;
    }

    // Usuwanie powiązanych danych
    await Media.destroy({ where: { listingId }, transaction });
    await ListingFilter.destroy({ where: { listingId }, transaction });
    await Review.destroy({ where: { listingId }, transaction });
    await Calendar.destroy({ where: { listingId }, transaction });
    await Favorite.destroy({ where: { listingId }, transaction });
    await ListingStat.destroy({ where: { listingId }, transaction });
    await Promotion.destroy({ where: { listingId }, transaction });
    await PaymentRecord.destroy({ where: { listingId }, transaction });

    // Usunięcie samego ogłoszenia
    await VendorListing.destroy({ where: { listingId }, transaction });

    // Zatwierdzenie transakcji
    await transaction.commit();
    // Usuń embedding po usunięciu
    aiService.delete(`/recommendation/removeEmbedding/${listingId}`).catch(() => {});

    res.status(200).json({ message: 'Ogłoszenie oraz wszystkie powiązane dane zostały usunięte.' });
  } catch (error) {
    // Wycofanie transakcji w przypadku błędu
    await transaction.rollback();
    console.error('Błąd podczas usuwania ogłoszenia:', error);
    next(error);
  }
};

export const getListingsByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID.' });
    return;
  }

  try {
    const listings = await VendorListing.findAll({
      where: { vendorId: userId },
      include: [
        {
          model: Media,
          as: 'media',
          attributes: ['mediaId', 'mediaType', 'mediaUrl', 'order', 'isMain'],
        },
      ],
      order: [['created_at', 'DESC']], // Sortowanie od najnowszych
    });

    if (listings.length === 0) {
      res.status(404).json({ message: 'Nie znaleziono ogłoszeń dla podanego użytkownika.' });
      return;
    }

    res.status(200).json(listings);
  } catch (error) {
    console.error('Błąd pobierania ogłoszeń:', error);
    next(error);
  }
};


  
  export const getListingStatsWithFirstImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const listingId = parseInt(req.params.listingId, 10);
    console.log("Otrzymano żądanie dla listingId:", listingId);
  
    if (isNaN(listingId)) {
      console.error("Nieprawidłowy listingId:", req.params.listingId);
      res.status(400).json({ message: 'Invalid listing ID.' });
      return;
    }
  
    try {
      console.log("Rozpoczynam pobieranie statystyk dla listingId:", listingId);
  
      const listingStats = await ListingStat.findAll({
        where: { listingId },
      });
      console.log("Statystyki znalezione:", listingStats);
  
      const mainImage = await Media.findOne({
        where: { listingId, mediaType: 'image', isMain: true },
        attributes: ['mediaId', 'mediaUrl'],
      });
  
      const fallbackImage = !mainImage
        ? await Media.findOne({
            where: { listingId, mediaType: 'image' },
            attributes: ['mediaId', 'mediaUrl'],
            order: [['created_at', 'ASC']],
          })
        : null;
  
      const selectedImage = mainImage || fallbackImage;
      console.log("Wybrane zdjęcie:", selectedImage);
  
      // Pobranie ogłoszenia z dodatkowymi informacjami
      const listing = await VendorListing.findOne({
        where: { listingId },
        attributes: ['title', 'city', 'isSuspended'],
        include: [
          {
            model: ServiceCategory,
            as: 'category',
            attributes: ['categoryName'],
          },
        ],
      });
  
      if (!listing) {
        res.status(404).json({ message: 'Listing not found.' });
        return;
      }
  
      const responseData: {
        stats?: ListingStat[];
        firstImage?: Media | null;
        title?: string;
        city?: string;
        categoryName?: string;
        isSuspended?: boolean;
      } = {
        stats: listingStats.length > 0 ? listingStats : undefined,
        firstImage: selectedImage || undefined,
        title: listing.title,
        city: listing.city,
        categoryName: listing.category?.categoryName || undefined,
        isSuspended: listing.isSuspended,
      };
  
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  };
  
export const toggleSuspension = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const listingId = parseInt(req.params.listingId, 10);

  if (isNaN(listingId)) {
    res.status(400).json({ message: 'Invalid listing ID.' });
    return;
  }

  try {
    // Znalezienie ogłoszenia po ID
    const listing = await VendorListing.findByPk(listingId);

    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    // Przełączanie stanu `isSuspended`
    listing.isSuspended = !listing.isSuspended;

    // Zapisanie zmian w bazie
    await listing.save();

    // Wysłanie odpowiedzi do klienta
    res.status(200).json({
      message: `Listing suspension status updated successfully.`,
      listingId: listing.listingId,
      isSuspended: listing.isSuspended,
    });
  } catch (error) {
    console.error('Error toggling suspension:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error', error: 'Unknown error' });
    }
  }
};


export const updateListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { listingId, newMedia, mediaToRemove, existingMedia, filters, ...listingData } = req.body;

  if (!listingId) {
    res.status(400).json({ message: 'Listing ID is required.' });
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    const listing = await VendorListing.findByPk(listingId);
    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      await transaction.rollback();
      return;
    }

    await listing.update(listingData, { transaction });

    // Usuwanie mediów
    if (Array.isArray(mediaToRemove)) {
      for (const mediaUrl of mediaToRemove) {
        if (mediaUrl.includes('youtu.be')) {
          const videoId = mediaUrl.split('/').pop();
          await Media.destroy({
            where: { listingId, mediaUrl: videoId, mediaType: 'video' },
            transaction,
          });
        } else {
          const fullPath = path.join(__dirname, '../../uploads/images', path.basename(mediaUrl));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
          await Media.destroy({
            where: { listingId, mediaUrl, mediaType: 'image' },
            transaction,
          });
        }
      }
    }

    // Dodawanie nowych mediów z unikaniem duplikatów
    if (Array.isArray(newMedia)) {
      const existingMediaRecords = await Media.findAll({
        where: { listingId },
        attributes: ['mediaUrl', 'mediaType'],
        transaction,
      });
      const existingUrls = new Set(existingMediaRecords.map((m) => m.mediaUrl));

      const newMediaEntries = newMedia
        .map((media, index) => {
          let mediaUrl = media.mediaUrl;
          if (media.mediaType === 'video' && mediaUrl.includes('youtu.be')) {
            mediaUrl = mediaUrl.split('/').pop(); // Zapisujemy tylko videoId
          }
          return {
            ...media,
            mediaUrl,
            listingId,
            order: index,
            isMain: index === 0 && media.mediaType === 'image',
          };
        })
        .filter((media) => !existingUrls.has(media.mediaUrl)); // Pomijamy duplikaty

      if (newMediaEntries.length > 0) {
        await Media.bulkCreate(newMediaEntries, { transaction });
      }
    }

    // Aktualizacja kolejności istniejących mediów (tylko zdjęcia)
    if (Array.isArray(existingMedia)) {
      await Media.update(
        { isMain: false },
        { where: { listingId, mediaType: 'image' }, transaction }
      );

      for (const [index, media] of existingMedia.entries()) {
        await Media.update(
          {
            order: index,
            isMain: index === 0 && media.mediaType === 'image',
          },
          {
            where: { listingId, mediaUrl: media.mediaUrl, mediaType: 'image' },
            transaction,
          }
        );
      }
    }

    // Aktualizacja filtrów
    if (Array.isArray(filters)) {
      await ListingFilter.destroy({ where: { listingId }, transaction });
      const newFilters = filters.map((filterOptionId) => ({
        listingId,
        filterOptionId,
      }));
      await ListingFilter.bulkCreate(newFilters, { transaction });
    }

    await transaction.commit();
    // Zaktualizuj embedding po edycji
    aiService.post('/recommendation/updateEmbedding', { listingId }).catch(() => {});
    res.status(200).json({ message: 'Listing updated successfully.' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
  
  
  export const updateListingActivity = async (req: Request, res: Response): Promise<void> => {
    const { listingId, activeTime } = req.body;
  
    console.log('Żądanie przychodzące:', { listingId, activeTime });
  
    // Walidacja danych wejściowych
    if (!listingId || activeTime === undefined || typeof activeTime !== 'number') {
      console.error('Błąd walidacji danych wejściowych:', { listingId, activeTime });
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
  
    try {
      // Przeliczanie sekund na minuty i formatowanie
      const activeTimeInMinutes = activeTime / 60;
      const formattedTime = parseFloat(activeTimeInMinutes.toFixed(2)); // Formatowanie do 2 miejsc po przecinku
      console.log(`Przeliczony czas w minutach: ${formattedTime}`);
  
      // Pobranie istniejącego rekordu
      const listingStat = await ListingStat.findOne({ where: { listingId } });
      console.log('Pobrano rekord z bazy:', listingStat);
  
      if (!listingStat) {
        // Tworzenie nowego rekordu, jeśli nie istnieje
        console.log('Rekord nie istnieje. Tworzenie nowego.');
        await ListingStat.create({
          listingId,
          avgBrowsingTime: formattedTime,
          period: 'daily',
        });
        console.log('Nowy rekord został utworzony.');
      } else {
        // Konwersja avgBrowsingTime na liczbę
        const currentAvgBrowsingTime = parseFloat(String(listingStat.avgBrowsingTime || '0'));

        console.log('Obecny czas średni (w minutach):', currentAvgBrowsingTime);
  
        // Aktualizacja sumarycznego czasu przeglądania
        const updatedTotalTime = parseFloat(
          (currentAvgBrowsingTime + formattedTime).toFixed(2)
        );
        console.log('Obliczony nowy sumaryczny czas przeglądania:', updatedTotalTime);
  
        await listingStat.update({
          avgBrowsingTime: updatedTotalTime, // Aktualizacja w bazie
        });
  
        console.log('Rekord został zaktualizowany.');
      }
  
      res.status(200).json({ message: 'Browsing time updated successfully' });
    } catch (error) {
      console.error('Błąd podczas aktualizacji czasu przeglądania:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  



  
  const updateMostActiveDay = async (listingId: number) => {
    const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const today = days[new Date().getDay()];
  
    console.log(`updateMostActiveDay - listingId: ${listingId}, today: ${today}`);
  
    const query = `
      UPDATE ListingStats 
      SET active_days_distribution = JSON_SET(
        active_days_distribution, 
        '$.${today}', 
        COALESCE(JSON_EXTRACT(active_days_distribution, '$.${today}'), 0) + 1
      )
      WHERE listing_id = :listingId
    `;
  
    await sequelize.query(query, { replacements: { listingId } });
    console.log("Dane zapisane w tabeli dla activeDaysDistribution.");
  };
  
  const updateMostActiveHour = async (listingId: number) => {
    const currentHour = new Date().getHours().toString().padStart(2, "0");
  
    console.log(`updateMostActiveHour - listingId: ${listingId}, currentHour: ${currentHour}`);
  
    const query = `
      UPDATE ListingStats 
      SET active_hours_distribution = JSON_SET(
        active_hours_distribution, 
        '$."${currentHour}"', 
        COALESCE(JSON_EXTRACT(active_hours_distribution, '$."${currentHour}"'), 0) + 1
      )
      WHERE listing_id = :listingId
    `;
  
    await sequelize.query(query, { replacements: { listingId } });
    console.log("Dane zapisane w tabeli dla activeHoursDistribution.");
  };
  
  const updateDeviceTypeDistribution = async (listingId: number, deviceType: string) => {
    console.log(`updateDeviceTypeDistribution - listingId: ${listingId}, deviceType: ${deviceType}`);
  
    const query = `
      UPDATE ListingStats 
      SET device_type_distribution = JSON_SET(
        device_type_distribution, 
        '$.${deviceType}', 
        COALESCE(JSON_EXTRACT(device_type_distribution, '$.${deviceType}'), 0) + 1
      )
      WHERE listing_id = :listingId
    `;
  
    await sequelize.query(query, { replacements: { listingId } });
    console.log("Dane zapisane w tabeli dla deviceTypeDistribution.");
  };





  import { QueryTypes } from 'sequelize';

  const updateMostActiveDayAndHour = async (listingId: number) => {
    try {
      console.log(`updateMostActiveDayAndHour - listingId: ${listingId}`);
  
      
      const [result]: any = await sequelize.query(
        `
        SELECT active_days_distribution, active_hours_distribution 
        FROM ListingStats 
        WHERE listing_id = :listingId
        `,
        { replacements: { listingId }, type: QueryTypes.SELECT }
      );
  
      if (!result) {
        console.error(`Nie znaleziono danych dla listingId: ${listingId}`);
        return;
      }
  
      
      const activeDaysDistribution = result.active_days_distribution || {};
      const activeHoursDistribution = result.active_hours_distribution || {};
  
      console.log("activeDaysDistribution:", activeDaysDistribution);
      console.log("activeHoursDistribution:", activeHoursDistribution);
  
      
      const mostActiveDay = Object.entries(activeDaysDistribution as Record<string, number>)
        .reduce((maxDay: [string, number], current: [string, number]) =>
          current[1] > maxDay[1] ? current : maxDay, ["", 0])[0];
  
      
      const mostActiveHour = Object.entries(activeHoursDistribution as Record<string, number>)
        .reduce((maxHour: [string, number], current: [string, number]) =>
          current[1] > maxHour[1] ? current : maxHour, ["", 0])[0];
  
      console.log(`Najaktywniejszy dzień: ${mostActiveDay}, najaktywniejsza godzina: ${mostActiveHour}`);
  
      
      await sequelize.query(
        `
        UPDATE ListingStats 
        SET most_active_day = :mostActiveDay, 
            most_active_hour = :mostActiveHour 
        WHERE listing_id = :listingId
        `,
        {
          replacements: {
            listingId,
            mostActiveDay,
            mostActiveHour,
          },
        }
      );
  
      console.log(`Zaktualizowano most_active_day i most_active_hour dla listingId: ${listingId}`);
    } catch (error) {
      console.error("Błąd podczas aktualizacji najaktywniejszego dnia i godziny:", error);
    }
  };
  


  export const updateListingStatistics = async (req: Request, res: Response): Promise<void> => {
    console.log("Otrzymano dane z frontendu:", req.body);
  
    const { listingId, deviceType } = req.body;
  
    if (!listingId || !deviceType) {
      console.error("Błędne dane wejściowe:", req.body);
      res.status(400).json({ error: "Invalid data" });
      return;
    }
  
    try {
      console.log("Rozpoczynam aktualizację statystyk...");
      await Promise.all([
        updateMostActiveDay(listingId),
        updateMostActiveHour(listingId),
        updateDeviceTypeDistribution(listingId, deviceType),
      ]);
      await updateMostActiveDayAndHour(listingId);
      console.log("Zakończono aktualizację statystyk.");
      res.status(200).json({ message: "Statistics updated successfully" });
    } catch (error) {
      console.error("Błąd podczas aktualizacji statystyk:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
