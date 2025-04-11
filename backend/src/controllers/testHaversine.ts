import haversine from 'haversine-distance';
import citiesData from './cities.json'; // Zakładam, że plik jest w tym samym katalogu

// Interfejs dla struktury obiektów w cities.json
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

// Jawne rzutowanie na City[] - zależne od bundlera
const cities: City[] = citiesData as City[];

const city1 = cities.find((city: City) => city.placeName === 'Brzezna');
const city2 = cities.find((city: City) => city.placeName === 'Nowy Sącz');

if (city1 && city2) {
  const distanceInMeters = haversine(
    { lat: city1.latitude, lon: city1.longitude },
    { lat: city2.latitude, lon: city2.longitude }
  );
  const distanceInKm = distanceInMeters / 1000;
  console.log(`Odległość ${city1.placeName}-${city2.placeName}: ${distanceInKm.toFixed(2)} km`);
} else {
  console.log('Jedno z miast nie zostało znalezione w cities.json');
}