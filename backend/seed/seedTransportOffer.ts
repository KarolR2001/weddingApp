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
const category = categories.find((cat: any) => cat.service_category_id === 6);

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

async function generateCompanyName(categoryName: string): Promise<string> {
    const prompt = `
      Wygeneruj bardzo krótką, chwytliwą i UNIKALNĄ nazwę firmy transportowej w branży ślubnej (maks. 2-3 słowa), 
      związaną z kategorią "${categoryName}" (usługi transportowe, np. transport pary młodej, gości weselnych, transfer z lotniska). 
      Nazwa powinna być profesjonalna, elegancka i kojarzyć się z transportem lub ślubami. 
      Nie używaj przykładów takich jak "Złote Koła", "Weselny Kurs", "Lux Transfer", "Klatka Wspomnień", "Filmowy Kadr", "VideoMagia". 
      Przykłady stylu (ale nie używaj ich): "Srebrna Trasa", "Weselna Fala", "Klasa Przejazdu". 
      Zwróć odpowiedź w formacie JSON z polem "companyName" zawierającym tylko nazwę (bez dodatkowych pól).
      Upewnij się, że odpowiedź jest poprawnym JSON-em, np. {"companyName": "Elegancki Przewóz"}.
    `;
  
    let companyName = '';
    let attempts = 0;
  
    while (!companyName) {
      attempts++;
      try {
        const response = await ollama.generate({
          model: 'mistral',
          prompt,
          format: 'json',
        });
  
        const parsedResponse = JSON.parse(response.response);
        const name = parsedResponse.companyName;
  
        // Sprawdzamy, czy nazwa jest odpowiednia (2-3 słowa, brak zakazanych przykładów)
        const wordCount = name.trim().split(/\s+/).length;
        const forbiddenNames = [
          "Złote Koła", "Weselny Kurs", "Lux Transfer",
          "Klatka Wspomnień", "Filmowy Kadr", "VideoMagia",
          "Srebrna Trasa", "Weselna Fala", "Klasa Przejazdu"
        ];
  
        if (
          typeof name === 'string' &&
          wordCount >= 2 && wordCount <= 4 &&
          !forbiddenNames.includes(name)
        ) {
          companyName = name;
          console.log(`Wygenerowana nazwa firmy po ${attempts} próbach: ${companyName}`);
        } else {
          console.warn(`Nazwa "${name}" nie spełnia wymagań (liczba słów: ${wordCount} lub zakazana). Próba ${attempts}...`);
        }
      } catch (error) {
        console.error(`Błąd generowania nazwy w próbie ${attempts}:`, error);
      }
  
      // Krótkie opóźnienie między próbami, aby uniknąć przeciążenia
      if (!companyName) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  
    return companyName;
}

// Funkcja generująca początkowy tekst (dostosowana do wideofilmowania)
async function generateInitialText(categoryName: string, filterNames: string[], companyName: string): Promise<{ bandName: string; titleOffer: string; shortDescription: string; longDescription: string }> {
    const prompt = `
      Wygeneruj realistyczny tekst w języku polskim w stylu "O nas" dla kategorii "${categoryName}" (usługi transportowe w branży ślubnej, np. transport młodej pary, gości weselnych, transfer z lotniska), 
      zgodny z filtrami: ${filterNames.join(', ')}. 
      Użyj nazwy firmy "${companyName}" w tekście. 
      Zwróć odpowiedź w formacie JSON z polami:
      - bandName: "${companyName}"
      - titleOffer: "${companyName}"
      - shortDescription: krótki opis (1-2 zdania, chwytliwy, profesjonalny ton, po polsku, bez odniesienia do filtrów, zachęcający do kliknięcia)
      - longDescription: szczegółowy opis (około 20 zdań, w stylu "O nas", po polsku, zgodny z filtrami; 
        opisz historię firmy, flotę pojazdów np. limuzyny Mercedes, podejście do obsługi ślubów, doświadczenie w transporcie par młodych i gości)
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
      Jesteś firmą transportową "${bandName}" w branży ślubnej. Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
      zgodne z filtrami: ${filterNames.join(', ')}. 
      Skup się na szczegółach oferty: rodzaj pojazdów (np. limuzyny, busy, bryczki), 
      przygotowanie do ślubu (np. dekoracje pojazdów), flota (np. Mercedes, Rolls-Royce), 
      organizacja transportu (np. dla pary młodej, gości, z lotniska). 
      Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. przykłady tras, opis przygotowania pojazdów). 
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
      Jesteś firmą transportową "${bandName}" w branży ślubnej. Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
      zgodne z filtrami: ${filterNames.join(', ')}. 
      Skup się na interakcji z klientami (np. ustalanie tras, konsultacje przed ślubem) 
      i unikalnych cechach firmy (np. punktualność, eleganckie pojazdy, dodatkowe usługi jak napoje). 
      Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. reakcje klientów, przykłady z realizacji). 
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
      Wygeneruj od 3 do 5 realistycznych opinii w języku polskim dla firmy transportowej w branży ślubnej (np. transport pary młodej, gości weselnych, transfer z lotniska). 
      Każda opinia powinna być od innej osoby, z ocenami w skali 3-5 dla pięciu kategorii i krótkim tekstem (2-4 zdania). 
      Zwróć odpowiedź w formacie JSON jako TABLICA obiektów (zawsze w nawiasach kwadratowych []), 
      gdzie każdy obiekt ma pola:
      - ratingQuality: ocena jakości (3-5)
      - ratingCommunication: ocena komunikacji (3-5)
      - ratingCreativity: ocena kreatywności (3-5, np. dekoracje pojazdów, trasy)
      - ratingServiceAgreement: ocena zgodności z umową (3-5)
      - ratingAesthetics: ocena estetyki (3-5, np. wygląd pojazdów)
      - reviewText: krótki tekst opinii (2-4 zdania, po polsku, realistyczny, pozytywny lub umiarkowanie pozytywny)
      Przykład poprawnego formatu:
      [
        {
          "ratingQuality": 5,
          "ratingCommunication": 4,
          "ratingCreativity": 5,
          "ratingServiceAgreement": 4,
          "ratingAesthetics": 5,
          "reviewText": "Transport na ślub był perfekcyjny, limuzyna wyglądała niesamowicie. Kontakt z firmą mógłby być szybszy, ale całość przeszła nasze oczekiwania!"
        },
        {
          "ratingQuality": 4,
          "ratingCommunication": 5,
          "ratingCreativity": 4,
          "ratingServiceAgreement": 5,
          "ratingAesthetics": 4,
          "reviewText": "Kierowca był bardzo uprzejmy i punktualny, a bus dla gości wygodny. Dekoracje mogłyby być bardziej oryginalne, ale ogólnie świetna usługa."
        },
        {
          "ratingQuality": 5,
          "ratingCommunication": 5,
          "ratingCreativity": 4,
          "ratingServiceAgreement": 5,
          "ratingAesthetics": 5,
          "reviewText": "Zdecydowanie polecam! Samochód zabytkowy zrobił furorę na weselu, a organizacja transportu była bez zarzutu."
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
  
        if (!Array.isArray(parsedResponse)) {
          parsedResponse = [parsedResponse];
        }
  
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
  
    if (reviews.length < 3) {
      console.warn(`Model wygenerował tylko ${reviews.length} opinii, dodaję unikalne domyślne opinie.`);
      
      const defaultReviews = [
        {
          ratingQuality: faker.number.int({ min: 4, max: 5 }),
          ratingCommunication: faker.number.int({ min: 3, max: 5 }),
          ratingCreativity: faker.number.int({ min: 4, max: 5 }),
          ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
          ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
          reviewText: "Transport pary młodej był na najwyższym poziomie, samochód pięknie udekorowany. Punktualność bez zarzutu!"
        },
        {
          ratingQuality: faker.number.int({ min: 4, max: 5 }),
          ratingCommunication: faker.number.int({ min: 4, max: 5 }),
          ratingCreativity: faker.number.int({ min: 3, max: 5 }),
          ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
          ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
          reviewText: "Bus dla gości weselnych był wygodny i czysty. Kierowca bardzo pomocny, choć dekoracje mogły być bardziej kreatywne."
        },
        {
          ratingQuality: faker.number.int({ min: 3, max: 5 }),
          ratingCommunication: faker.number.int({ min: 4, max: 5 }),
          ratingCreativity: faker.number.int({ min: 4, max: 5 }),
          ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
          ratingAesthetics: faker.number.int({ min: 3, max: 5 }),
          reviewText: "Transfer z lotniska przebiegł sprawnie, choć pojazd mógłby być bardziej luksusowy. Ogólnie dobra usługa."
        }
      ];
  
      const shuffledDefaultReviews = [...defaultReviews].sort(() => 0.5 - Math.random());
      const neededReviews = 3 - reviews.length;
      reviews = [...reviews, ...shuffledDefaultReviews.slice(0, neededReviews)];
    }
  
    reviews = reviews.slice(0, 5);
  
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
    const companyName = await generateCompanyName(categoryName); // Generowanie nazwy osobno
    const textData = await generateInitialText(categoryName, filterNames, companyName);
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
  
    const allImages = [
      '/uploads/images/600.png',
      '/uploads/images/602.png',
      '/uploads/images/603.png',
      '/uploads/images/604.png',
      '/uploads/images/605.png',
      '/uploads/images/606.png',
      '/uploads/images/607.png',
      '/uploads/images/608.png',
      '/uploads/images/609.png',
      '/uploads/images/610.png',
      '/uploads/images/611.png',
      '/uploads/images/612.png',
      '/uploads/images/613.png',
      '/uploads/images/614.png'
    ];
  
    const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());
    const selectedImages = shuffledImages.slice(0, faker.number.int({ min: 13, max: 14 }));
    const media = selectedImages.map(imageUrl => ({
      mediaType: 'image',
      mediaUrl: imageUrl
    }));
    const videoIndex = faker.number.int({ min: 0, max: media.length });
    media.splice(videoIndex, 0, {
      mediaType: 'video',
      mediaUrl: '2ufh00SP--U?si=eH4FSOLm_kj82-4G'
    });
  
    const offerData: OfferData = {
      vendorId,
      categoryId,
      titleOffer: textData.titleOffer,
      shortDescription: textData.shortDescription,
      longDescription: fullLongDescription,
      priceMin: faker.number.int({ min: 50, max: 200 }),
      priceMax: faker.number.int({ min: 300, max: 3000 }),
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
testMultipleOffers(5).catch(console.error);