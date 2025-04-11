import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';
import { fakerPL as faker } from '@faker-js/faker';
import axios, { AxiosError } from 'axios';
import { OfferData, ReviewData, categories, usedCompanyNames, vendorIds, userIds, getFilterNames, addOfferToDatabase, addReviewToDatabase, modifyCalendarInDatabase, generateBookingData, saveUsedCompanyNames } from './staticData';

dotenv.config();

const ollama = new Ollama({ host: 'http://localhost:11434' });

async function generateCompanyName(categoryName: string): Promise<string> {
    const keywords = ["Smak", "Kuchnia", "Menu", "Potrawy", "Delikatesy", "Aromat", "Świeżość", "Elegancja", "Styl", "Pyszność", "Radość", "Harmonia", "Kreatywność", "Pasja", "Dania", "Przekąski", "Bufet", "Catering", "Wesele", "Ślub", "Serwis", "Smakołyki", "Tradycja", "Nowoczesność", "Szyk", "Finezja", "Specjały", "Deser", "Obiad", "Kolacja", "Uczta", "Apetyt"];
    const baseNames = ["Catering", "Kuchnia", "Smaki", "Serwis", "Menu", "Przekąski", "Bufet", "Delikatesy", "Aromaty", "Elegancja", "Styl", "Pyszności"];
    const additionalWords = ["Weselny", "Ślubny", "Kreatywny", "Elegancki"];
  
    const prompt = `
      Tworzę bazę ofert dla firm w branży ślubnej, specjalizujących się w kategorii "${categoryName}". 
      Potrzebuję unikalnych, chwytliwych nazw firm spełniających następujące wymagania:
  
      ŚCISŁE ZASADY:
      1. Format: 2-4 słowa, bez cyfr (arabskich, rzymskich ani słownie)
      2. Poprawna gramatyka i odmiana (np. "Catering Weselny" a nie "Catering Wesele", "Kuchnia Ślubna" a nie "Kuchnia Ślub") - jest to najważniejszy element
      3. Zakazane elementy:
         - Cyfry w jakiejkolwiek formie (np. "Catering 2", "Serwis Trzy")
         - Znaki specjalne poza myślnikami
         - Skróty i numery porządkowe (II, III, 1st)
      4. Preferowane są polskie nazwy, używające słów takich jak "${baseNames.join('", "')}" jako baza, z dodatkami odnoszącymi się do usług cateringowych na wesela. Nazwy powinny sugerować różnorodność usług (np. bufet weselny, menu obiadowe, przekąski, desery, serwis na miejscu) i jakość. Słowa kluczowe do wykorzystania: "${keywords.join('", "')}".
      5. Unikaj nazw, które mogą być mylące lub nieodpowiednie dla branży ślubnej.
      6. Jeśli wiele nazw już istnieje, zmień koncepcje oraz podejście i generuj nowe kombinacje z dostępnych słów kluczowych i bazowych, zmieniając koncepcję, dbając o unikalność i poprawność gramatyczną.
  
PRZYKŁADY NIEDOZWOLONYCH NAZW:
    - "Catering Smaków II"
    - "Kuchnia 3"
    - "Serwis 2024"
    - "Smaki Pierwsze"
    - "Sala Weselna Smaków" (niedozwolone – sugeruje lokal)

    PRZYKŁADY PREFEROWANYCH NAZW:
    - "Catering Weselnych Smaków"
    - "Kuchnia Ślubnej Elegancji"
    - "Smaki Kreatywnego Bufetu"
    - "Serwis Pysznych Uczt"

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
        "Taniec Miłości", "Rytm Wesela", "Krok Elegancji",
        "Sala Smaków" // Dodano przykład z "salą"
      ];

      const containsNumber = numberPattern.test(name);

      if (
        wordCount >= 2 && wordCount <= 4 &&
        !containsNumber &&
        !forbiddenNames.includes(name) &&
        !usedCompanyNames.has(name) &&
        !name.toLowerCase().includes("sala") // Dodatkowe sprawdzenie na "sala"
      ) {
        companyName = name;
        usedCompanyNames.add(companyName);
        saveUsedCompanyNames(usedCompanyNames);
        console.log(`Wygenerowana nazwa firmy po ${attempts} próbach: ${companyName}`);
      } else {
        const reason = containsNumber ? "zawiera cyfry lub liczby słownie" :
                      forbiddenNames.includes(name) ? "jest zakazana" :
                      usedCompanyNames.has(name) ? "już istnieje" :
                      name.toLowerCase().includes("sala") ? "sugeruje salę weselną" :
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
    const maxFallbackAttempts = 10;

    while (!companyName && fallbackAttempts < maxFallbackAttempts) {
      fallbackAttempts++;

      const randomBase = baseNames[Math.floor(Math.random() * baseNames.length)];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const randomAdditional = additionalWords[Math.floor(Math.random() * additionalWords.length)];

      // Logika gramatyczna: dostosowanie składni
      let candidateName = '';
      const useThreeWords = usedCompanyNames.size > 50 && Math.random() < 0.7;

      if (useThreeWords) {
        if (randomBase === "Catering" || randomBase === "Serwis") {
          candidateName = `${randomBase} ${randomKeyword} ${randomAdditional}`; // np. "Catering Weselny Smak"
        } else {
          candidateName = `${randomBase} ${randomAdditional} ${randomKeyword}`; // np. "Kuchnia Ślubna Uczta"
        }
      } else {
        if (randomBase === "Catering" || randomBase === "Serwis") {
          candidateName = `${randomBase} ${randomKeyword}`; // np. "Catering Pyszność"
        } else {
          candidateName = `${randomBase} ${randomAdditional}`; // np. "Smaki Weselny"
        }
      }

      if (
        !numberPattern.test(candidateName) &&
        !usedCompanyNames.has(candidateName) &&
        candidateName.split(/\s+/).length >= 2 && candidateName.split(/\s+/).length <= 4 &&
        !candidateName.toLowerCase().includes("sala")
      ) {
        companyName = candidateName;
        usedCompanyNames.add(companyName);
        saveUsedCompanyNames(usedCompanyNames);
        console.log(`Użyto wygenerowanej nazwy awaryjnej po ${fallbackAttempts} próbach: ${companyName}`);
        break;
      }
    }

    // Ostateczny fallback
    if (!companyName) {
      const uniqueSuffix = `${keywords[Math.floor(Math.random() * keywords.length)]}-${Date.now().toString().slice(-4)}`;
      companyName = `Catering ${uniqueSuffix}`; // np. "Catering Smak-1234"
      usedCompanyNames.add(companyName);
      saveUsedCompanyNames(usedCompanyNames);
      console.log(`Użyto ostatecznego fallbacku z unikalnym sufiksem: ${companyName}`);
    }
  }

  return companyName;
}

async function generateInitialText(categoryName: string, filterNames: string[], companyName: string): Promise<{ bandName: string; shortDescription: string; longDescription: string }> {
    const keywords = ["Smak", "Kuchnia", "Menu", "Potrawy", "Delikatesy", "Aromat", "Świeżość", "Elegancja", "Styl", "Pyszność", "Radość", "Harmonia", "Kreatywność", "Pasja", "Dania", "Przekąski", "Bufet", "Catering", "Wesele", "Ślub", "Serwis", "Smakołyki", "Tradycja", "Nowoczesność", "Szyk", "Finezja", "Specjały", "Deser", "Obiad", "Kolacja", "Uczta", "Apetyt"];

    const prompt = `
    Jesteś copywriterem specjalizującym się w tekstach dla branży ślubnej. Stwórz kompleksowy opis w języku polskim dla firmy "${companyName}" (kategoria: ${categoryName}).
    
    ZASADY:
    1. Struktura:
       - Rozpocznij tekst naturalnie, bez zwrotów typu "Witamy" czy "Dzień dobry"
       - ShortDescription: 1-2 zdania wprowadzające (tona profesjonalno-zachęcający)
       - LongDescription: pełny tekst "O nas" (ok. 20 zdań) stanowiący SAMODZIELNĄ CAŁOŚĆ
    
    2. Treść:
       - Uwzględnij filtry: ${filterNames.join(', ')}
       - Wpleć motyw: "${keywords.join('", "')}"
       - Opisz: historię firmy, specjalizację (catering weselny, bufet przekąskowy, menu obiadowe), ofertę (dania ciepłe, desery, przekąski, serwis kelnerski), materiały (świeże składniki, lokalne produkty), podejście do klienta (konsultacje menu, personalizacja)
       - Podkreśl unikalne wartości (smak, świeżość, profesjonalizm)
       - Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia opisu
       - Nie wspominaj o salach weselnych czy lokalach - skup się wyłącznie na usłudze cateringowej
    
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
    const keywords = ["Smak", "Kuchnia", "Menu", "Potrawy", "Delikatesy", "Aromat", "Świeżość", "Elegancja", "Styl", "Pyszność", "Radość", "Harmonia", "Kreatywność", "Pasja", "Dania", "Przekąski", "Bufet", "Catering", "Wesele", "Ślub", "Serwis", "Smakołyki", "Tradycja", "Nowoczesność", "Szyk", "Finezja", "Specjały", "Deser", "Obiad", "Kolacja", "Uczta", "Apetyt"];

    const prompt = `
    Jesteś tym samym copywriterem co wcześniej. Rozwiń istniejący opis firmy "${bandName}" o 5 NOWYCH, SPÓJNYCH zdań.
    
    ZASADY:
    1. Kontynuuj dokładnie tam gdzie skończył się poprzedni tekst (NIE POWTARZAJ niczego)
    2. Uwzględnij filtry: ${filterNames.join(', ')}
    3. Wpleć motyw: "${keywords.join('", "')}"
    4. Tematyka rozszerzenia:
       - Specyficzne usługi (np. stacje live cooking, finger food, tematyczne bufety)
       - Materiały i techniki (np. lokalne specjały, świeże zioła, elegancka prezentacja)
       - Przykładowe realizacje (np. wesele plenerowe, elegancka kolacja)
    5. Zachowaj IDENTYCZNY styl i ton
    6. NIE używaj numeracji, nawiasów kwadratowych, punktów lub innych oznaczeń strukturalnych
    7. NIE używaj fraz typu "Oto 5 nowych zdań" lub "Kontynuacja opisu"
    8. Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia tekstu
    9. Nie wspominaj o salach weselnych – skup się na usłudze cateringowej
    
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
        return `Nasza kolekcja obejmuje zarówno klasyczne fasony, jak i nowoczesne kroje inspirowane najnowszymi trendami w modzie ślubnej. Każda suknia szyta jest z dbałością o najmniejszy detal, z wykorzystaniem najwyższej jakości materiałów. Specjalizujemy się w ${keywords.join('", "')}, co wyróżnia nasze projekty na tle konkurencji. Panny Młode cenią nas za indywidualne podejście i możliwość personalizacji każdego elementu kreacji. Nasze doświadczenie pozwala nam doradzać w kwestii doboru dodatków i wykończenia, aby całość tworzyła spójną kompozycję.`;
      }
    } catch (error) {
      console.error('Błąd podczas rozszerzania tekstu (część 1):', error);
      
      // Fallback text
      return `Nasza kolekcja obejmuje zarówno klasyczne fasony, jak i nowoczesne kroje. Każda suknia wykonywana jest z najwyższej jakości materiałów. Panny Młode doceniają nasze indywidualne podejście i możliwość personalizacji. Doświadczeni projektanci dbają o każdy detal. Oferujemy kompleksową usługę od pierwszego spotkania po ostatnie przymiarki.`;
    }
  }
  
  async function expandTextPart2(existingText: string, bandName: string, filterNames: string[]): Promise<string> {
    const keywords = ["Smak", "Kuchnia", "Menu", "Potrawy", "Delikatesy", "Aromat", "Świeżość", "Elegancja", "Styl", "Pyszność", "Radość", "Harmonia", "Kreatywność", "Pasja", "Dania", "Przekąski", "Bufet", "Catering", "Wesele", "Ślub", "Serwis", "Smakołyki", "Tradycja", "Nowoczesność", "Szyk", "Finezja", "Specjały", "Deser", "Obiad", "Kolacja", "Uczta", "Apetyt"];

    const prompt = `
    Jesteś tym samym copywriterem co wcześniej. Dodaj ostatnie 5 SPÓJNYCH zdań do opisu "${bandName}".
    
    ZASADY:
    1. Kontynuuj naturalnie poprzednią myśl (NIE POWTARZAJ informacji)
    2. Uwzględnij filtry: ${filterNames.join(', ')}
    3. Wpleć motyw: "${keywords.join('", "')}"
    4. Tematyka rozszerzenia:
       - Doświadczenia z Parami Młodymi (np. konsultacje menu, dopasowanie do diety)
       - Unikalne usługi (np. mobilny bufet, wegańskie opcje, szybka dostawa)
       - Wizja i wartości (np. tworzenie uczty dla zmysłów, jakość składników)
       - Call-to-action (subtelnym tonem, np. zachęta do kontaktu w sprawie menu)
    5. Zakończ tekst naturalnie, bez sztucznych podsumowań
    6. NIE używaj numeracji, nawiasów kwadratowych, punktów lub innych oznaczeń strukturalnych
    7. NIE używaj fraz typu "Oto 5 nowych zdań" lub "Kontynuacja opisu"
    8. Użyj słów kluczowych: "${keywords.join('", "')}" dla wzbogacenia tekstu
    9. Nie wspominaj o salach weselnych – skup się na usłudze cateringowej
    
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
        return `Nasze klientki doceniają atmosferę ${keywords.join('", "')}, jaka panuje podczas każdej przymiarki. Oferujemy prywatne sesje konsultacyjne, podczas których przyszła Panna Młoda ma salon wyłącznie dla siebie. Wierzymy, że każda kobieta zasługuje na wyjątkową suknię, która podkreśli jej naturalną urodę. Nasze projekty są wyrazem pasji i zaangażowania całego zespołu. Twoja historia miłosna zasługuje na oprawę równie piękną jak uczucie, które was połączyło.`;
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
    '/uploads/images/cat1.png',
    '/uploads/images/cat2.png',
    '/uploads/images/cat3.png',
    '/uploads/images/cat4.png',
    '/uploads/images/cat5.png',
    '/uploads/images/cat6.png',
    '/uploads/images/cat7.png',
    '/uploads/images/cat8.png',
    '/uploads/images/cat9.png',
    '/uploads/images/cat10.png',
    '/uploads/images/cat11.png',
    '/uploads/images/cat12.png',
    '/uploads/images/cat13.png',
    '/uploads/images/cat14.png',
    '/uploads/images/cat15.png',
    '/uploads/images/cat16.png',
    '/uploads/images/cat17.png',
    '/uploads/images/cat18.png',
    '/uploads/images/cat19.png',
    '/uploads/images/cat20.png',
    '/uploads/images/cat21.png',
    '/uploads/images/cat22.png',
    '/uploads/images/cat23.png',
    '/uploads/images/cat24.png',
    '/uploads/images/cat25.png',
    '/uploads/images/cat26.png',
    '/uploads/images/cat27.png',
    '/uploads/images/cat28.png',
    '/uploads/images/cat29.png'
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
    mediaUrl: '3rlda-NXvyk?si=lxqUHyJtm2jvQkn4'
  });

  const offerData: OfferData = {
    vendorId,
    categoryId,
    titleOffer,
    shortDescription: textData.shortDescription,
    longDescription: fullLongDescription,
    priceMin: faker.number.int({ min: 50, max: 200 }),
    priceMax: faker.number.int({ min: 150, max: 1000 }),
    offersNationwideService,
    contactPhone: faker.string.numeric(9),
    email: faker.internet.email(),
    city: faker.location.city(),
    filterOptions,
    media,
    links,
  };

  if (!offersNationwideService) {
    offerData.rangeInKm = faker.number.int({ min: 50, max: 400 });
  }

  return offerData;
}

async function generateReviewData(listingId: number): Promise<ReviewData[]> {
    const keywords = ["Smak", "Kuchnia", "Menu", "Potrawy", "Delikatesy", "Aromat", "Świeżość", "Elegancja", "Styl", "Pyszność", "Radość", "Harmonia", "Kreatywność", "Pasja", "Dania", "Przekąski", "Bufet", "Catering", "Wesele", "Ślub", "Serwis", "Smakołyki", "Tradycja", "Nowoczesność", "Szyk", "Finezja", "Specjały", "Deser", "Obiad", "Kolacja", "Uczta", "Apetyt"];

    const prompt = `
    Wygeneruj od 3 do 5 realistycznych opinii w języku polskim dla firmy oferującej usługi cateringowe w kategorii "Catering". 
    Każda opinia powinna być od innej osoby, z ocenami w skali 3-5 dla pięciu kategorii i krótkim tekstem (2-4 zdania). 
    Zwróć odpowiedź TYLKO w formacie JSON jako TABLICA obiektów (zawsze w nawiasach kwadratowych [], bez żadnych dodatkowych pól nadrzędnych jak "opinie"), 
    gdzie każdy obiekt ma pola:
    - "ratingQuality": ocena jakości (3-5, np. jakość potraw, świeżość składników)
    - "ratingCommunication": ocena komunikacji (3-5)
    - "ratingCreativity": ocena kreatywności (3-5, np. różnorodność menu, prezentacja)
    - "ratingServiceAgreement": ocena zgodności z umową (3-5, np. terminowość)
    - "ratingAesthetics": ocena estetyki (3-5, np. wygląd bufetu, aranżacja dań)
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
              reviewText: "Potrawy były pyszne i świeże, a bufet weselny prezentował się elegancko. Serwis był profesjonalny i zadbał o każdy szczegół naszej uczty!"
            },
            {
              ratingQuality: faker.number.int({ min: 4, max: 5 }),
              ratingCommunication: faker.number.int({ min: 3, max: 5 }),
              ratingCreativity: faker.number.int({ min: 4, max: 5 }),
              ratingServiceAgreement: faker.number.int({ min: 5, max: 5 }),
              ratingAesthetics: faker.number.int({ min: 4, max: 5 }),
              reviewText: "Menu zachwyciło smakiem i kreatywnością, szczególnie przekąski i desery. Komunikacja przed weselem mogłaby być szybsza, ale jedzenie wynagrodziło wszystko."
            },
            {
              ratingQuality: faker.number.int({ min: 3, max: 5 }),
              ratingCommunication: faker.number.int({ min: 4, max: 5 }),
              ratingCreativity: faker.number.int({ min: 4, max: 5 }),
              ratingServiceAgreement: faker.number.int({ min: 4, max: 5 }),
              ratingAesthetics: faker.number.int({ min: 5, max: 5 }),
              reviewText: "Dania były smaczne, choć niektóre mogłyby być cieplejsze. Prezentacja bufetu i harmonia smaków stworzyły prawdziwą radość na naszym weselu!"
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
const category = categories.find((cat: any) => cat.service_category_id === 3);

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