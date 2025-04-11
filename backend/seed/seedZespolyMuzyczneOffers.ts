import { fakerPL as faker } from '@faker-js/faker';
import { Ollama } from 'ollama';
import * as fs from 'fs';
import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

// Inicjalizacja Ollama
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Lista vendorIds
const vendorIds = [
  1, 2, 55, 57, 65, 74, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
];

// Wczytanie pliku JSON z kategoriami i filtrami
const rawData = fs.readFileSync('categories.json', 'utf-8');
const { categories } = JSON.parse(rawData);

// Wybór kategorii "Zespoły muzyczne"
const category = categories.find((cat: any) => cat.service_category_id === 9);

// Definicja typu dla oferty
interface OfferData {
  vendorId: number;
  categoryId: number;
  titleOffer: string;
  shortDescription: string;
  longDescription: string;
  priceMin: number;
  priceMax: number;
  rangeInKm: number;
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

// Funkcja generująca początkowy tekst (z generowaniem nazwy zespołu przez Mistral)
async function generateInitialText(categoryName: string, filterNames: string[]): Promise<{ bandName: string; titleOffer: string; shortDescription: string; longDescription: string }> {
    const prompt = `
      Wygeneruj realistyczny tekst w języku polskim w stylu "O nas" dla kategorii "${categoryName}" (zespoły muzyczne oferujące usługi na wesela), 
      zgodny z filtrami: ${filterNames.join(', ')}. 
      Najpierw wymyśl bardzo krótką, chwytliwą nazwę zespołu (maks. 2-3 słowa, np. "Czerwone Gitary", "Bradersi", "TheBest"), 
      a następnie użyj tej nazwy w tekście. 
      Zwróć odpowiedź w formacie JSON z polami:
      - bandName: wygenerowana nazwa zespołu (maks. 2-3 słowa, bardzo krótka, chwytliwa, po polsku, np. "Czerwone Gitary", "Bradersi", "TheBest")
      - titleOffer: ta sama wygenerowana nazwa zespołu (maks. 2-3 słowa, bardzo krótka, chwytliwa, po polsku, np. "Czerwone Gitary", "Bradersi", "TheBest")
      - shortDescription: krótki opis (1-2 zdania, chwytliwy, profesjonalny ton, po polsku, bez odniesienia do filtrów, zachęcający do kliknięcia)
      - longDescription: szczegółowy opis (około 20 zdań, w stylu "O nas", po polsku, zgodny z filtrami; 
        opisz historię zespołu, skład, pasję, przykłady repertuaru zgodne z filtrami, np. konkretne utwory)
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
    Jesteś zespołem "${bandName}". Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na szczegółach oferty: repertuar (np. konkretne utwory zgodne z filtrami), 
    przygotowanie do wesela, sprzęt (np. gitara, perkusja), prowadzenie zabaw i ceremonii. 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. tytuły piosenek, opis prób). 
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
    Jesteś zespołem "${bandName}". Rozwiń istniejący opis "O nas" w języku polskim o kolejne 5 zdań, 
    zgodne z filtrami: ${filterNames.join(', ')}. 
    Skup się na interakcji z klientami (np. jak ustalamy repertuar, historie z występów) 
    i unikalnych cechach zespołu (np. damski wokal, elektronika w folku). 
    Zachowaj spójność z poprzednim tekstem i dodaj konkrety (np. wspomnienia z wesel, reakcje gości). 
    Zwróć tylko nowy tekst w formacie JSON z polem "additionalText".
  `;

  const response = await ollama.generate({
    model: 'mistral',
    prompt,
    format: 'json',
  });

  return JSON.parse(response.response).additionalText;
}

// Funkcja wysyłająca ofertę do endpointu
async function addOfferToDatabase(offerData: OfferData): Promise<any> {
  try {
    const response = await axios.post('http://localhost:5000/api/listings/add', offerData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_TOKEN}`,
      },
    });
    console.log(`Dodano ofertę do bazy: ${offerData.titleOffer} (ID: ${response.data.id || 'brak ID'})`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Błąd podczas dodawania oferty:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

// Funkcja generująca pełną ofertę
async function generateOfferData(category: any): Promise<OfferData> {
  const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
  const categoryId = category.service_category_id;
  const categoryName = category.category_name;

  // Losowanie filtrów – co najmniej jedna opcja z każdego filtra
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

  // Pobranie nazw filtrów
  const filterNames = getFilterNames(filterOptions, category);

  // Generowanie początkowego tekstu z nazwą zespołu od Mistral
  const textData = await generateInitialText(categoryName, filterNames);
  const bandName = textData.bandName; // Nazwa zespołu z odpowiedzi modelu

  // Rozwijanie longDescription w 2 etapach
  const expansion1 = await expandTextPart1(textData.longDescription, bandName, filterNames);
  const expansion2 = await expandTextPart2(textData.longDescription + ' ' + expansion1, bandName, filterNames);

  // Połączenie wszystkich części z odstępami
  const fullLongDescription = `${textData.longDescription}\n\n${expansion1}\n\n${expansion2}`;

  // Generowanie linków
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

  const offerData: OfferData = {
    vendorId,
    categoryId,
    titleOffer: textData.titleOffer,
    shortDescription: textData.shortDescription,
    longDescription: fullLongDescription,
    priceMin: faker.number.int({ min: 200, max: 2000 }),
    priceMax: faker.number.int({ min: 2000, max: 10000 }),
    rangeInKm: faker.number.int({ min: 50, max: 250 }),
    offersNationwideService: faker.datatype.boolean(),
    contactPhone: faker.string.numeric(9),
    email: faker.internet.email(),
    city: faker.location.city(),
    filterOptions,
    media: [
      {
        mediaType: 'image',
        mediaUrl: '/uploads/images/1731516052062-DSC_8361.jpg',
      },
    ],
    links,
  };

  return offerData;
}

// Funkcja testowa dla jednego ogłoszenia z dodaniem do bazy
async function testSingleOffer() {
  console.log('Generowanie testowej oferty...');
  const offerData = await generateOfferData(category);
  console.log('Wygenerowana oferta:');
  console.log(JSON.stringify(offerData, null, 2));

  // Dodanie oferty do bazy
  await addOfferToDatabase(offerData);
}


// Uruchomienie testu dla jednego ogłoszenia
testSingleOffer().catch(console.error);
