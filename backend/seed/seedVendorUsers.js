const axios = require('axios');
const { fakerPL: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const API_URL = 'http://localhost:5000/auth/register';
const VERIFY_URL = 'http://localhost:5000/auth/verify';

// Generuj dane dla vendorów
function generateVendor() {
  return {
    email: faker.internet.email(),
    password: 'password123', // Stałe hasło dla testów
    phoneNumber: faker.phone.number('#########'),
    userType: 'vendor',
    companyName: faker.company.name()
  };
}

// Rejestruj i weryfikuj vendorów
async function seedVendors(count) {
  for (let i = 0; i < count; i++) {
    try {
      const vendorData = generateVendor();
      
      // 1. Rejestracja (pobierz token)
      const registerResponse = await axios.post(API_URL, vendorData);
      const verificationToken = registerResponse.data.verificationToken;
      
      if (!verificationToken) {
        throw new Error('Brak tokenu weryfikacyjnego w odpowiedzi');
      }

      // 2. Automatyczna weryfikacja
      await axios.get(VERIFY_URL, { params: { token: verificationToken } });
      
      console.log(`✅ Vendor ${i + 1} stworzony: ${vendorData.email}`);
    } catch (error) {
      console.error(`❌ Błąd przy vendorze ${i + 1}:`, error.response?.data || error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 50)); // Małe opóźnienie
  }
}

// Uruchom seedowanie (30 vendorów)
seedVendors(30)
  .then(() => console.log('\n🎉 Wszyscy vendory zostali dodani!'))
  .catch(err => console.error('🔥 Krytyczny błąd:', err));