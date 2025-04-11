import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';
import { fakerPL as faker } from '@faker-js/faker';
import axios, { AxiosError } from 'axios';
import { OfferData, ReviewData, categories, usedCompanyNames, vendorIds, userIds, getFilterNames, addOfferToDatabase, addReviewToDatabase, modifyCalendarInDatabase, generateBookingData, saveUsedCompanyNames } from './staticData';

dotenv.config();

const ollama = new Ollama({ host: 'http://localhost:11434' });

async function generateCompanyName(categoryName: string): Promise<string> {
    const keywords = ["Obiektyw", "Kadr", "Momenty", "Światło", "Emocje", "Pamiątka", "Uchwycone", "Historia", "Sztuka", "Wizja", "Pasja", "Kreatywność", "Magia", "Chwile", "Portret", "Sesja", "Plener", "Reportaż", "Detal", "Radość", "Miłość", "Naturalność", "Styl", "Elegancja", "Profesjonalizm", "Fotografia", "Zdjęcia", "Wspomnienia", "Obraz", "Perspektywa"];
    const baseNames = ["Studio", "Fotografia", "Pracownia", "Atelier"];
    const additionalWords = ["Weselna", "Ślubna", "Profesjonalna", "Kreatywna"];
  
    const prompt = `
      Tworzę bazę ofert dla firm w branży ślubnej, specjalizujących się w kategorii "${categoryName}". 
      Potrzebuję unikalnych, chwytliwych nazw firm spełniających następujące wymagania:
  
      ŚCISŁE ZASADY:
      1. Format: 2-4 słowa, bez cyfr (arabskich, rzymskich ani słownie)
      2. Poprawna gramatyka i odmiana (np. "Studio Weselne" a nie "Studio Wesele", "Fotografia Ślubna" a nie "Fotografia Ślub")
      3. Zakazane elementy:
         - Cyfry w jakiejkolwiek formie (np. "Studio 2", "Fotografia Trzy")
         - Znaki specjalne poza myślnikami
         - Skróty i numery porządkowe (II, III, 1st)
      
      4. Preferowane są polskie nazwy, używające słów takich jak "${baseNames.join('", "')}" jako baza, z dodatkami odnoszącymi się do profesjonalnych usług fotograficznych na wesela. Nazwy powinny sugerować różnorodność usług (np. reportaż ślubny, sesje plenerowe, portrety, zdjęcia detali) i kreatywność. Słowa kluczowe do wykorzystania: "${keywords.join('", "')}".
      5. Unikaj nazw, które mogą być mylące lub nieodpowiednie dla branży ślubnej.
      6. Jeśli wiele nazw już istnieje, generuj nowe kombinacje z dostępnych słów kluczowych i bazowych, dbając o unikalność i poprawność gramatyczną.
  
      PRZYKŁADY NIEDOZWOLONYCH NAZW:
      - "Studio Chwil II"
      - "Fotografia 3"
      - "Atelier 2024"
      - "Pracownia Pierwsza"
  
      PRZYKŁADY PREFEROWANYCH NAZW:
      - "Studio Uchwycone Chwile"
      - "Fotografia Ślubna Emocje"
      - "Pracownia Kreatywnych Kadrów"
      - "Atelier Światła Weselnego"
  
      Zwróć TYLKO JSON z polem "companyName" zawierającym poprawną nazwę.
    `;
  
    let companyName = '';
    let attempts = 0;
    const maxAttempts = 5;
  
    const numberPattern = /[0-9]|\b(jeden|dwa|trzy|cztery|pięć|sześć|siedem|osiem|dziewięć|dziesięć)\b|\b(pierwszy|drugi|trzeci|czwarty|piąty|szósty|siódmy|ósmy|dziewiąty|dziesiąty)\b|\b(I{1,3}|IV|V|VI{1,3}|IX|XI{1,3})\b/i;
  
    while (!companyName && attempts < maxAttempts) {
      attempts++;
      try {
        const response = await ollama.generate({
          model: 'mistral',
          prompt,
          format: 'json',
        });
  
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response.response);
        } catch (parseError) {
          console.error("Błąd parsowania JSON:", parseError);
          console.log("Surowa odpowiedź:", response.response);
          continue;
        }
  
        if (!parsedResponse || !parsedResponse.companyName) {
          console.warn("Niepoprawna odpowiedź bez pola companyName");
          continue;
        }
  
        const name = parsedResponse.companyName.trim();
  
        const wordCount = name.split(/\s+/).length;
        const forbiddenNames = [
          "Złote Koła", "Weselny Kurs", "Lux Transfer",
          "Klatka Wspomnień", "Filmowy Kadr", "VideoMagia",
          "Taniec Miłości", "Rytm Wesela", "Krok Elegancji"
        ];
  
        const containsNumber = numberPattern.test(name);
  
        if (
          wordCount >= 2 && wordCount <= 4 &&
          !containsNumber &&
          !forbiddenNames.includes(name) &&
          !usedCompanyNames.has(name)
        ) {
          companyName = name;
          usedCompanyNames.add(companyName);
          saveUsedCompanyNames(usedCompanyNames);
          console.log(`Wygenerowana nazwa firmy po ${attempts} próbach: ${companyName}`);
        } else {
          const reason = containsNumber ? "zawiera cyfry lub liczby słownie" :
                        forbiddenNames.includes(name) ? "jest zakazana" :
                        usedCompanyNames.has(name) ? "już istnieje" :
                        "nie spełnia wymagań długości";
          console.warn(`Odrzucono nazwę "${name}" (${reason}). Próba ${attempts}...`);
        }
      } catch (error) {
        console.error(`Błąd generowania nazwy w próbie ${attempts}:`, error);
      }
  
      if (!companyName) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  
    // Fallback - generowanie awaryjnej nazwy z poprawioną gramatyką
    if (!companyName) {
      let fallbackAttempts = 0;
      const maxFallbackAttempts = 10; // Zwiększono liczbę prób dla większej szansy na unikalność
  
      while (!companyName && fallbackAttempts < maxFallbackAttempts) {
        fallbackAttempts++;
  
        const randomBase = baseNames[Math.floor(Math.random() * baseNames.length)];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const randomAdditional = additionalWords[Math.floor(Math.random() * additionalWords.length)];
  
        // Logika gramatyczna: dostosowanie składni w zależności od słów
        let candidateName = '';
        const useThreeWords = usedCompanyNames.size > 50 && Math.random() < 0.7; // Więcej słów przy dużej liczbie nazw
  
        if (useThreeWords) {
          // Trzy słowa dla większej unikalności
          if (randomBase === "Fotografia") {
            candidateName = `${randomBase} ${randomKeyword} ${randomAdditional}`; // np. "Fotografia Ślubna Chwile"
          } else {
            candidateName = `${randomBase} ${randomAdditional} ${randomKeyword}`; // np. "Studio Weselne Emocje"
          }
        } else {
          // Dwa słowa dla prostoty
          if (randomBase === "Fotografia") {
            candidateName = `${randomBase} ${randomKeyword}`; // np. "Fotografia Kadr"
          } else {
            candidateName = `${randomBase} ${randomAdditional}`; // np. "Pracownia Ślubna"
          }
        }
  
        if (
          !numberPattern.test(candidateName) &&
          !usedCompanyNames.has(candidateName) &&
          candidateName.split(/\s+/).length >= 2 && candidateName.split(/\s+/).length <= 4
        ) {
          companyName = candidateName;
          usedCompanyNames.add(companyName);
          saveUsedCompanyNames(usedCompanyNames);
          console.log(`Użyto wygenerowanej nazwy awaryjnej po ${fallbackAttempts} próbach: ${companyName}`);
          break;
        }
      }
  
      // Ostateczny fallback przy bardzo dużej liczbie nazw
      if (!companyName) {
        const uniqueSuffix = `${keywords[Math.floor(Math.random() * keywords.length)]}-${Date.now().toString().slice(-4)}`;
        companyName = `Fotografia ${uniqueSuffix}`; // np. "Fotografia Chwile-1234"
        usedCompanyNames.add(companyName);
        saveUsedCompanyNames(usedCompanyNames);
        console.log(`Użyto ostatecznego fallbacku z unikalnym sufiksem: ${companyName}`);
      }
    }
  
    return companyName;
  }

async function generateInitialText(categoryName: string, filterNames: string[], companyName: string): Promise<{ bandName: string; shortDescription: string; longDescription: string }> {
    
    const keywords = ["Obiektyw", "Kadr", "Momenty", "Światło", "Emocje", "Pamiątka", "Uchwycone", "Historia", "Sztuka", "Wizja", "Pasja", "Kreatywność", "Magia", "Chwile", "Portret", "Sesja", "Plener", "Reportaż", "Detal", "Radość", "Miłość", "Naturalność", "Styl", "Elegancja", "Profesjonalizm", "Fotografia", "Zdjęcia", "Wspomnienia", "Obraz", "Perspektywa"];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const prompt = `
    Jesteś copywriterem specjalizującym się w tekstach dla branży ślubnej. Stwórz kompleksowy opis w języku polskim dla firmy "${companyName}" (kategoria: ${categoryName}).
    
    ZASADY:
    1. Struktura:
       - Rozpocznij tekst naturalnie, bez zwrotów typu "Witamy" czy "Dzień dobry"
       - ShortDescription: 1-2 zdania wprowadzające (tona profesjonalno-zachęcający)
       - LongDescription: pełny tekst "O nas" (ok. 20 zdań) stanowiący SAMODZIELNĄ CAŁOŚĆ
    
    2. Treść:
       - Uwzględnij filtry: ${filterNames.join(', ')}
       - Wpleć motyw: "${randomKeyword}"
       - Opisz: historię firmy, specjalizację (fotografia weselna, reportaż ślubny, sesje plenerowe, portrety Pary Młodej), ofertę (zdjęcia detali, przygotowań, ceremonii, zabawy weselnej, sesje narzeczeńskie), sprzęt i techniki (np. profesjonalne aparaty, obróbka zdjęć), podejście do klienta
       - Podkreśl unikalne wartości (uchwycenie emocji, naturalność, kreatywność, doświadczenie)
       - Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia opisu
    
    3. Styl:
       - Profesjonalny ale ciepły ton
       - Unikaj powtórzeń
       - Zdania różnej długości dla naturalnego brzmienia
       - NIE używaj numeracji, nawiasów kwadratowych lub innych oznaczeń strukturalnych
    
    Format odpowiedzi TYLKO jako JSON:
    {
      "bandName": "${companyName}",
      "shortDescription": "tekst",
      "longDescription": "tekst (ZACZYNAJĄCY SIĘ OD PIERWSZEGO AKAPITU, BEZ ZWROTÓW POWITALNYCH)"
    }
    `;
    
    try {
      const response = await ollama.generate({
        model: 'mistral',
        prompt,
        format: 'json',
      });
  
      try {
        const parsedResponse = JSON.parse(response.response);
        
        // Sprawdzenie czy mamy wszystkie wymagane pola
        if (!parsedResponse.bandName || !parsedResponse.shortDescription || !parsedResponse.longDescription) {
          throw new Error('Brakujące pola w odpowiedzi JSON');
        }
        
        // Czyszczenie tekstu z nawiasów kwadratowych i numeracji
        parsedResponse.longDescription = cleanTextFromMarkers(parsedResponse.longDescription);
        parsedResponse.shortDescription = cleanTextFromMarkers(parsedResponse.shortDescription);
        
        return parsedResponse;
      } catch (parseError) {
        console.error('Błąd parsowania JSON-a w generateInitialText. Surowa odpowiedź modelu:', response.response);
        
        // Próbujemy poskładać odpowiedź z surowej odpowiedzi jeśli nie jest poprawnym JSON
        return {
          bandName: companyName,
          shortDescription: `${companyName} - profesjonalny salon sukien ślubnych oferujący wyjątkowe kreacje w kategorii ${categoryName}.`,
          longDescription: `${companyName} to renomowany salon specjalizujący się w kategorii ${categoryName}. Nasze projekty łączą tradycję z nowoczesnością, oferując każdej Pannie Młodej wyjątkowy wybór kreacji idealnie dopasowanych do indywidualnych potrzeb.`
        };
      }
    } catch (error) {
      console.error('Błąd podczas generowania tekstu:', error);
      
      // Fallback text jeśli cały proces się nie powiedzie
      return {
        bandName: companyName,
        shortDescription: `${companyName} - profesjonalny salon sukien ślubnych w kategorii ${categoryName}.`,
        longDescription: `${companyName} to miejsce, gdzie marzenia o idealnej sukni ślubnej stają się rzeczywistością. Specjalizujemy się w kategorii ${categoryName}, oferując wyjątkowy wybór kreacji.`
      };
    }
  }
  
  async function expandTextPart1(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
    
    const keywords = ["Obiektyw", "Kadr", "Momenty", "Światło", "Emocje", "Pamiątka", "Uchwycone", "Historia", "Sztuka", "Wizja", "Pasja", "Kreatywność", "Magia", "Chwile", "Portret", "Sesja", "Plener", "Reportaż", "Detal", "Radość", "Miłość", "Naturalność", "Styl", "Elegancja", "Profesjonalizm", "Fotografia", "Zdjęcia", "Wspomnienia", "Obraz", "Perspektywa"];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    const prompt = `
    Jesteś tym samym copywriterem co wcześniej. Rozwiń istniejący opis firmy "${bandName}" o 5 NOWYCH, SPÓJNYCH zdań.
    
    ZASADY:
    1. Kontynuuj dokładnie tam gdzie skończył się poprzedni tekst (NIE POWTARZAJ niczego)
    2. Uwzględnij filtry: ${filterNames.join(', ')}
    3. Wpleć motyw: "${randomKeyword}"
    4. Tematyka rozszerzenia:
       - Specyficzne usługi (np. reportaż z ceremonii, sesje plenerowe w dniu ślubu, portrety rodzinne, zdjęcia detali typu obrączki czy bukiet)
       - Techniki fotograficzne (np. naturalne światło, czarno-białe zdjęcia, dynamiczne ujęcia)
       - Przykładowe realizacje (np. sesja w górach, reportaż z rustykalnego wesela)
    5. Zachowaj IDENTYCZNY styl i ton
    6. NIE używaj numeracji, nawiasów kwadratowych, punktów lub innych oznaczeń strukturalnych
    7. NIE używaj fraz typu "Oto 5 nowych zdań" lub "Kontynuacja opisu"
    8. Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia tekstu
    
    Oto istniejący opis:
    "${existingText}"
    
    Format odpowiedzi TYLKO jako JSON: {"additionalText": "5 NOWYCH zdań napisanych w ciągłym tekście, BEZ POWTÓRZEŃ z existingText"}
    `;
  
    try {
      const response = await ollama.generate({
        model: 'mistral',
        prompt,
        format: 'json',
      });
  
      try {
        const parsedResponse = JSON.parse(response.response);
        if (!parsedResponse.additionalText) {
          throw new Error('Brak pola additionalText w odpowiedzi');
        }
        
        // Czyszczenie tekstu z nawiasów i numeracji
        return cleanTextFromMarkers(parsedResponse.additionalText);
      } catch (parseError) {
        console.error('Błąd parsowania JSON-a w expandTextPart1. Surowa odpowiedź:', response.response);
        
        // Wyciągamy tekst nawet jeśli odpowiedź nie jest poprawnym JSON
        const match = response.response.match(/"additionalText"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return cleanTextFromMarkers(match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
        }
        
        // Fallback text
        return `Nasza kolekcja obejmuje zarówno klasyczne fasony, jak i nowoczesne kroje inspirowane najnowszymi trendami w modzie ślubnej. Każda suknia szyta jest z dbałością o najmniejszy detal, z wykorzystaniem najwyższej jakości materiałów. Specjalizujemy się w ${randomKeyword.toLowerCase()}, co wyróżnia nasze projekty na tle konkurencji. Panny Młode cenią nas za indywidualne podejście i możliwość personalizacji każdego elementu kreacji. Nasze doświadczenie pozwala nam doradzać w kwestii doboru dodatków i wykończenia, aby całość tworzyła spójną kompozycję.`;
      }
    } catch (error) {
      console.error('Błąd podczas rozszerzania tekstu (część 1):', error);
      
      // Fallback text
      return `Nasza kolekcja obejmuje zarówno klasyczne fasony, jak i nowoczesne kroje. Każda suknia wykonywana jest z najwyższej jakości materiałów. Panny Młode doceniają nasze indywidualne podejście i możliwość personalizacji. Doświadczeni projektanci dbają o każdy detal. Oferujemy kompleksową usługę od pierwszego spotkania po ostatnie przymiarki.`;
    }
  }
  
  async function expandTextPart2(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
    const keywords = ["Obiektyw", "Kadr", "Momenty", "Światło", "Emocje", "Pamiątka", "Uchwycone", "Historia", "Sztuka", "Wizja", "Pasja", "Kreatywność", "Magia", "Chwile", "Portret", "Sesja", "Plener", "Reportaż", "Detal", "Radość", "Miłość", "Naturalność", "Styl", "Elegancja", "Profesjonalizm", "Fotografia", "Zdjęcia", "Wspomnienia", "Obraz", "Perspektywa"];    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const prompt = `
    Jesteś tym samym copywriterem co wcześniej. Dodaj ostatnie 5 SPÓJNYCH zdań do opisu "${bandName}".
    
    ZASADY:
    1. Kontynuuj naturalnie poprzednią myśl (NIE POWTARZAJ informacji)
    2. Uwzględnij filtry: ${filterNames.join(', ')}
    3. Wpleć motyw: "${randomKeyword}"
    4. Tematyka rozszerzenia:
       - Doświadczenia z Parami Młodymi (np. współpraca przy sesjach, elastyczność)
       - Unikalne usługi (np. albumy ślubne, szybka obróbka zdjęć, dron na weselu)
       - Wizja i wartości (np. tworzenie wspomnień, uchwycenie magii dnia)
       - Call-to-action (subtelnym tonem, np. zachęta do obejrzenia portfolio)
    5. Zakończ tekst naturalnie, bez sztucznych podsumowań
    6. NIE używaj numeracji, nawiasów kwadratowych, punktów lub innych oznaczeń strukturalnych
    7. NIE używaj fraz typu "Oto 5 nowych zdań" lub "Kontynuacja opisu"
    8. Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia tekstu
    
    Oto istniejący opis:
    "${existingText}"
    
    Format odpowiedzi TYLKO jako JSON: {"additionalText": "5 KOŃCOWYCH zdań napisanych w ciągłym tekście, BEZ POWTÓRZEŃ i ZAKOŃCZENIA typu 'Zapraszamy'"}
    `;
  
    try {
      const response = await ollama.generate({
        model: 'mistral',
        prompt,
        format: 'json',
      });
  
      try {
        const parsedResponse = JSON.parse(response.response);
        if (!parsedResponse.additionalText) {
          throw new Error('Brak pola additionalText w odpowiedzi');
        }
        
        // Czyszczenie tekstu z nawiasów i numeracji
        return cleanTextFromMarkers(parsedResponse.additionalText);
      } catch (parseError) {
        console.error('Błąd parsowania JSON-a w expandTextPart2. Surowa odpowiedź:', response.response);
        
        // Próba wyciągnięcia tekstu nawet jeśli odpowiedź nie jest poprawnym JSON
        const match = response.response.match(/"additionalText"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return cleanTextFromMarkers(match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
        }
        
        // Fallback text
        return `Nasze klientki doceniają atmosferę ${randomKeyword.toLowerCase()}, jaka panuje podczas każdej przymiarki. Oferujemy prywatne sesje konsultacyjne, podczas których przyszła Panna Młoda ma salon wyłącznie dla siebie. Wierzymy, że każda kobieta zasługuje na wyjątkową suknię, która podkreśli jej naturalną urodę. Nasze projekty są wyrazem pasji i zaangażowania całego zespołu. Twoja historia miłosna zasługuje na oprawę równie piękną jak uczucie, które was połączyło.`;
      }
    } catch (error) {
      console.error('Błąd podczas rozszerzania tekstu (część 2):', error);
      
      // Fallback text
      return `Każda nasza klientka otrzymuje indywidualną opiekę od pierwszej wizyty. Oferujemy prywatne sesje przymiarek w komfortowych warunkach. Nasz zespół to pasjonaci mody ślubnej z wieloletnim doświadczeniem. Dbamy o to, by proces wyboru sukni był wyjątkowym przeżyciem. Twoje marzenie o idealnej sukni możemy zamienić w rzeczywistość.`;
    }
  }
  
  // Funkcja pomocnicza do czyszczenia tekstu z nawiasów kwadratowych, numeracji i innych oznaczeń strukturalnych
  function cleanTextFromMarkers(text: string): string {
    if (!text) return "";
    
    // Usuń nawiasy kwadratowe i ich zawartość typu [1], [2], [3], itd.
    let cleaned = text.replace(/\[\d+\]/g, '');
    
    // Usuń nawiasy kwadratowe i ich zawartość typu [tekst]
    cleaned = cleaned.replace(/\[([^\]]*)\]/g, '$1');
    
    // Usuń numerację typu "1." lub "1)" na początku zdania
    cleaned = cleaned.replace(/^\s*\d+[\.\)]\s*/gm, '');
    
    // Usuń frazy typu "Punkt 1:" lub "Krok 2:"
    cleaned = cleaned.replace(/\b(Punkt|Krok|Zdanie|Sekcja|Część)\s+\d+\s*[:\.]/gi, '');
    
    // Usuń powtarzające się spacje
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Usuń spacje na początku i końcu
    cleaned = cleaned.trim();
    
    return cleaned;
  }
  
  // Funkcja do łączenia tekstów w jeden spójny opis
  async function generateFullDescription(categoryName: string, filterNames: string[], companyName: string): Promise<{ bandName: string; shortDescription: string; longDescription: string }> {
    // Generujemy początkowy tekst
    const initialText = await generateInitialText(categoryName, filterNames, companyName);
    
    // Generujemy pierwsze rozszerzenie
    const part1 = await expandTextPart1(initialText.longDescription, companyName, filterNames);
    
    // Łączymy tekst początkowy z pierwszym rozszerzeniem
    const combinedText = `${initialText.longDescription} ${part1}`;
    
    // Generujemy drugie rozszerzenie
    const part2 = await expandTextPart2(combinedText, companyName, filterNames);
    
    // Łączymy wszystko w jeden tekst
    const fullLongDescription = `${initialText.longDescription} ${part1} ${part2}`;
    
    return {
      bandName: initialText.bandName,
      shortDescription: initialText.shortDescription,
      longDescription: fullLongDescription
    };
  }

async function generateOfferData(category: any): Promise<OfferData> {
    const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
    const categoryId = category.service_category_id;
    const categoryName = category.category_name;
  
    // Generowanie filterOptions z walidacją
    const filterOptions: number[] = [];
    category.filters.forEach((filter: any) => {
      const options = filter.options.map((opt: any) => opt.id).filter((id: any) => id !== null && id !== undefined);
      if (options.length === 0) {
        console.warn(`Brak ważnych opcji dla filtru ${filter.name} w kategorii ${categoryName}`);
        return;
      }
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
  
    const validFilterOptions = filterOptions.filter(id => id !== null && id !== undefined && typeof id === 'number');
    if (validFilterOptions.length === 0) {
      throw new Error(`Brak ważnych filterOptions dla kategorii ${categoryName}`);
    }
  
    const filterNames = getFilterNames(validFilterOptions, category);
    const companyName = await generateCompanyName(categoryName);
  
    // Równoległe generowanie tekstów
    const [textData, expansion1, expansion2] = await Promise.all([
      generateInitialText(categoryName, filterNames, companyName),
      expandTextPart1('', companyName, filterNames),
      expandTextPart2('', companyName, filterNames)
    ]);
  
    const fullLongDescription = `${textData.longDescription}\n\n${expansion1}\n\n${expansion2}`;
  
    // Tytuł oferty to po prostu wygenerowana nazwa, bez dodatkowych przedrostków
    const titleOffer = companyName;
  
    // Walidacja liczby słów w nazwie
    const companyWordCount = companyName.trim().split(/\s+/).length;
    if (companyWordCount < 2 || companyWordCount > 4) {
      console.error(`Błąd: companyName "${companyName}" ma ${companyWordCount} słów, a powinno mieć od 2 do 4!`);
      throw new Error('Wygenerowana nazwa firmy nie mieści się w zakresie 2-4 słów.');
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
    '/uploads/images/foto1.png',
    '/uploads/images/foto2.png',
    '/uploads/images/foto3.png',
    '/uploads/images/foto4.png',
    '/uploads/images/foto5.png',
    '/uploads/images/foto6.png',
    '/uploads/images/foto7.png',
    '/uploads/images/foto8.png',
    '/uploads/images/foto9.png',
    '/uploads/images/foto10.png',
    '/uploads/images/foto11.png',
    '/uploads/images/foto12.png',
    '/uploads/images/foto13.png',
    '/uploads/images/foto14.png',
    '/uploads/images/foto15.png',
    '/uploads/images/foto16.png',
    '/uploads/images/foto17.png',
    '/uploads/images/foto18.png',
    '/uploads/images/foto19.png',
    '/uploads/images/foto20.png',
    '/uploads/images/foto21.png',
    '/uploads/images/foto22.png',
    '/uploads/images/foto23.png',
    '/uploads/images/foto24.png',
    '/uploads/images/foto25.png',
    '/uploads/images/foto26.png'
  ]

  const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());
  const selectedImages = shuffledImages.slice(0, faker.number.int({ min: 7, max: 9 }));
  const media = selectedImages.map(imageUrl => ({
    mediaType: 'image',
    mediaUrl: imageUrl
  }));
  const videoIndex = faker.number.int({ min: 0, max: media.length });
  media.splice(videoIndex, 0, {
    mediaType: 'video',
    mediaUrl: 'm0TTvfms9qA?si=693uTLD6-T6nQlQQ'
  });

  const offerData: OfferData = {
    vendorId,
    categoryId,
    titleOffer,
    shortDescription: textData.shortDescription,
    longDescription: fullLongDescription,
    priceMin: faker.number.int({ min: 50, max: 300 }),
    priceMax: faker.number.int({ min: 1200, max: 3000 }),
    offersNationwideService,
    contactPhone: faker.string.numeric(9),
    email: faker.internet.email(),
    city: faker.location.city(),
    filterOptions,
    media,
    links,
  };

  if (!offersNationwideService) {
    offerData.rangeInKm = faker.number.int({ min: 50, max: 300 });
  }

  return offerData;
}

async function generateReviewData(listingId: number): Promise<ReviewData[]> {
    const keywords = ["Obiektyw", "Kadr", "Momenty", "Światło", "Emocje", "Pamiątka", "Uchwycone", "Historia", "Sztuka", "Wizja", "Pasja", "Kreatywność", "Magia", "Chwile", "Portret", "Sesja", "Plener", "Reportaż", "Detal", "Radość", "Miłość", "Naturalność", "Styl", "Elegancja", "Profesjonalizm", "Fotografia", "Zdjęcia", "Wspomnienia", "Obraz", "Perspektywa"];
    const prompt = `
    Wygeneruj od 3 do 5 realistycznych opinii w języku polskim dla fotografa lub firmy fotograficznej oferującej usługi weselne. 
    Każda opinia powinna być od innej osoby, z ocenami w skali 3-5 dla pięciu kategorii i krótkim tekstem (2-4 zdania). 
    Zwróć odpowiedź TYLKO w formacie JSON jako TABLICA obiektów (zawsze w nawiasach kwadratowych [], bez żadnych dodatkowych pól nadrzędnych jak "opinie"), 
    gdzie każdy obiekt ma pola:
    - "ratingQuality": ocena jakości (3-5, np. jakość zdjęć, ostrość)
    - "ratingCommunication": ocena komunikacji (3-5)
    - "ratingCreativity": ocena kreatywności (3-5, np. pomysły na sesje, ujęcia)
    - "ratingServiceAgreement": ocena zgodności z umową (3-5, np. terminowość)
    - "ratingAesthetics": ocena estetyki (3-5, np. styl zdjęć, obróbka)
    - "reviewText": krótki tekst opinii (2-4 zdania, po polsku, realistyczny, pozytywny lub umiarkowanie pozytywny, z użyciem słów: "${keywords.join('", "')}")
    Upewnij się, że odpowiedź jest POPRAWNYM JSON-em w formie TABLICY (np. [{"ratingQuality": 5, ...}, ...]) i zawiera co najmniej 3 opinie. 
    Nie dodawaj żadnego tekstu poza JSON-em ani dodatkowych pól nadrzędnych.
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
          attempts++;
          continue;
        }
  
        // Normalizacja odpowiedzi do tablicy
        if (!Array.isArray(parsedResponse)) {
          parsedResponse = parsedResponse.opinie && Array.isArray(parsedResponse.opinie) ? parsedResponse.opinie : [parsedResponse];
        }
  
        // Walidacja i filtrowanie opinii
        const validReviews = parsedResponse.filter((review: any) =>
          review &&
          typeof review.ratingQuality === 'number' && review.ratingQuality >= 3 && review.ratingQuality <= 5 &&
          typeof review.ratingCommunication === 'number' && review.ratingCommunication >= 3 && review.ratingCommunication <= 5 &&
          typeof review.ratingCreativity === 'number' && review.ratingCreativity >= 3 && review.ratingCreativity <= 5 &&
          typeof review.ratingServiceAgreement === 'number' && review.ratingServiceAgreement >= 3 && review.ratingServiceAgreement <= 5 &&
          typeof review.ratingAesthetics === 'number' && review.ratingAesthetics >= 3 && review.ratingAesthetics <= 5 &&
          typeof review.reviewText === 'string' && review.reviewText.trim().length > 0
        );
  
        if (validReviews.length > 0) {
          reviews = [...reviews, ...validReviews];
        }
  
        attempts++;
      } catch (error) {
        attempts++;
      }
    }
  
    // Domyślne opinie dla sal weselnych, jeśli generowanie się nie powiodło
    if (reviews.length < 3) {
        const defaultReviews = [
            {
              ratingQuality: faker.number.int({ min: 4, max: 5 }),
              ratingCommunication: faker.number.int({ min: 4, max: 5 }),
              ratingCreativity: faker.number.int({ min: 4, max: 5 }),
              ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
              ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
              reviewText: "Zdjęcia z wesela to prawdziwa sztuka, każdy kadr pełen emocji. Fotograf uchwycił wszystkie ważne chwile z niesamowitą pasją!"
            },
            {
              ratingQuality: faker.number.int({ min: 4, max: 5 }),
              ratingCommunication: faker.number.int({ min: 3, max: 5 }),
              ratingCreativity: faker.number.int({ min: 4, max: 5 }),
              ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
              ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
              reviewText: "Sesja plenerowa była magiczna, a reportaż oddał radość dnia. Komunikacja mogłaby być szybsza, ale zdjęcia wynagrodziły wszystko."
            },
            {
              ratingQuality: faker.number.int({ min: 3, max: 5 }),
              ratingCommunication: faker.number.int({ min: 4, max: 5 }),
              ratingCreativity: faker.number.int({ min: 4, max: 5 }),
              ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
              ratingAesthetics: faker.number.int({ min: 5, max: 5 }),
              reviewText: "Fotografia pięknie oddała miłość i detale, choć kilka ujęć mogło być ostrzejszych. Styl i kreatywność na najwyższym poziomie!"
            }
          ];
  
      const shuffledDefaultReviews = [...defaultReviews].sort(() => 0.5 - Math.random());
      const neededReviews = Math.max(3, Math.min(5, reviews.length + shuffledDefaultReviews.length)) - reviews.length;
      reviews = [...reviews, ...shuffledDefaultReviews.slice(0, neededReviews)];
    }
  
    // Ograniczenie do 5 opinii i mapowanie na pełne obiekty ReviewData
    reviews = reviews.slice(0, 5);
  
    return reviews.map((review: any) => ({
      listingId,
      userId: faker.helpers.arrayElement(userIds),
      ratingQuality: Math.min(5, Math.max(3, review.ratingQuality)), // Zapewnienie skali 3-5
      ratingCommunication: Math.min(5, Math.max(3, review.ratingCommunication)),
      ratingCreativity: Math.min(5, Math.max(3, review.ratingCreativity)),
      ratingServiceAgreement: Math.min(5, Math.max(3, review.ratingServiceAgreement)),
      ratingAesthetics: Math.min(5, Math.max(3, review.ratingAesthetics)),
      reviewText: review.reviewText,
      weddingDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      location: faker.location.city(),
      reviewerName: faker.person.fullName(),
      reviewerPhone: faker.string.numeric(9),
    }));
  }



// Główna funkcja orkiestrująca
const category = categories.find((cat: any) => cat.service_category_id === 1);

async function testMultipleOffers(count: number = 1) {
  for (let i = 0; i < count; i++) {
    console.log(`Generowanie oferty ${i + 1}...`);
    let offerData;

    // Generowanie oferty poza try-catch, aby błędy inne niż baza danych nie były pomijane
    offerData = await generateOfferData(category);


    try {
      // Tylko operacje związane z bazą danych w try-catch
      const offerResponse = await addOfferToDatabase(offerData);
      const listingId = offerResponse?.listingId;

      if (listingId) {
        const reviews = await generateReviewData(listingId);
        if (reviews.length > 0) {
          for (const review of reviews) {
            await addReviewToDatabase(review);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          console.log(`Dodano ${reviews.length} opinii dla listingId: ${listingId}`);
        } else {
          console.warn('Nie wygenerowano żadnych opinii dla listingId:', listingId);
        }

        const bookings = generateBookingData(listingId);
        for (const booking of bookings) {
          await modifyCalendarInDatabase(booking);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log(`Dodano ${bookings.length} rezerwacji dla listingId: ${listingId}`);
      } else {
        console.warn('Nie udało się pobrać listingId z odpowiedzi serwera dla oferty', i + 1);
      }
    } catch (error: any) {
      // Sprawdzamy, czy błąd jest związany z bazą danych
      if (error.name === 'SequelizeDatabaseError' || error.code?.startsWith('ER_')) {
        console.error(`Błąd bazy danych przy dodawaniu oferty ${i + 1}:`, error.message);
        console.log(`Pomijam ofertę ${i + 1} z powodu błędu bazy danych i przechodzę do następnej...`);
        continue; // Pomijamy tylko dla błędów bazy danych
      } else {
        // Inne błędy są propagowane i przerywają skrypt
        throw error;
      }
    }
  }
  console.log('Zakończono generowanie ofert.');
}

// Uruchomienie skryptu
testMultipleOffers(10).catch(error => {
  console.error('Błąd wykonania skryptu (nie związany z bazą danych):', error);
});