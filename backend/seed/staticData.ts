import * as fs from 'fs';
import axios, { AxiosError } from 'axios';
import { fakerPL as faker } from '@faker-js/faker';

// Stałe dane
export const vendorIds = [
  1, 2, 55, 57, 65, 74, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
];
export const userIds = [15, 16, 19, 23, 27, 34, 70, 3, 4, 63, 72, 75, 76, 73, 67];
export const usedNamesFilePath = './usedCompanyNames.json';
export const categories = JSON.parse(fs.readFileSync('categories.json', 'utf-8')).categories;

// Funkcje do obsługi usedCompanyNames
export function loadUsedCompanyNames(): Set<string> {
  try {
    if (fs.existsSync(usedNamesFilePath)) {
      const data = fs.readFileSync(usedNamesFilePath, 'utf-8');
      const namesArray = JSON.parse(data);
      return new Set(namesArray);
    }
  } catch (error) {
    console.error('Błąd wczytywania użytych nazw z pliku:', error);
  }
  return new Set<string>();
}

export function saveUsedCompanyNames(names: Set<string>) {
  try {
    fs.writeFileSync(usedNamesFilePath, JSON.stringify(Array.from(names), null, 2), 'utf-8');
  } catch (error) {
    console.error('Błąd zapisywania użytych nazw do pliku:', error);
  }
}

export const usedCompanyNames = loadUsedCompanyNames();

// Typy
export interface OfferData {
  vendorId: number;
  categoryId: number;
  titleOffer: string;
  shortDescription: string;
  longDescription: string;
  priceMin: number;
  priceMax: number;
  rangeInKm?: number;
  offersNationwideService: boolean;
  contactPhone: string;
  email: string;
  city: string;
  filterOptions: number[];
  media: { mediaType: string; mediaUrl: string }[];
  links: {
    websiteUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    spotifyUrl: string;
    soundcloudUrl: string;
    pinterestUrl: string;
  };
}

export interface ReviewData {
  listingId: number;
  userId: number;
  ratingQuality: number;
  ratingCommunication: number;
  ratingCreativity: number;
  ratingServiceAgreement: number;
  ratingAesthetics: number;
  reviewText: string;
  weddingDate: string;
  location: string;
  reviewerName: string;
  reviewerPhone: string;
}

export interface BookingData {
  action: 'add';
  listingId: number;
  date: string;
  availabilityStatus: 'booked' | 'reserved';
}

// Funkcja mapująca filtry
export function getFilterNames(filterOptions: number[], category: any): string[] {
  const filterMap: { [key: number]: string } = {};
  category.filters.forEach((filter: any) => {
    filter.options.forEach((option: any) => {
      filterMap[option.id] = option.value;
    });
  });
  return filterOptions.map(id => filterMap[id] || 'Nieznany filtr');
}

// Funkcje API i generowanie bookowania
export async function addOfferToDatabase(offerData: OfferData): Promise<any> {
  try {
    const response = await axios.post('http://localhost:5000/api/listings/add', offerData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_SECRET_KEY}`,
      },
    });
    console.log(`Dodano ofertę do bazy: ${offerData.titleOffer} (ID: ${response.data.listingId || 'brak ID'})`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Błąd podczas dodawania oferty:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

export async function addReviewToDatabase(reviewData: ReviewData): Promise<any> {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const response = await axios.post('http://localhost:5000/api/reviews/add', reviewData, { headers });
    console.log(`Dodano opinię dla listingId: ${reviewData.listingId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Błąd podczas dodawania opinii:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

export async function modifyCalendarInDatabase(bookingData: BookingData): Promise<any> {
  try {
    const response = await axios.post('http://localhost:5000/api/calendar/modify', bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY1LCJ1c2VyVHlwZSI6InZlbmRvciIsImlhdCI6MTc0NDE4MzIzOSwiZXhwIjoxNzQ0MjI2NDM5fQ.EZxbw_yw0_UHx0vxr7-k2Ooz5lnMMFteC-LBkrkHhkY`,
      },
    });
    //console.log(`Zaktualizowano kalendarz dla listingId: ${bookingData.listingId} na datę: ${bookingData.date}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Błąd podczas modyfikacji kalendarza:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

export function generateBookingData(listingId: number): BookingData[] {
  const bookings: BookingData[] = [];
  const numBookings = faker.number.int({ min: 45, max: 50 });
  const startDate = new Date('2025-04-08');
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const bookedDates = new Set<string>();

  for (let i = 0; i < numBookings; i++) {
    let date: Date;
    if (Math.random() < 0.8) {
      date = faker.date.between({ from: startDate, to: endDate });
      while (date.getDay() !== 0 && date.getDay() !== 6) {
        date = faker.date.between({ from: startDate, to: endDate });
      }
    } else {
      date = faker.date.between({ from: startDate, to: endDate });
    }

    const formattedDate = date.toISOString().split('T')[0];
    if (bookedDates.has(formattedDate)) continue;
    bookedDates.add(formattedDate);

    const status = Math.random() < 0.6 ? 'booked' : 'reserved';
    bookings.push({
      action: 'add',
      listingId,
      date: formattedDate,
      availabilityStatus: status,
    });

    if (date.getDay() === 6 && bookings.length < numBookings) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayFormatted = nextDay.toISOString().split('T')[0];
      if (nextDay <= endDate && !bookedDates.has(nextDayFormatted)) {
        bookedDates.add(nextDayFormatted);
        bookings.push({
          action: 'add',
          listingId,
          date: nextDayFormatted,
          availabilityStatus: Math.random() < 0.6 ? 'booked' : 'reserved',
        });
      }
    }
  }

  return bookings;
}