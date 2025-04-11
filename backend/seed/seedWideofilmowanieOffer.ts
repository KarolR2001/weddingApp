import { fakerPL as faker } from '@faker-js/faker';
import { Ollama } from 'ollama';
import * as fs from 'fs';
import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

// Sprawdzenie, czy JWT_TOKEN jest wczytany
//console.log('Wczytany JWT_TOKEN:', process.env.JWT_SECRET_KEY ? 'Znaleziono token' : 'Brak tokenu (undefined)');

// Inicjalizacja Ollama
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Lista vendorIds i userIds
const vendorIds = [
  1, 2, 55, 57, 65, 74, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
];
const userIds = [15, 16, 19, 23, 27, 34, 70, 3, 4, 63, 72, 75, 76, 73, 67];

// Wczytanie pliku JSON z kategoriami i filtrami
const rawData = fs.readFileSync('categories.json', 'utf-8');
const { categories } = JSON.parse(rawData);

// Wybór kategorii "Wideofilmowanie" (zakładam ID 10, zmień jeśli inne)
const category = categories.find((cat: any) => cat.service_category_id === 13);

// Definicja typu dla oferty
interface OfferData {
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

// Definicja typu dla opinii
interface ReviewData {
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

// Definicja typu dla bookowania dat
interface BookingData {
  action: 'add';
  listingId: number;
  date: string;
  availabilityStatus: 'booked' | 'reserved';
}

// Funkcja mapująca ID filtrów na nazwy
function getFilterNames(filterOptions: number[], category: any): string[] {
  const filterMap: { [key: number]: string } = {};
  category.filters.forEach((filter: any) => {
    filter.options.forEach((option: any) => {
      filterMap[option.id] = option.value;
    });
  });
  return filterOptions.map(id => filterMap[id] || 'Nieznany filtr');
}

// Funkcja generująca początkowy tekst (dostosowana do wideofilmowania)
async function generateInitialText(categoryName: string, filterNames: string[]): Promise<{ bandName: string; titleOffer: string; shortDescription: string; longDescription: string }> {
  const prompt = `
    Wygeneruj realistyczny tekst w języku polskim w stylu "O nas" dla kategorii "${categoryName}" (usługi wideofilmowania na wesela), 
    zgodny z filtrami: ${filterNames.join(', ')}. 
    Najpierw wymyśl bardzo krótką, chwytliwą i UNIKALNĄ nazwę firmy wideofilmowania (maks. 2-3 słowa), różną od poprzednich przykładów takich jak "Klatka Wspomnień", "Filmowy Kadr", "VideoMagia". 
    Przykłady nowych nazw: "Obiektyw Miłości", "Kadry Szczęścia", "Wizja Wesela". Nie używaj tych przykładowych nazw.
    Następnie użyj tej nazwy w tekście. 
    Zwróć odpowiedź w formacie JSON z polami:
    - bandName: wygenerowana unikalna nazwa firmy (maks. 2-3 słowa, chwytliwa, po polsku)
    - titleOffer: ta sama wygenerowana unikalna nazwa firmy
    - shortDescription: krótki opis (1-2 zdania, chwytliwy, profesjonalny ton, po polsku, bez odniesienia do filtrów, zachęcający do kliknięcia)
    - longDescription: szczegółowy opis (około 20 zdań, w stylu "O nas", po polsku, zgodny z filtrami; 
      opisz historię firmy, zespół, pasję do wideofilmowania, sprzęt np. kamery Sony, podejście do nagrywania i montażu wesel)
    Upewnij się, że odpowiedź jest poprawnym JSON-em z wszystkimi nawiasami i przecinkami.
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  try {
    const parsedResponse = JSON.parse(response.response);
    return parsedResponse;
  } catch (error) {
    console.error('Błąd parsowania JSON-a w generateInitialText. Surowa odpowiedź modelu:', response.response);
    throw new Error('Nie udało się sparsować odpowiedzi modelu na JSON');
  }
}

// Funkcja rozwijająca tekst - część 1
async function expandTextPart1(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
  const prompt = `
    Jesteś firmą wideofilmowania "${bandName}". Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na szczegółach oferty: sposób nagrywania (np. ujęcia z drona, slow motion), 
    przygotowanie do wesela, sprzęt (np. kamery Sony, stabilizatory), montaż i efekty specjalne. 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. przykłady realizacji, opis pracy na planie). 
    Zwróć tylko nowy tekst w formacie JSON z polem "additionalText".
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  return JSON.parse(response.response).additionalText;
}

// Funkcja rozwijająca tekst - część 2
async function expandTextPart2(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
  const prompt = `
    Jesteś firmą wideofilmowania "${bandName}". Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na interakcji z klientami (np. jak ustalamy scenariusz filmu, konsultacje przed weselem) 
    i unikalnych cechach firmy (np. artystyczny montaż, dynamiczne ujęcia). 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. wspomnienia z realizacji, reakcje par młodych). 
    Zwróć tylko nowy tekst w formacie JSON z polem "additionalText".
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  return JSON.parse(response.response).additionalText;
}

// Funkcja generująca dane opinii
async function generateReviewData(listingId: number): Promise<ReviewData[]> {
  const prompt = `
    Wygeneruj od 3 do 5 realistycznych opinii w języku polskim dla firmy wideofilmowania na wesele. 
    Każda opinia powinna być od innej osoby, z ocenami w skali 3-5 dla pięciu kategorii i krótkim tekstem (2-4 zdania). 
    Zwróć odpowiedź w formacie JSON jako TABLICA obiektów (zawsze w nawiasach kwadratowych []), 
    gdzie każdy obiekt ma pola:
    - ratingQuality: ocena jakości (3-5)
    - ratingCommunication: ocena komunikacji (3-5)
    - ratingCreativity: ocena kreatywności (3-5)
    - ratingServiceAgreement: ocena zgodności z umową (3-5)
    - ratingAesthetics: ocena estetyki (3-5)
    - reviewText: krótki tekst opinii (2-4 zdania, po polsku, realistyczny, pozytywny lub umiarkowanie pozytywny)
    Przykład poprawnego formatu:
    [
      {
        "ratingQuality": 5,
        "ratingCommunication": 4,
        "ratingCreativity": 5,
        "ratingServiceAgreement": 4,
        "ratingAesthetics": 5,
        "reviewText": "Film z wesela był przepiękny, pełen emocji. Komunikacja z ekipą mogłaby być nieco szybsza, ale efekt końcowy nas zachwycił!"
      },
      {
        "ratingQuality": 4,
        "ratingCommunication": 5,
        "ratingCreativity": 4,
        "ratingServiceAgreement": 5,
        "ratingAesthetics": 4,
        "reviewText": "Świetna ekipa, bardzo dobrze się z nimi dogadywaliśmy. Film jest piękny, choć niektóre ujęcia mogłyby być bardziej kreatywne."
      },
      {
        "ratingQuality": 5,
        "ratingCommunication": 5,
        "ratingCreativity": 4,
        "ratingServiceAgreement": 5,
        "ratingAesthetics": 5,
        "reviewText": "Zdecydowanie polecam! Film oddaje atmosferę wesela, a kontakt z zespołem był wzorowy."
      }
    ]
    Upewnij się, że odpowiedź jest poprawnym JSON-em w formie TABLICY i zawiera co najmniej 3 opinie.
  `;

  let attempts = 0;
  const maxAttempts = 3;
  let reviews: any[] = [];

  while (attempts < maxAttempts && reviews.length < 3) {
    try {
      const response = await ollama.generate({
        model: 'mistral',
        prompt,
        format: 'json',
      });

      console.log('Surowa odpowiedź modelu w generateReviewData:', response.response);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.response);
      } catch (error) {
        console.error('Błąd parsowania JSON-a w generateReviewData:', error);
        attempts++;
        continue;
      }

      // Upewnij się, że mamy tablicę
      if (!Array.isArray(parsedResponse)) {
        parsedResponse = [parsedResponse];
      }

      // Filtruj poprawne opinie
      const validReviews = parsedResponse.filter((review: any) =>
        review &&
        typeof review.ratingQuality === 'number' &&
        typeof review.ratingCommunication === 'number' &&
        typeof review.ratingCreativity === 'number' &&
        typeof review.ratingServiceAgreement === 'number' &&
        typeof review.ratingAesthetics === 'number' &&
        typeof review.reviewText === 'string'
      );

      if (validReviews.length > 0) {
        reviews = [...reviews, ...validReviews];
      }

      attempts++;
    } catch (error) {
      console.error('Błąd podczas generowania opinii:', error);
      attempts++;
    }
  }

  // Jeśli nadal nie mamy wystarczająco opinii, dodaj unikalne domyślne
  if (reviews.length < 3) {
    console.warn(`Model wygenerował tylko ${reviews.length} opinii, dodaję unikalne domyślne opinie.`);
    
    const defaultReviews = [
      {
        ratingQuality: faker.number.int({ min: 4, max: 5 }),
        ratingCommunication: faker.number.int({ min: 3, max: 5 }),
        ratingCreativity: faker.number.int({ min: 4, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
        reviewText: "Profesjonalna obsługa i piękny film. Ekipa była bardzo dyskretna, co doceniliśmy podczas ceremonii."
      },
      {
        ratingQuality: faker.number.int({ min: 4, max: 5 }),
        ratingCommunication: faker.number.int({ min: 4, max: 5 }),
        ratingCreativity: faker.number.int({ min: 3, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
        reviewText: "Film w pełni oddał emocje naszego wesela. Montaż był świetny, a ujęcia z drona dodawały wyjątkowego charakteru."
      },
      {
        ratingQuality: faker.number.int({ min: 3, max: 5 }),
        ratingCommunication: faker.number.int({ min: 4, max: 5 }),
        ratingCreativity: faker.number.int({ min: 4, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 3, max: 5 }),
        reviewText: "Dobry film, chociaż niektóre sceny mogły być lepiej uchwycone. Ogólnie jesteśmy zadowoleni z efektu końcowego."
      },
      {
        ratingQuality: faker.number.int({ min: 5, max: 5 }),
        ratingCommunication: faker.number.int({ min: 5, max: 5 }),
        ratingCreativity: faker.number.int({ min: 5, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 5, max: 5 }),
        reviewText: "Absolutnie doskonałe! Film przewyższył nasze oczekiwania. Każda scena jest dopracowana w najmniejszym szczególe."
      },
      {
        ratingQuality: faker.number.int({ min: 4, max: 5 }),
        ratingCommunication: faker.number.int({ min: 4, max: 5 }),
        ratingCreativity: faker.number.int({ min: 4, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
        reviewText: "Bardzo dobra jakość nagrania i montażu. Szczególnie podobały nam się ujęcia w zwolnionym tempie podczas pierwszego tańca."
      }
    ];

    // Wybierz unikalne opinie z domyślnych
    const shuffledDefaultReviews = [...defaultReviews].sort(() => 0.5 - Math.random());
    const neededReviews = 3 - reviews.length;
    reviews = [...reviews, ...shuffledDefaultReviews.slice(0, neededReviews)];
  }

  // Ogranicz do maksymalnie 5 opinii
  reviews = reviews.slice(0, 5);

  // Dodaj unikalne dane do każdej opinii
  return reviews.map((review: any) => ({
    listingId,
    userId: faker.helpers.arrayElement(userIds),
    ratingQuality: review.ratingQuality,
    ratingCommunication: review.ratingCommunication,
    ratingCreativity: review.ratingCreativity,
    ratingServiceAgreement: review.ratingServiceAgreement,
    ratingAesthetics: review.ratingAesthetics,
    reviewText: review.reviewText,
    weddingDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    location: faker.location.city(),
    reviewerName: faker.person.fullName(),
    reviewerPhone: faker.string.numeric(9),
  }));
}

// Funkcja wysyłająca opinię do endpointu
async function addReviewToDatabase(reviewData: ReviewData): Promise<any> {
const headers = { 'Content-Type': 'application/json' };
console.log('Nagłówki dla /api/reviews/add:', headers);
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

// Funkcja generująca dane bookowania dat
function generateBookingData(listingId: number): BookingData[] {
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

// Funkcja wysyłająca ofertę do endpointu
async function addOfferToDatabase(offerData: OfferData): Promise<any> {
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

// Funkcja wysyłająca bookowanie daty do endpointu
async function modifyCalendarInDatabase(bookingData: BookingData): Promise<any> {
  try {
    const response = await axios.post('http://localhost:5000/api/calendar/modify', bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY1LCJ1c2VyVHlwZSI6InZlbmRvciIsImlhdCI6MTc0NDA5NjYyNiwiZXhwIjoxNzQ0MTM5ODI2fQ.7f0hKX7HN5aqRMZL51RUd3aY29CQoRwbvmL3ahvh0Ac`,
      },
    });
    console.log(`Zaktualizowano kalendarz dla listingId: ${bookingData.listingId} na datę: ${bookingData.date}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Błąd podczas modyfikacji kalendarza:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

// Funkcja generująca pełną ofertę
async function generateOfferData(category: any): Promise<OfferData> {
  const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
  const categoryId = category.service_category_id;
  const categoryName = category.category_name;

  const filterOptions: number[] = [];
  category.filters.forEach((filter: any) => {
    const options = filter.options.map((opt: any) => opt.id);
    if (filter.selection_type === 'single') {
      const selectedOption = options[Math.floor(Math.random() * options.length)];
      filterOptions.push(selectedOption);
    } else if (filter.selection_type === 'multiple') {
      const maxOptions = options.length;
      const minOptions = 1;
      const count = Math.floor(Math.random() * (maxOptions - minOptions + 1)) + minOptions;
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      filterOptions.push(...shuffledOptions.slice(0, count));
    }
  });

  const filterNames = getFilterNames(filterOptions, category);
  const textData = await generateInitialText(categoryName, filterNames);
  const bandName = textData.bandName;

  const expansion1 = await expandTextPart1(textData.longDescription, bandName, filterNames);
  const expansion2 = await expandTextPart2(textData.longDescription + ' ' + expansion1, bandName, filterNames);
  const fullLongDescription = `${textData.longDescription}\n\n${expansion1}\n\n${expansion2}`;

  const baseName = textData.titleOffer.toLowerCase().replace(/\s+/g, '');
  const links = {
    websiteUrl: faker.internet.url(),
    facebookUrl: `https://facebook.com/${baseName}`,
    youtubeUrl: `https://youtube.com/${baseName}`,
    instagramUrl: `https://instagram.com/${baseName}`,
    tiktokUrl: `https://tiktok.com/@${baseName}`,
    spotifyUrl: `https://spotify.com/${baseName}`,
    soundcloudUrl: `https://soundcloud.com/${baseName}`,
    pinterestUrl: `https://pinterest.com/${baseName}`,
  };

  const offersNationwideService = faker.datatype.boolean();
  
  // Lista wszystkich dostępnych zdjęć
  const allImages = [
    '/uploads/images/11.png',
    '/uploads/images/9.png',
    '/uploads/images/5.png',
    '/uploads/images/12.png',
    '/uploads/images/1.png',
    '/uploads/images/2.png',
    '/uploads/images/19.png'
  ];
  
  // Losowa kolejność zdjęć
  const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());
  
  // Wybierz losową liczbę zdjęć (4-6)
  const selectedImages = shuffledImages.slice(0, faker.number.int({ min: 6, max: 7 }));
  
  // Stwórz tablicę mediów ze zdjęciami w losowej kolejności
  const media = selectedImages.map(imageUrl => ({
    mediaType: 'image',
    mediaUrl: imageUrl
  }));
  
  // Dodaj wideo na losowej pozycji
  const videoIndex = faker.number.int({ min: 0, max: media.length });
  media.splice(videoIndex, 0, {
    mediaType: 'video',
    mediaUrl: 'YO4ufKH4Jrs?si=WnpMWV5yYrnG3rjs'
  });

  const offerData: OfferData = {
    vendorId,
    categoryId,
    titleOffer: textData.titleOffer,
    shortDescription: textData.shortDescription,
    longDescription: fullLongDescription,
    priceMin: faker.number.int({ min: 200, max: 2000 }),
    priceMax: faker.number.int({ min: 2000, max: 10000 }),
    offersNationwideService,
    contactPhone: faker.string.numeric(9),
    email: faker.internet.email(),
    city: faker.location.city(),
    filterOptions,
    media,
    links,
  };

  if (!offersNationwideService) {
    offerData.rangeInKm = faker.number.int({ min: 50, max: 1250 });
  }

  return offerData;
}

async function testMultipleOffers(count: number = 3) {
  for (let i = 0; i < count; i++) {
    console.log(`Generowanie oferty ${i + 1}...`);
    const offerData = await generateOfferData(category);
    console.log('Wygenerowana oferta:');
    console.log(JSON.stringify(offerData, null, 2));

    // Dodanie oferty do bazy i pobranie listingId
    const offerResponse = await addOfferToDatabase(offerData);
    const listingId = offerResponse.listingId;

    if (listingId) {
      // Generowanie i dodawanie opinii
      const reviews = await generateReviewData(listingId);
      if (reviews.length > 0) {
        for (const review of reviews) {
          await addReviewToDatabase(review);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        console.warn('Nie wygenerowano żadnych opinii dla listingId:', listingId);
      }

      // Generowanie i dodawanie bookowania dat
      const bookings = generateBookingData(listingId);
      for (const booking of bookings) {
        await modifyCalendarInDatabase(booking);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.error('Nie udało się pobrać listingId z odpowiedzi serwera.');
    }
  }
}

// Uruchomienie testu dla 3 ogłoszeń
testMultipleOffers(15).catch(console.error);