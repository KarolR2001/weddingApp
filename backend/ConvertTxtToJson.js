const fs = require('fs');
const readline = require('readline');

const inputFile = './cities.txt';  // Ścieżka do pliku tekstowego z danymi
const outputFile = './cities.json';  // Ścieżka do wyjściowego pliku JSON

async function convertTxtToJson() {
  const fileStream = fs.createReadStream(inputFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,  // Rozpoznaje zarówno CRLF jak i LF
  });

  const cities = [];

  for await (const line of rl) {
    // Podziel linię na 12 kolumn
    const [
      countryCode,       // iso country code, 2 characters
      postalCode,        // varchar(20)
      placeName,         // varchar(180)
      adminName1,        // 1. order subdivision (state) varchar(100)
      adminCode1,        // 1. order subdivision (state) varchar(20)
      adminName2,        // 2. order subdivision (county/province) varchar(100)
      adminCode2,        // 2. order subdivision (county/province) varchar(20)
      adminName3,        // 3. order subdivision (community) varchar(100)
      adminCode3,        // 3. order subdivision (community) varchar(20)
      latitude,          // estimated latitude (wgs84)
      longitude,         // estimated longitude (wgs84)
      accuracy           // accuracy of lat/lng (1=estimated, 4=geonameid, 6=centroid)
    ] = line.split('\t');

    // Tworzymy obiekt JSON dla każdej linii
    cities.push({
      countryCode,
      postalCode,
      placeName,
      adminName1,
      adminCode1,
      adminName2,
      adminCode2,
      adminName3,
      adminCode3,
      latitude: parseFloat(latitude),  // Zamieniamy na liczbę
      longitude: parseFloat(longitude), // Zamieniamy na liczbę
      accuracy: parseInt(accuracy, 10)  // Zamieniamy na liczbę całkowitą
    });
  }

  // Zapisujemy dane do pliku JSON
  fs.writeFileSync(outputFile, JSON.stringify(cities, null, 2));
  console.log(`Dane zapisane w pliku ${outputFile}`);
}

convertTxtToJson();
