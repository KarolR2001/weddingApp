const fs = require('fs');

// Odczytanie pliku cities.json
fs.readFile('cities.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Błąd odczytu pliku:', err);
    return;
  }

  // Parsowanie JSON
  let cities = JSON.parse(data);

  // Usunięcie duplikatów na podstawie placeName
  const uniqueCities = [];
  const seenPlaceNames = new Set();

  cities.forEach(city => {
    if (!seenPlaceNames.has(city.placeName)) {
      seenPlaceNames.add(city.placeName);
      uniqueCities.push(city);
    }
  });

  // Zapisanie wynikowego pliku bez duplikatów
  fs.writeFile('cities_unique.json', JSON.stringify(uniqueCities, null, 2), err => {
    if (err) {
      console.error('Błąd zapisu pliku:', err);
      return;
    }
    console.log('Zapisano plik cities_unique.json bez duplikatów.');
  });
});
