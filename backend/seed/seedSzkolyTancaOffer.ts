import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';
import { fakerPL as faker } from '@faker-js/faker';
import axios, { AxiosError } from 'axios';
import { OfferData, ReviewData, categories, usedCompanyNames, vendorIds, userIds, getFilterNames, addOfferToDatabase, addReviewToDatabase, modifyCalendarInDatabase, generateBookingData, saveUsedCompanyNames } from './staticData';
dotenv.config();

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function generateCompanyName(categoryName: string): Promise<string> {
  const prompt = `
    Wygeneruj bardzo krótką, chwytliwą i UNIKALNĄ nazwę firmy w branży ślubnej dla kategorii "${categoryName}" (szkoła tańca, np. przygotowanie pierwszego tańca, lekcje dla par młodych), 
    maksymalnie 2-3 słowa. Nazwa powinna być profesjonalna, elegancka i kojarzyć się z tańcem lub ślubami. Używaj polskich nazw. Możesz dodać przedrostek "Szkoła tańca" lub np "Kurs Tańca", "Akademia".
    Unikaj powtórzenia następujących nazw, które już zostały użyte: ${Array.from(usedCompanyNames).join(', ') || 'brak wcześniejszych nazw'}.
    Zwróć odpowiedź w formacie JSON z polem "companyName" zawierającym tylko nazwę (bez dodatkowych pól).
    Upewnij się, że odpowiedź jest poprawnym JSON-em, np. {"companyName": "Harmonia Tańca"}.
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

      const wordCount = name.trim().split(/\s+/).length;
      const forbiddenNames = [
        "Złote Koła", "Weselny Kurs", "Lux Transfer",
        "Klatka Wspomnień", "Filmowy Kadr", "VideoMagia",
        "Taniec Miłości", "Rytm Wesela", "Krok Elegancji"
      ];

      if (
        typeof name === 'string' &&
        wordCount >= 2 && wordCount <= 3 &&
        !forbiddenNames.includes(name) &&
        !usedCompanyNames.has(name)
      ) {
        companyName = name;
        usedCompanyNames.add(companyName);
        saveUsedCompanyNames(usedCompanyNames);
        console.log(`Wygenerowana nazwa firmy po ${attempts} próbach: ${companyName}`);
      } else {
        console.warn(`Nazwa "${name}" nie spełnia wymagań (liczba słów: ${wordCount}, zakazana lub powtórzona). Próba ${attempts}...`);
      }
    } catch (error) {
      console.error(`Błąd generowania nazwy w próbie ${attempts}:`, error);
    }

    if (!companyName) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return companyName;
}

export async function generateInitialText(categoryName: string, filterNames: string[], companyName: string): Promise<{ bandName: string; shortDescription: string; longDescription: string }> {
  const prompt = `
    Wygeneruj realistyczny tekst w języku polskim w stylu "O nas" dla kategorii "${categoryName}" (szkoła tańca w branży ślubnej, np. przygotowanie pierwszego tańca, lekcje dla par młodych), 
    zgodny z filtrami: ${filterNames.join(', ')}. 
    Użyj nazwy firmy "${companyName}" w tekście. 
    Zwróć odpowiedź w formacie JSON z polami:
    - bandName: "${companyName}"
    - shortDescription: krótki opis (krótkie 1-2 zdania, chwytliwy, profesjonalny ton, po polsku, bez odniesienia do filtrów, zachęcający do kliknięcia)
    - longDescription: szczegółowy opis (około 20 zdań, w stylu "O nas", po polsku, zgodny z filtrami; 
      opisz historię szkoły, zespół instruktorów, pasję do tańca, doświadczenie w przygotowaniu par młodych, rodzaje zajęć np. walc, tango)
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

export async function expandTextPart1(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
  const prompt = `
    Jesteś szkołą tańca "${bandName}" w branży ślubnej. Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na szczegółach oferty: rodzaje tańca (np. walc angielski, salsa), 
    przygotowanie do ślubu (np. choreografia pierwszego tańca), 
    metody nauczania (np. indywidualne lekcje, kursy intensywne), 
    doświadczenie instruktorów. 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. przykłady choreografii, sukcesy par). 
    Zwróć tylko nowy tekst w formacie JSON z polem "additionalText".
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  return JSON.parse(response.response).additionalText;
}

export async function expandTextPart2(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
  const prompt = `
    Jesteś szkołą tańca "${bandName}" w branży ślubnej. Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na interakcji z klientami (np. konsultacje choreografii, elastyczne podejście) 
    i unikalnych cechach szkoły (np. kreatywne układy, przyjazna atmosfera, dodatkowe usługi jak pokazy). 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. reakcje par młodych, przykłady zajęć). 
    Zwróć tylko nowy tekst w formacie JSON z polem "additionalText".
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  return JSON.parse(response.response).additionalText;
}

export async function generateOfferData(category: any): Promise<OfferData> {
  const vendorId = faker.helpers.arrayElement(vendorIds);
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
  const companyName = await generateCompanyName(categoryName);
  const textData = await generateInitialText(categoryName, filterNames, companyName);
  const bandName = textData.bandName;

  const expansion1 = await expandTextPart1(textData.longDescription, bandName, filterNames);
  const expansion2 = await expandTextPart2(textData.longDescription + ' ' + expansion1, bandName, filterNames);
  const fullLongDescription = `${textData.longDescription}\n\n${expansion1}\n\n${expansion2}`;

  const prefixes = ["Szkoła Tańca", "Studio Tańca", "Akademia Tańca", "Kursy Tańca", "Taniec Ślubny"];
  let titleOffer = companyName;
  if (Math.random() < 0.5) {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    titleOffer = `${randomPrefix} ${companyName}`;
  }

  const companyWordCount = companyName.trim().split(/\s+/).length;
  if (companyWordCount > 3) {
    console.error(`Błąd: companyName "${companyName}" przekracza 3 słowa!`);
    throw new Error('Wygenerowana nazwa firmy jest za długa.');
  }

  const baseName = titleOffer.toLowerCase().replace(/\s+/g, '');
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
    '/uploads/images/700.png',
    '/uploads/images/701.png',
    '/uploads/images/702.png',
    '/uploads/images/703.png',
    '/uploads/images/704.png',
    '/uploads/images/705.png',
    '/uploads/images/706.png',
    '/uploads/images/707.png',
    '/uploads/images/708.png'
  ];

  const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());
  const selectedImages = shuffledImages.slice(0, faker.number.int({ min: 8, max: 9 }));
  const media = selectedImages.map(imageUrl => ({
    mediaType: 'image',
    mediaUrl: imageUrl
  }));
  const videoIndex = faker.number.int({ min: 0, max: media.length });
  media.splice(videoIndex, 0, {
    mediaType: 'video',
    mediaUrl: 'w-pGQKagXCQ?si=SgIjIMvyALhAnBFT'
  });

  const offerData: OfferData = {
    vendorId,
    categoryId,
    titleOffer,
    shortDescription: textData.shortDescription,
    longDescription: fullLongDescription,
    priceMin: faker.number.int({ min: 50, max: 200 }),
    priceMax: faker.number.int({ min: 300, max: 2000 }),
    offersNationwideService,
    contactPhone: faker.string.numeric(9),
    email: faker.internet.email(),
    city: faker.location.city(),
    filterOptions,
    media,
    links,
  };

  if (!offersNationwideService) {
    offerData.rangeInKm = faker.number.int({ min: 50, max: 120 });
  }

  return offerData;
}

export async function generateReviewData(listingId: number): Promise<ReviewData[]> {
  const prompt = `
    Wygeneruj od 3 do 5 realistycznych opinii w języku polskim dla szkoły tańca w branży ślubnej (np. przygotowanie pierwszego tańca, lekcje dla par młodych). 
    Każda opinia powinna być od innej osoby, z ocenami w skali 3-5 dla pięciu kategorii i krótkim tekstem (2-4 zdania). 
    Zwróć odpowiedź w formacie JSON jako TABLICA obiektów (zawsze w nawiasach kwadratowych []), 
    gdzie każdy obiekt ma pola:
    - ratingQuality: ocena jakości (3-5)
    - ratingCommunication: ocena komunikacji (3-5)
    - ratingCreativity: ocena kreatywności (3-5, np. choreografia)
    - ratingServiceAgreement: ocena zgodności z umową (3-5)
    - ratingAesthetics: ocena estetyki (3-5, np. styl tańca, atmosfera)
    - reviewText: krótki tekst opinii (2-4 zdania, po polsku, realistyczny, pozytywny lub umiarkowanie pozytywny)
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
    const defaultReviews = [
      {
        ratingQuality: faker.number.int({ min: 4, max: 5 }),
        ratingCommunication: faker.number.int({ min: 3, max: 5 }),
        ratingCreativity: faker.number.int({ min: 4, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
        reviewText: "Lekcje przygotowały nas idealnie do pierwszego tańca. Instruktorzy bardzo profesjonalni!"
      },
      {
        ratingQuality: faker.number.int({ min: 4, max: 5 }),
        ratingCommunication: faker.number.int({ min: 4, max: 5 }),
        ratingCreativity: faker.number.int({ min: 3, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
        reviewText: "Świetna atmosfera na zajęciach, choreografia piękna. Trochę więcej kreatywności by się przydało."
      },
      {
        ratingQuality: faker.number.int({ min: 3, max: 5 }),
        ratingCommunication: faker.number.int({ min: 4, max: 5 }),
        ratingCreativity: faker.number.int({ min: 4, max: 5 }),
        ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
        ratingAesthetics: faker.number.int({ min: 3, max: 5 }),
        reviewText: "Kurs intensywny przed ślubem bardzo nam pomógł. Styl tańca mógłby być bardziej dopracowany."
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



// Główna funkcja orkiestrująca
const category = categories.find((cat: any) => cat.service_category_id === 19);

async function testMultipleOffers(count: number = 3) {
  for (let i = 0; i < count; i++) {
    console.log(`Generowanie oferty ${i + 1}...`);
    const offerData = await generateOfferData(category);
    console.log('Wygenerowana oferta:');
    console.log(JSON.stringify(offerData, null, 2));

    const offerResponse = await addOfferToDatabase(offerData);
    const listingId = offerResponse.listingId;

    if (listingId) {
      const reviews = await generateReviewData(listingId);
      if (reviews.length > 0) {
        for (const review of reviews) {
          await addReviewToDatabase(review);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        console.warn('Nie wygenerowano żadnych opinii dla listingId:', listingId);
      }

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

// Uruchomienie skryptu
testMultipleOffers(1).catch(console.error);