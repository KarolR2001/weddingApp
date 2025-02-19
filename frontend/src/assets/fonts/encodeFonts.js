const fs = require('fs');

// Funkcja do konwersji pliku .ttf na Base64
function encodeToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

// Pliki czcionek
const fonts = [
  { name: 'Cormorant-Regular.ttf', path: './Cormorant-Regular.ttf' },
  { name: 'Cormorant-Bold.ttf', path: './Cormorant-Bold.ttf' },
];

// Zakoduj i zapisz jako pliki Base64
fonts.forEach((font) => {
  const base64 = encodeToBase64(font.path);
  fs.writeFileSync(`${font.name}.base64`, base64);
  console.log(`Zakodowano: ${font.name}`);
});
