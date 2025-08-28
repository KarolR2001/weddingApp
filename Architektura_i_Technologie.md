# Dokumentacja Techniczna WeddingApp cz.1 Architektura i Technologie

[TOC]

---

## 1. Architektura i Ogólny Przepływ Danych

### 1.1. Architektura Systemu

WeddingApp to aplikacja webowa oparta na architekturze klient-serwer z wyraźnym podziałem na frontend i backend:

```ascii
+----------------+     HTTP/REST     +----------------+     SQL     +----------------+
|    Frontend    |<----------------->|    Backend     |<---------->|  Baza Danych   |
|    (React)     |     requests     |   (Node.js)    |   queries  |    (MySQL)     |
+----------------+                   +----------------+            +----------------+
```

#### Frontend (React + TypeScript)
- **Warstwa prezentacji** (`src/components/`, `src/pages/`)
- **Zarządzanie stanem** (Redux store)
- **Warstwa komunikacji** (Axios dla zapytań HTTP)
- **Routing** (React Router)

#### Backend (Node.js + Express)
- **API REST** (`src/routes/`)
- **Warstwa biznesowa** (`src/controllers/`)
- **Warstwa dostępu do danych** (`src/models/`)
- **Middleware** (`src/middleware/`)

#### Baza Danych
- MySQL z ORM Sequelize
- Przechowywanie wszystkich danych aplikacji

### 1.2. Przepływ Danych

#### Przykładowy przepływ dla operacji odczytu:
```ascii
[Frontend]                [Backend]                [Database]
    |                         |                        |
    |--- HTTP GET ----------->|                        |
    |                         |--- SQL Query --------->|
    |                         |<-- Data --------------|
    |<-- JSON Response -------|                        |
    |                         |                        |
```

#### Przykładowy przepływ dla operacji zapisu:
```ascii
[Frontend]                [Backend]                [Database]
    |                         |                        |
    |--- HTTP POST --------->|                        |
    |                        |-- Validate Data        |
    |                        |-- SQL Insert --------->|
    |                        |<-- Confirmation -------|
    |<-- Status 200 ---------|                        |
    |                        |                        |
```

### 1.3. Główne Zależności Między Modułami

#### 1.3.1. Kluczowe Powiązania w Bazie Danych

1. **Użytkownicy i Role**:
   - **User -> Role**:
     - User <-> Vendor (one-to-one): Konto usługodawcy z dodatkowymi informacjami biznesowymi
     - User <-> Couple (one-to-one): Konto pary młodej z informacjami o weselu
     - User <-> Device (one-to-many): Urządzenia używane do logowania i powiadomień
   
   - **Szczegóły implementacji**:
     ```typescript
     // Przykład relacji w modelach
     User.hasOne(Vendor)
     User.hasOne(Couple)
     User.hasMany(Device)
     ```

2. **Zarządzanie Ofertami**:
   - **Vendor -> Oferty**:
     - Vendor <-> VendorListing (one-to-many): Ogłoszenia usługodawcy
       - Zawiera: title, description, price, availability
     - VendorListing <-> Category (many-to-one): Kategoria usługi
       - Kategorie: Fotografia, Wideofilmowanie, DJ, Zespoły, etc.
     - VendorListing <-> Review (one-to-many): Opinie klientów
     - VendorListing <-> ListingStat (one-to-one): Statystyki wyświetleń i kontaktów
     - VendorListing <-> Image (one-to-many): Zdjęcia oferty
   
   - **Szczegóły implementacji**:
     ```typescript
     // Przykład relacji
     Vendor.hasMany(VendorListing)
     VendorListing.belongsTo(Category)
     VendorListing.hasMany(Review)
     VendorListing.hasOne(ListingStat)
     ```

3. **Planowanie Weselne**:
   - **Couple -> Zarządzanie**:
     - Couple <-> Guest (one-to-many): Lista gości weselnych
       - Informacje: imię, nazwisko, status, preferencje menu
     - Couple <-> Table (one-to-many): Plan stołów
       - Właściwości: numer, pojemność, typ
     - Guest <-> Table (many-to-many): Przypisanie gości do stołów
       - Dodatkowe info: miejsce przy stole
     - Couple <-> Task (one-to-many): Lista zadań do wykonania
   
   - **Szczegóły implementacji**:
     ```typescript
     // Przykład relacji
     Couple.hasMany(Guest)
     Couple.hasMany(Table)
     Guest.belongsToMany(Table, { through: 'GuestTable' })
     ```

4. **System Komunikacji**:
   - **Konwersacje i Wiadomości**:
     - User <-> Conversation (many-to-many): Konwersacje między użytkownikami
       - Właściwości: uczestnicy, status, ostatnia aktywność
     - Conversation <-> Message (one-to-many): Wiadomości w konwersacji
       - Zawartość: tekst, załączniki, status odczytu
     - User <-> Notification (one-to-many): Powiadomienia systemowe
       - Typy: nowa wiadomość, zmiana statusu, przypomnienia
   
   - **Szczegóły implementacji**:
     ```typescript
     // Przykład relacji
     User.belongsToMany(Conversation, { through: 'UserConversation' })
     Conversation.hasMany(Message)
     User.hasMany(Notification)
     ```

#### 1.3.2. Struktura Modułów i Przepływ Danych

1. **Frontend (React + TypeScript)**:
   ```ascii
   src/
   ├── components/          # Komponenty wielokrotnego użytku
   │   ├── auth/           # Komponenty autoryzacji
   │   ├── listings/       # Komponenty ofert
   │   ├── planning/       # Komponenty planowania weselnego
   │   └── common/         # Współdzielone komponenty
   ├── pages/              # Widoki aplikacji
   ├── redux/              # Zarządzanie stanem
   │   ├── slices/        # Reduktory i akcje
   │   └── store.ts       # Konfiguracja Redux
   ├── services/           # Komunikacja z API
   └── utils/              # Funkcje pomocnicze
   ```

2. **Backend (Node.js + Express)**:
   ```ascii
   src/
   ├── controllers/        # Logika biznesowa
   │   ├── auth/          # Kontrolery autoryzacji
   │   ├── listings/      # Kontrolery ofert
   │   └── planning/      # Kontrolery planowania
   ├── models/            # Modele Sequelize
   ├── routes/            # Definicje endpointów
   ├── middleware/        # Middleware
   └── services/          # Serwisy zewnętrzne
   ```

#### 1.3.3. Systemy Powiązane i Ich Integracje

1. **System Autentykacji i Autoryzacji**:
   - **Komponenty**:
     - JWT dla sesji użytkownika
     - Passport.js dla strategii logowania
     - Role i uprawnienia (RBAC)
   - **Przepływ autoryzacji**:
     ```ascii
     [Login Request] -> [Passport Strategy] -> [JWT Generation] -> [User Session]
     ```

2. **System Powiadomień**:
   - **Typy powiadomień**:
     - W aplikacji (real-time przez WebSocket)
     - Email (poprzez nodemailer)
     - Push (dla urządzeń mobilnych)
   - **Obsługa zdarzeń**:
     ```ascii
     [Event] -> [Notification Service] -> [Queue] -> [Delivery System]
     ```

3. **System Komunikacji**:
   - **Funkcjonalności**:
     - Chat w czasie rzeczywistym (WebSocket)
     - Historia konwersacji
     - Załączniki i media
   - **Architektura czatu**:
     ```ascii
     [WebSocket Connection] <-> [Chat Service] <-> [Message Queue] <-> [Database]
     ```

4. **System Kalendarza**:
   - **Komponenty**:
     - Kalendarz dostępności
     - Synchronizacja z Google Calendar
     - System rezerwacji terminów
   - **Integracje**:
     ```ascii
     [Calendar UI] <-> [Calendar Service] <-> [External Calendar APIs]
     ```

5. **System Raportowania**:
   - **Funkcjonalności**:
     - Generowanie raportów PDF
     - Statystyki ogłoszeń
     - Analityka użytkowników
   - **Przetwarzanie danych**:
     ```ascii
     [Data Collection] -> [Processing] -> [Report Generation] -> [PDF/Excel Output]
     ```

6. **System Zarządzania Treścią**:
   - **Funkcjonalności**:
     - Upload plików (multer)
     - Optymalizacja obrazów
     - Walidacja contentu
   - **Przepływ plików**:
     ```ascii
     [File Upload] -> [Validation] -> [Processing] -> [Storage] -> [CDN/Local]
     ```

7. **System Planowania Weselnego**:
   - **Moduły**:
     - Zarządzanie gośćmi
     - Generator planów stołów
     - Lista zadań (todo)
   - **Integracje**:
     ```ascii
     [Planning Tools] <-> [Database] <-> [Export Systems (PDF/Excel)]
     ```

#### 1.3.4. Przepływ Danych i Komunikacja

1. **Komunikacja Frontend-Backend**:
   ```ascii
   [React Component] -> [Redux Action] -> [API Service] -> [Express Route] -> [Controller] -> [Model]
   ```

2. **Obsługa Żądań**:
   ```ascii
   Request -> Auth Middleware -> Validation -> Business Logic -> Database -> Response
   ```

3. **Integracje Zewnętrzne**:
   ```ascii
   [App] <-> [External APIs] (Google Calendar, Email Service, Storage Service)
   ```

---

## 2. Technologie i Narzędzia

### 2.1. Frontend

#### 2.1.1. Główne Technologie
- **React 18+**
  - Framework do budowania interfejsu użytkownika
  - Wykorzystanie funkcjonalnych komponentów i hooków
  - React Router 6 dla routingu
  - Strict Mode dla wykrywania potencjalnych problemów

- **TypeScript**
  - Typowanie statyczne
  - Interfejsy dla props i state
  - Typy dla API responses
  - Generics dla komponentów wielokrotnego użytku

- **Redux Toolkit**
  - Zarządzanie globalnym stanem aplikacji
  - Slices dla różnych funkcjonalności (auth, listings, notifications)
  - Redux Thunk dla asynchronicznych akcji
  - Redux DevTools dla debugowania

#### 2.1.2. Style i UI
- **CSS Modules**
  - Lokalne style dla komponentów
  - Sass/SCSS dla zaawansowanych stylów
  - PostCSS dla autoprefixera i optymalizacji

- **Biblioteki UI**
  - Custom komponenty
  - Responsywny design
  - Adaptacyjne layouty

#### 2.1.3. Narzędzia Developerskie
- **Create React App**
  - Webpack dla bundlowania
  - Babel dla transpilacji
  - ESLint dla lintera
  - Jest dla testów

- **Development Tools**
  - Hot Module Replacement
  - Source Maps
  - Error Boundaries
  - React DevTools

### 2.2. Backend

#### 2.2.1. Główne Technologie
- **Node.js**
  - Środowisko uruchomieniowe JavaScript
  - Event-driven architecture
  - Asynchroniczne operacje

- **Express.js**
  - REST API framework
  - Middleware system
  - Routing
  - Obsługa błędów

- **TypeScript**
  - Typowanie dla większej niezawodności
  - Interfejsy dla modeli
  - Dekoratory dla routingu
  - Type-safe API responses

#### 2.2.2. Baza Danych
- **MySQL**
  - Relacyjna baza danych
  - Transakcje
  - Indeksy
  - Złożone zapytania

- **Sequelize ORM**
  - Model definitions
  - Relacje między modelami
  - Migracje
  - Seedery danych

#### 2.2.3. Bezpieczeństwo
- **Authentication**
  - JWT (JSON Web Tokens)
  - Passport.js
  - Bcrypt dla hashowania haseł
  - CORS protection

- **Authorization**
  - Role-based access control
  - Middleware autoryzacyjne
  - Walidacja requestów
  - Rate limiting

#### 2.2.4. Narzędzia Pomocnicze
- **Multer**
  - Upload plików
  - Obsługa multipart/form-data
  - Walidacja plików

- **Nodemailer**
  - Wysyłka emaili
  - Szablony HTML
  - Queue system

- **Ollama/AI**
  - Generowanie opisów
  - Procesowanie tekstu
  - Analiza contentu

### 2.3. Komunikacja Frontend-Backend

#### 2.3.1. HTTP
- **Axios**
  - Interceptors dla requestów/responses
  - Handlery błędów
  - Automatyczna transformacja danych
  - Timeout handling

#### 2.3.2. WebSocket
- **Socket.io**
  - Real-time komunikacja
  - Chat functionality
  - Live notifications
  - Statusy online

### 2.4. Narzędzia Developerskie

#### 2.4.1. Development
- **nodemon**
  - Hot reloading dla backendu
  - Watch mode
  - Automatyczny restart

- **Concurrently**
  - Równoległe uruchamianie procesów
  - Dev serwery frontend/backend

#### 2.4.2. Testowanie
- **Jest**
  - Unit testy
  - Integration testy
  - Snapshot testing

- **Testing Library**
  - Komponenty React
  - User interactions
  - Async operations

#### 2.4.3. Debugging
- **Chrome DevTools**
  - Source maps
  - Network monitoring
  - Performance profiling

- **VS Code Debugger**
  - Breakpoints
  - Variable inspection
  - Call stack analysis

### 2.5. Zewnętrzne Integracje

#### 2.5.1. Serwisy
- **Google Calendar API**
  - Synchronizacja wydarzeń
  - Zarządzanie terminarzem

#### 2.5.2. Storage
- **Local File System**
  - Przechowywanie uploadów
  - Organizacja plików
  - Backup system

### 2.6. Build i Deployment

#### 2.6.1. Build Process
- **Webpack**
  - Bundling
  - Minifikacja
  - Code splitting
  - Asset optimization

#### 2.6.2. Environment
- **dotenv**
  - Zmienne środowiskowe
  - Konfiguracja per environment
  - Sensitive data management

---

## 3. Struktura Projektu

### 3.1. Frontend (`frontend/`)

#### 3.1.1. Główne Komponenty i Struktura
- **src/components/**: Reużywalne komponenty
  - `AdminSidebarMenu.tsx`: Menu boczne dla panelu admina
  - `CoupleSidebarMenu.tsx`: Menu boczne dla panelu pary młodej
  - `VendorSidebarMenu.tsx`: Menu boczne dla panelu usługodawcy
  - `LoginTopMenu.tsx`, `NoLoginTopMenu.tsx`: Menu górne dla zalogowanych/niezalogowanych
  - `MessageComponent/`: Komponenty do obsługi wiadomości
    - `MessageView.tsx`: Widok konwersacji
    - `ConversationList.tsx`: Lista konwersacji
    - `MessageItem.tsx`: Pojedyncza wiadomość
  - `GuestList/`: Komponenty do zarządzania listą gości
    - `GuestListHeader.tsx`: Nagłówek listy gości
    - `GuestListTable.tsx`: Tabela z gośćmi
    - `GuestRow.tsx`: Pojedynczy wiersz gościa
  - `TablePlan/`: Komponenty do zarządzania planem stołów
    - `TableList.tsx`: Lista stołów
    - `TableRow.tsx`: Pojedynczy wiersz stołu
    - `AddTableModal.tsx`: Modal dodawania stołu
  - `AdminStats/`: Komponenty dla statystyk admina
  - Formularze i elementy UI:
    - `Button1.tsx`, `Button2.tsx`: Różne style przycisków
    - `Input1.tsx`, `Input2.tsx`: Komponenty input
    - `Dropdown1.tsx`-`Dropdown5.tsx`: Różne style dropdownów
    - `Toggle.tsx`: Przełącznik
    - `Spinner.tsx`: Loader

#### 3.1.2. Struktura Stron (`src/pages/`)
- **Admin/**: Panel administracyjny
  - `Dashboard.tsx`: Główny komponent dashboardu
  - `AdminHomePage.tsx`: Strona główna
  - `AdminAccountManagementPage.tsx`: Zarządzanie kontami
  - `AdminReportsPage.tsx`: Raporty i statystyki
  - `AdminNotificationsPage.tsx`: Zarządzanie powiadomieniami

- **Couple/**: Panel pary młodej
  - `Dashboard.tsx`: Główny komponent dashboardu
  - `HomePage.tsx`: Strona główna z licznikiem
  - `MessagesPage.tsx`: Wiadomości
  - `FavoritesPage.tsx`: Ulubione oferty
  - `GuestListPage.tsx`: Lista gości
  - `TablePlanPage.tsx`: Plan stołów

- **Vendor/**: Panel usługodawcy
  - `Dashboard.tsx`: Główny komponent dashboardu
  - `AddListingComponent.tsx`: Dodawanie oferty
  - `EditListing.tsx`: Edycja oferty

- **Publiczne strony**:
  - `LandingPage.tsx`: Strona główna
  - `LoginPage.tsx`: Logowanie
  - `RegisterPage.tsx`: Rejestracja
  - `OfferListPage.tsx`: Lista ofert
  - `ListingDetailPage.tsx`: Szczegóły oferty

#### 3.1.3. Redux Store (`src/redux/`)
- **slices/**: Redux Toolkit slices
  - `authSlice.ts`: Autentykacja
  - `guestListSlice.ts`: Lista gości
  - `tablePlanSlice.ts`: Plan stołów
  - `messagesSlice.ts`: Wiadomości
  - `reviewsSlice.ts`: Opinie
  - `calendarSlice.ts`: Kalendarz
  - `filtersSlice.ts`: Filtry ofert
  - `adminNotificationsSlice.ts`: Powiadomienia admina

#### 3.1.4. Style (`src/styles/`)
- **Admin/**: Style panelu admina
- **Couple/**: Style panelu pary młodej
- **Vendor/**: Style panelu usługodawcy
- **MessageComponent/**: Style komponentów wiadomości
- Moduły CSS dla komponentów

#### 3.1.5. Zasoby i Assety (`src/assets/`)
- Ikony SVG
- Obrazy
- Logo
- Pliki mediów

#### 3.1.6. Konfiguracja (`config/`)
- `webpack.config.js`: Konfiguracja webpacka
- `paths.js`: Ścieżki projektu
- `env.js`: Zmienne środowiskowe
- `jest/`: Konfiguracja testów

### 3.2. Backend (`backend/`)

#### 3.2.1. Struktura Główna
- **src/**: Kod źródłowy
  - `app.ts`: Główna aplikacja Express
  - `server.ts`: Serwer HTTP
  - `custom.d.ts`: Typy TypeScript

#### 3.2.2. Konfiguracja (`src/config/`)
- `database.ts`: Konfiguracja bazy danych
- `passport.ts`: Konfiguracja autentykacji

#### 3.2.3. Moduły
- **controllers/**: Logika biznesowa
- **middleware/**: Middleware (auth, walidacja, etc.)
- **models/**: Modele Sequelize
- **routes/**: Routing API
- **services/**: Serwisy zewnętrzne
- **templates/**: Szablony (email, PDF)
- **utils/**: Funkcje pomocnicze

#### 3.2.4. Dane Seedujące (`seed/`)
- Skrypty generujące dane testowe:
  - `seedVendorUsers.js`: Użytkownicy-usługodawcy
  - `seedAtrakcjeWeselneOffer.ts`: Oferty atrakcji
  - `seedCateringOffer.ts`: Oferty cateringu
  - `seedFotografiaOffer.ts`: Oferty fotografii
  - `seedZespolyMuzyczneOffers.ts`: Oferty zespołów
  - Inne kategorie ofert
- `categories.json`: Definicje kategorii
- `staticData.ts`: Dane statyczne

#### 3.2.5. Zasoby Publiczne (`public/`)
- Szablony (np. `guest_template.xlsx`)
- Pliki statyczne

#### 3.2.6. Uploady (`uploads/`)
- Katalog na pliki przesłane przez użytkowników
- Podkatalogi dla różnych typów plików (np. `images/`)

### 3.3. Dokumentacja i Assety

#### 3.3.1. Dokumentacja
- `Dokumentacja.md`: Dokumentacja techniczna
- `README.md`: Podstawowe informacje o projekcie
- `test.http`: Przykłady requestów HTTP

#### 3.3.2. Screenshots
- `AddEditOfer.png`: Edycja oferty
- `AdminKonta.png`: Panel zarządzania kontami
- `AdminPowiadomienia.png`: Panel powiadomień
- `AdminStat.png`: Statystyki
- `ListGos.png`: Lista gości
- `PlanStol.png`: Plan stołów
- Inne zrzuty ekranu interfejsu

### 3.4. Główne Mechanizmy

#### 3.4.1. Routing
- Struktura routingu w React Router
- Ochrona ścieżek przez PrivateRoute
- Różne dashboardy dla różnych typów użytkowników

#### 3.4.2. Autentykacja
- JWT i Passport.js
- Persystencja stanu w localStorage
- Różne typy użytkowników (admin, couple, vendor)

#### 3.4.3. Zarządzanie Stanem
- Redux Toolkit dla globalnego stanu
- Context API dla lokalnego stanu
- Persystencja w localStorage

#### 3.4.4. Komunikacja z API
- Axios dla zapytań HTTP
- WebSocket dla czatu i powiadomień
- Interceptory i handlery błędów

#### 3.4.5. Formularze i Walidacja
- Własne komponenty formularzy
- Walidacja po stronie klienta i serwera
- Obsługa plików i uploadów

---