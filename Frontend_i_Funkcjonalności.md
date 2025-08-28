
## 6. Middleware

### 6.1. Lista Middleware

#### 6.1.1. Middleware Autoryzacyjne
1. **authUserMiddleware**
   - **Plik**: `src/middleware/authUserMiddleware.ts`
   - **Cel**: Podstawowa weryfikacja JWT dla wszystkich użytkowników
   - **Działanie**:
     - Wyodrębnia token z nagłówka Authorization
     - Weryfikuje token używając JWT_SECRET_KEY
     - Dodaje zdekodowane dane użytkownika do obiektu request
   - **Obsługa błędów**:
     - 401: Brak tokenu
     - 403: Nieprawidłowy token

2. **authVendorMiddleware**
   - **Plik**: `src/middleware/authVendorMiddleware.ts`
   - **Cel**: Weryfikacja dostępu dla usługodawców
   - **Działanie**:
     - Rozszerza authUserMiddleware
     - Dodatkowo sprawdza czy userType === 'vendor'
   - **Obsługa błędów**:
     - 403: Brak uprawnień usługodawcy

3. **authCoupleMiddleware**
   - **Plik**: `src/middleware/authCoupleMiddleware.ts`
   - **Cel**: Weryfikacja dostępu dla par młodych
   - **Działanie**:
     - Rozszerza authUserMiddleware
     - Dodatkowo sprawdza czy userType === 'couple'
   - **Obsługa błędów**:
     - 403: Brak uprawnień pary młodej

#### 6.1.2. Middleware Bezpieczeństwa
1. **securityMiddleware**
   - **Plik**: `src/middleware/security.ts`
   - **Komponenty**:
     - **helmet()**: Zabezpieczenie nagłówków HTTP
     - **csurf**: Ochrona przed CSRF
   - **Konfiguracja**:
     ```typescript
     [
       helmet(),
       csurf({ cookie: true })
     ]
     ```

2. **loginRateLimiter**
   - **Cel**: Ochrona przed atakami brute-force
   - **Konfiguracja**:
     - Okno czasowe: 15 minut
     - Limit: 75 prób na IP
   - **Komunikat**: "Zbyt wiele prób logowania. Spróbuj ponownie później."

#### 6.1.3. Middleware CORS
1. **corsMiddleware**
   - **Plik**: `src/middleware/cors.ts`
   - **Cel**: Konfiguracja Cross-Origin Resource Sharing
   - **Konfiguracja**:
     ```typescript
     {
       origin: 'http://localhost:3000',
       methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
       allowedHeaders: 'Content-Type, Authorization'
     }
     ```

#### 6.1.4. Middleware Upload
1. **uploadMiddleware**
   - **Plik**: `src/middleware/uploadMiddleware.ts`
   - **Cel**: Obsługa uploadu plików
   - **Typ**: Single file upload
   - **Storage**: Memory storage

2. **multerUpload**
   - **Plik**: `src/middleware/upload.ts`
   - **Cel**: Konfiguracja zapisywania plików na dysku
   - **Storage**: Disk storage
   - **Ścieżka**: `uploads/images`
   - **Nazwa pliku**: Zachowuje oryginalną nazwę

### 6.2. Zastosowanie Middleware

#### 6.2.1. Kolejność Aplikacji Middleware
```typescript
// Kolejność w app.ts
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(publicPath));
app.use(corsMiddleware);
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
```

#### 6.2.2. Middleware w Routach
- **Chronione endpointy**: Wykorzystują odpowiednie middleware autoryzacyjne
- **Upload endpointy**: Wykorzystują middleware do obsługi plików
- **Wszystkie endpointy**: Przechodzą przez middleware bezpieczeństwa

#### 6.2.3. Przepływ Żądania
```ascii
Request -> CORS -> Security -> Auth -> Route Handler -> Response
```

### 6.3. Obsługa Błędów

#### 6.3.1. Typy Błędów
- **Autoryzacyjne** (401, 403)
- **Walidacyjne** (400)
- **Limitujące** (429)
- **Serwerowe** (500)

#### 6.3.2. Format Odpowiedzi Błędów
```typescript
{
  message: string,
  error?: any,
  stack?: string // tylko w środowisku development
}
```

---

## 7. Frontend – Opis Komponentów

### 7.1. Komponenty Interfejsu Użytkownika

#### 7.1.1. Podstawowe Komponenty
1. **Button1**, **Button2**, **Button3**
   - Warianty podstawowych przycisków
   - Różne style i przeznaczenia
   - Przyjmują props: `label`, `onClick`

2. **MiniButton2**, **MiniButton3**
   - Mniejsze warianty przycisków
   - Do akcji pomocniczych w interfejsie
   - Spójny wygląd z głównymi przyciskami

3. **Input1**, **Input2**
   - Komponenty pól tekstowych
   - Walidacja i obsługa błędów
   - Props: `placeholder`, `value`, `onChange`, `isValid`, `errorMessage`

4. **Textarea**
   - Wielowierszowe pole tekstowe
   - Automatyczne dostosowywanie wysokości
   - Obsługa tabulacji i formatowania

5. **Checkbox**, **Checkbox2**
   - Komponenty pól wyboru
   - Własny styl zaznaczenia
   - Animowane przejścia stanów

#### 7.1.2. Komponenty Nawigacji

1. **Dropdown1**, **Dropdown2**, **Dropdown3**, **Dropdown4**, **Dropdown5**
   - Lista rozwijana z różnymi wariantami stylistycznymi
   - Obsługa kliknięć poza komponentem
   - Animowane rozwijanie/zwijanie
   - Różne typy danych wejściowych

2. **CoupleSidebarMenu**
   - Menu boczne dla pary młodej
   - Nawigacja między sekcjami panelu
   - Składane/rozkładane menu
   - Ikony i etykiety dla opcji

3. **VendorSidebarMenu**
   - Menu boczne dla usługodawcy
   - Zarządzanie ofertami i komunikacją
   - Składane/rozkładane menu
   - Wskaźnik aktywnej sekcji

4. **AdminSidebarMenu**
   - Menu boczne dla administratora
   - Zarządzanie systemem
   - Dostęp do statystyk i ustawień
   - Spójne z pozostałymi menu

#### 7.1.3. Komponenty Powiadomień

1. **NotificationBell**
   - Ikona dzwonka z licznikiem
   - Animowane powiadomienia
   - Interaktywne wskaźniki

2. **NotificationModal**
   - Modal z listą powiadomień
   - Oznaczanie jako przeczytane
   - Grupowanie według typu

#### 7.1.4. Komponenty Formularzy

1. **CustomDatePicker**
   - Wybór daty z kalendarzem
   - Własny styl zgodny z aplikacją
   - Walidacja dat

2. **PriceFilter**
   - Wybór zakresu cenowego
   - Walidacja wartości
   - Natychmiastowa aktualizacja

3. **CustomSlider**
   - Suwak do wyboru wartości
   - Własny styl i animacje
   - Obsługa zakresu wartości

#### 7.1.5. Komponenty Listy Gości

1. **GuestRow**
   - Wiersz z danymi gościa
   - Edycja statusu i grupy
   - Menu kontekstowe

2. **GuestListHeader**
   - Nagłówek listy gości
   - Opcje sortowania
   - Przyciski akcji

3. **GroupDropdown**
   - Zarządzanie grupami gości
   - Dodawanie/usuwanie grup
   - Przypisywanie gości

#### 7.1.6. Komponenty Planu Stołów

1. **TableRow**
   - Reprezentacja stołu
   - Lista przypisanych gości
   - Edycja ustawień stołu

2. **EditTableModal**
   - Modal edycji stołu
   - Zmiana nazwy i kształtu
   - Zarządzanie miejscami

3. **AddTableModal**
   - Dodawanie nowego stołu
   - Wybór typu i wielkości
   - Walidacja danych

#### 7.1.7. Komponenty Komunikacji

1. **MessageComponent**
   - Główny komponent czatu
   - Lista konwersacji
   - Obsługa wiadomości

2. **MessageItem**
   - Pojedyncza wiadomość
   - Informacje o nadawcy
   - Formatowanie czasu

3. **ContactForm**
   - Formularz kontaktowy
   - Walidacja pól
   - Wysyłanie wiadomości

#### 7.1.8. Komponenty Ofert

1. **OfferCard**
   - Karta oferty w liście
   - Podstawowe informacje
   - Akcje (ulubione, kontakt)

2. **VendorOfferCard**
   - Rozszerzona karta oferty
   - Dodatkowe informacje
   - Panel zarządzania

3. **ImageGallery**
   - Galeria zdjęć oferty
   - Lightbox ze slajdami
   - Miniatury i nawigacja

#### 7.1.9. Komponenty Statystyk

1. **StatsOverview**
   - Przegląd statystyk
   - Wizualizacja danych
   - Filtry czasowe

2. **ChartsSection**
   - Wykresy i diagramy
   - Interaktywne dane
   - Eksport danych

3. **ReportsList**
   - Lista raportów
   - Generowanie PDF
   - Filtrowanie wyników

---

### 7.2. Widoki (Pages)

#### 7.2.1. Panel Administratora

1. **AdminDashboard** (`pages/Admin/Dashboard.tsx`)
   - Główny komponent dashboardu administratora
   - Routing między podstronami
   - Komponenty:
     - AdminSidebarMenu
     - LoginTopMenu
     - Content Area

2. **AdminHomePage** (`pages/Admin/AdminHomePage.tsx`)
   - Strona główna panelu
   - Przegląd najważniejszych informacji
   - Szybki dostęp do kluczowych funkcji

3. **AdminAccountManagementPage** (`pages/Admin/AdminAccountManagementPage.tsx`)
   - Zarządzanie kontami użytkowników
   - Komponenty:
     - UsersHeader (wyszukiwanie)
     - UsersTable (lista użytkowników)
     - Pagination
   - Funkcjonalności:
     - Filtrowanie użytkowników
     - Zmiana statusów
     - Blokowanie/odblokowywanie kont

4. **AdminReportsPage** (`pages/Admin/AdminReportsPage.tsx`)
   - Strona raportów i statystyk
   - Komponenty:
     - StatsOverview
     - ReportsControls
     - ChartsSection
     - ReportsList
   - Funkcjonalności:
     - Generowanie raportów
     - Analiza statystyk
     - Eksport do PDF

5. **AdminNotificationsPage** (`pages/Admin/AdminNotificationsPage.tsx`)
   - Zarządzanie powiadomieniami systemowymi
   - Komponenty:
     - NotificationModal
     - NotificationsList
   - Funkcjonalności:
     - Wysyłanie powiadomień
     - Wybór odbiorców
     - Historia powiadomień

#### 7.2.2. Panel Pary Młodej

1. **CoupleDashboard** (`pages/Couple/Dashboard.tsx`)
   - Główny komponent dashboardu pary młodej
   - Routing między podstronami
   - Komponenty:
     - CoupleSidebarMenu
     - LoginTopMenu
     - Content Area

2. **HomePage** (`pages/Couple/HomePage.tsx`)
   - Strona główna z licznikiem
   - Przegląd postępów planowania
   - Najnowsze powiadomienia

3. **GuestListPage** (`pages/Couple/GuestListPage.tsx`)
   - Zarządzanie listą gości
   - Komponenty:
     - GuestListHeader
     - GuestListTable
     - SummaryBar
   - Funkcjonalności:
     - Import/export gości
     - Grupowanie gości
     - Status RSVP

4. **TablePlanPage** (`pages/Couple/TablePlanPage.tsx`)
   - Zarządzanie planem stołów
   - Komponenty:
     - ControlPanel
     - TableList
   - Funkcjonalności:
     - Dodawanie stołów
     - Przypisywanie gości
     - Eksport planu

5. **MessagesPage** (`pages/Couple/MessagesPage.tsx`)
   - Komunikacja z usługodawcami
   - Komponenty:
     - MessageComponent
   - Historia konwersacji

6. **FavoritesPage** (`pages/Couple/FavoritesPage.tsx`)
   - Lista ulubionych ofert
   - Komponenty:
     - OfferCard
   - Szybki dostęp do zapisanych ofert

#### 7.2.3. Panel Usługodawcy

1. **VendorDashboard** (`pages/Vendor/Dashboard.tsx`)
   - Główny komponent dashboardu usługodawcy
   - Routing między podstronami
   - Komponenty:
     - VendorSidebarMenu
     - LoginTopMenu
     - Content Area

2. **AddListingComponent** (`pages/Vendor/AddListingComponent.tsx`)
   - Dodawanie nowej oferty
   - Komponenty:
     - AddPhotoSection
     - AddVideoSection
     - AddTextSection
     - AddFiltersSection
     - AddLinksSection
     - AddLocationSection
     - AddAdditionalSection
   - Funkcjonalności:
     - Upload zdjęć i filmów
     - Edycja szczegółów
     - Ustawienia dostępności

3. **EditListing** (`pages/Vendor/EditListing.tsx`)
   - Edycja istniejącej oferty
   - Podobne komponenty jak w AddListing
   - Dodatkowe funkcje:
     - Aktualizacja galerii
     - Zmiana statusu oferty
     - Zarządzanie terminami

#### 7.2.4. Strony Publiczne

1. **LandingPage** (`pages/LandingPage.tsx`)
   - Strona główna aplikacji
   - Komponenty:
     - NoLoginTopMenu/LoginTopMenu
     - LeftSection
   - Przekierowanie do odpowiednich sekcji

2. **LoginPage** (`pages/LoginPage.tsx`)
   - Logowanie użytkowników
   - Opcje logowania:
     - Email/hasło
     - Google OAuth
   - Walidacja formularza

3. **OfferListPage** (`pages/OfferListPage.tsx`)
   - Lista ofert usługodawców
   - Komponenty:
     - FilterComponent
     - OfferCard
   - Funkcjonalności:
     - Filtrowanie ofert
     - Sortowanie
     - Wyszukiwanie

4. **ListingDetailPage** (`pages/ListingDetailPage.tsx`)
   - Szczegóły oferty
   - Komponenty:
     - ImageGallery
     - ListingDetailLeftSection
     - ContactInfoSection
     - ContactForm
     - MonthCalendarComponent
     - LocationMap
   - Funkcjonalności:
     - Galeria zdjęć
     - Informacje o ofercie
     - Formularz kontaktowy
     - Kalendarz dostępności
     - Mapa lokalizacji

5. **VerifyAccount** (`pages/VerifyAccount.tsx`)
   - Weryfikacja konta użytkownika
   - Obsługa linku aktywacyjnego
   - Potwierdzenie rejestracji

---

### 7.3. Routing i Autoryzacja

#### 7.3.1. Struktura Routingu

1. **Główne Routy** (`App.tsx`)
   ```typescript
   <Routes>
     <Route path="/" element={<LandingPage />} />
     <Route path="/login" element={<LoginPage />} />
     <Route path="/register/couple" element={<CoupleRegisterPage />} />
     <Route path="/register/company" element={<CompanyRegisterPage />} />
     <Route path="/offers" element={<OfferListPage />} />
     <Route path="/listing/:id" element={<ListingDetailPage />} />
     <Route path="/verify" element={<VerifyAccount />} />
   </Routes>
   ```

2. **Admin Dashboard Routes**
   ```typescript
   <Routes>
     <Route path="/" element={<Navigate to="home" />} />
     <Route path="home" element={<AdminReportsPage />} />
     <Route path="messages" element={<AdminMessagesPage />} />
     <Route path="account-management" element={<AdminAccountManagementPage />} />
     <Route path="notifications" element={<AdminNotificationsPage />} />
     <Route path="settings" element={<Settings />} />
   </Routes>
   ```

3. **Couple Dashboard Routes**
   ```typescript
   <Routes>
     <Route path="/" element={<Navigate to="home" />} />
     <Route path="home" element={<HomePage />} />
     <Route path="messages" element={<MessagesPage />} />
     <Route path="favorites" element={<FavoritesPage />} />
     <Route path="guest-list" element={<GuestListPage />} />
     <Route path="table-plan" element={<TablePlanPage />} />
     <Route path="settings" element={<Settings />} />
   </Routes>
   ```

4. **Vendor Dashboard Routes**
   ```typescript
   <Routes>
     <Route path="/" element={<Navigate to="home" />} />
     <Route path="home" element={<VendorHomePage />} />
     <Route path="messages" element={<MessagesPage />} />
     <Route path="offers" element={<VendorOffersPage />} />
     <Route path="calendar" element={<CalendarPage />} />
     <Route path="settings" element={<Settings />} />
   </Routes>
   ```

#### 7.3.2. Komponenty Autoryzacji

1. **PrivateRoute**
   - Komponent wyższego rzędu (HOC) do zabezpieczania tras
   - Sprawdzanie tokena i uprawnień użytkownika
   - Przekierowanie do logowania przy braku autoryzacji
   ```typescript
   interface PrivateRouteProps {
     children: JSX.Element;
     allowedRoles: string[];
   }
   ```

2. **AuthContext**
   - Globalny kontekst autoryzacji
   - Przechowywanie danych użytkownika
   - Metody logowania/wylogowania

3. **Middleware Autoryzacyjne**
   - Sprawdzanie tokena JWT
   - Weryfikacja uprawnień
   - Logowanie prób dostępu

#### 7.3.3. Zarządzanie Stanem Autoryzacji

1. **Redux Auth Slice**
   - Przechowywanie tokena
   - Stan zalogowanego użytkownika
   - Akcje autoryzacyjne

2. **Local Storage**
   - Persystencja tokena
   - Przechowywanie podstawowych danych
   - Automatyczne logowanie

3. **Obsługa Błędów**
   - Wygasanie sesji
   - Nieautoryzowany dostęp
   - Przekierowania bezpieczeństwa

---

## 8. Frontend – Zarządzanie Stanem

### 8.1. Struktura Redux Store

#### 8.1.1. Konfiguracja Store
Store Redux jest skonfigurowany w pliku `store.ts` i zawiera następujące slice'y:

```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,          // Autoryzacja i autentykacja
    user: userReducer,          // Dane użytkownika
    filters: filtersReducer,    // Filtry wyszukiwania
    reviews: reviewsReducer,    // Opinie i oceny
    activeComponent: activeComponentReducer,  // Stan aktywnych komponentów
    calendar: calendarReducer,  // Kalendarz i terminy
    guestList: guestListReducer, // Lista gości
    tablePlan: tablePlanReducer, // Plan stołów
    users: usersReducer,        // Zarządzanie użytkownikami
    messages: messagesReducer,  // Wiadomości i konwersacje
    notifications: notificationsReducer, // Powiadomienia użytkownika 
    adminNotifications: adminNotificationsReducer, // Powiadomienia administracyjne
    recipients: recipientsReducer, // Odbiorcy wiadomości
    adminStats: adminStatsReducer, // Statystyki administracyjne
    reports: reportsReducer     // Raporty systemowe
  }
});
```

#### 8.1.2. Główne Slice'y i ich Przeznaczenie

1. **Auth Slice** (`authSlice.ts`)
   - Zarządzanie stanem logowania
   - Przechowywanie tokena JWT
   - Obsługa rejestracji i wylogowania
   ```typescript
   interface UserState {
     user: User | null;
     token: string | null;
     loading: boolean;
     error: string | null;
   }
   ```

2. **User Slice** (`userSlice.ts`)
   - Dane profilu użytkownika
   - Ustawienia użytkownika
   - Preferencje powiadomień
   ```typescript
   interface UserState {
     user: {
       id: number;
       userType: 'vendor' | 'couple' | 'admin';
       email: string;
       phoneNumber: string;
       status: string;
       notificationSettings: NotificationSetting[];
       vendorProfile?: VendorProfile;
       coupleProfile?: CoupleProfile;
     } | null;
     token: string | null;
   }
   ```

3. **GuestList Slice** (`guestListSlice.ts`)
   - Zarządzanie listą gości weselnych
   - Grupowanie gości
   - Sortowanie i filtrowanie
   ```typescript
   interface GuestState {
     guests: Guest[];
     groups: Group[];
     searchTerm: string;
     selectedGuest: Guest | null;
     isModalOpen: boolean;
     sortOrder: { column: string; direction: 'asc' | 'desc' } | null;
     loading: boolean;
     error: string | null;
   }
   ```

4. **TablePlan Slice** (`tablePlanSlice.ts`)
   - Zarządzanie planem stołów
   - Przypisania gości do stołów
   - Stan rozmieszczenia
   ```typescript
   interface TablePlanState {
     tables: Table[];
     unassignedGuests: Guest[];
     loading: boolean;
     error: string | null;
     sortColumn: string | null;
     sortOrder: 'asc' | 'desc' | null;
   }
   ```

### 8.2. Przepływ Danych

#### 8.2.1. Komunikacja z API

1. **Async Thunks**
   - Obsługa asynchronicznych operacji
   - Komunikacja z backendem
   - Przykład fetchGuests:
   ```typescript
   export const fetchGuests = createAsyncThunk(
     'guests/fetchGuests',
     async (coupleId: number, { rejectWithValue }) => {
       try {
         const response = await axios.get(`/api/guests/${coupleId}`);
         return response.data.guestList;
       } catch (error) {
         return rejectWithValue('Nie udało się pobrać listy gości.');
       }
     }
   );
   ```

2. **Obsługa Stanu Ładowania**
   ```typescript
   extraReducers: (builder) => {
     builder
       .addCase(fetchGuests.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(fetchGuests.fulfilled, (state, action) => {
         state.guests = action.payload;
         state.loading = false;
       })
       .addCase(fetchGuests.rejected, (state, action) => {
         state.error = action.payload;
         state.loading = false;
       });
   }
   ```

#### 8.2.2. Przepływ w Komponentach

1. **Pobieranie Danych**
   ```typescript
   const Component = () => {
     const dispatch = useDispatch();
     const data = useSelector((state: RootState) => state.slice.data);

     useEffect(() => {
       dispatch(fetchData());
     }, [dispatch]);
   }
   ```

2. **Aktualizacja Danych**
   ```typescript
   const handleUpdate = () => {
     dispatch(updateData(newData))
       .unwrap()
       .then(() => {
         // Obsługa sukcesu
       })
       .catch((error) => {
         // Obsługa błędu
       });
   };
   ```

### 8.3. Przykłady Akcji i Selektorów

#### 8.3.1. Akcje Synchroniczne

1. **Sortowanie Gości**
   ```typescript
   export const sortGuests = createAction<{
     column: 'name' | 'status' | 'group';
     direction: 'asc' | 'desc';
   }>('guests/sortGuests');
   ```

2. **Filtrowanie Powiadomień**
   ```typescript
   export const setNotificationFilter = createAction<{
     type: string;
     value: string;
   }>('notifications/setFilter');
   ```

#### 8.3.2. Selektory

1. **Filtrowanie Gości**
   ```typescript
   export const selectFilteredGuests = createSelector(
     [(state: RootState) => state.guestList.guests, 
      (state: RootState) => state.guestList.searchTerm],
     (guests, searchTerm) => {
       if (!searchTerm) return guests;
       return guests.filter((guest) =>
         guest.name.toLowerCase().includes(searchTerm.toLowerCase())
       );
     }
   );
   ```

2. **Statystyki Gości**
   ```typescript
   export const selectGuestStats = createSelector(
     [(state: RootState) => state.guestList.guests],
     (guests) => ({
       total: guests.length,
       confirmed: guests.filter(g => g.status === 'confirmed').length,
       pending: guests.filter(g => g.status === 'pending').length
     })
   );
   ```
   
### 8.4. Praktyczne Przypadki Użycia Redux

#### 8.4.1. Proces Logowania i Autoryzacji
```typescript
// 1. Komponent LoginPage wywołuje akcję logowania
dispatch(loginUser({ email, password }));

// 2. Auth Slice aktualizuje stan
state.user = action.payload.user;
state.token = action.payload.token;

// 3. User Slice otrzymuje dane użytkownika
dispatch(setUserDetails(userData));

// 4. Notifications Slice pobiera powiadomienia
dispatch(fetchNotifications(userId));
```

#### 8.4.2. Zarządzanie Listą Gości i Planem Stołów
```typescript
// 1. Inicjalizacja danych w GuestListPage
useEffect(() => {
  dispatch(fetchGuests(coupleId));
  dispatch(fetchGroups(coupleId));
}, [coupleId]);

// 2. Dodanie gościa i aktualizacja TablePlan
const addNewGuest = async () => {
  const guest = await dispatch(addGuest(guestData)).unwrap();
  dispatch(fetchUnassignedGuests(coupleId));
};

// 3. Przypisanie gościa do stołu
const assignGuestToTable = async () => {
  await dispatch(assignGuest({ tableId, guestId }));
  dispatch(fetchTables(coupleId));
};
```

#### 8.4.3. System Powiadomień Administracyjnych
```typescript
// 1. Pobranie listy odbiorców
dispatch(fetchUsers({ page: 1, limit: 100 }));
dispatch(fetchCategories());

// 2. Filtrowanie odbiorców
dispatch(setGroupFilters({
  userType: 'vendor',
  categoryId: 5,
  status: 'active'
}));

// 3. Wysłanie powiadomienia
dispatch(sendNotification({
  title,
  message,
  recipientIds: selectedUserIds,
  notificationType: 'email'
}));
```

#### 8.4.4. Zarządzanie Opiniam i Ocenami
```typescript
// 1. Pobranie opinii dla oferty
useEffect(() => {
  const fetchReviews = async () => {
    const response = await axios.get(`/api/reviews/${listingId}`);
    dispatch(setReviews({
      reviews: response.data.reviews,
      listingId
    }));
  };
  fetchReviews();
}, [listingId]);

// 2. Dodanie nowej opinii
const handleAddReview = async (reviewData) => {
  try {
    const response = await axios.post('/api/reviews', reviewData);
    dispatch(addReview(response.data));
  } catch (error) {
    console.error('Błąd podczas dodawania opinii:', error);
  }
};
```

#### 8.4.5. Zarządzanie Komunikacją
```typescript
// 1. Inicjalizacja konwersacji
useEffect(() => {
  dispatch(fetchConversations(userId));
}, [userId]);

// 2. Wybór aktywnej konwersacji
const handleSelectConversation = (conversation) => {
  dispatch(setSelectedConversation(conversation));
  dispatch(fetchMessages(conversation.conversationId));
  dispatch(markAsRead({ 
    conversationId: conversation.conversationId, 
    userId 
  }));
};

// 3. Wysłanie wiadomości
const handleSendMessage = async (messageContent) => {
  await dispatch(sendMessage({
    conversationId,
    senderId: userId,
    receiverId: recipientId,
    messageContent
  }));
  dispatch(fetchMessages(conversationId));
};
```

#### 8.5.6. Filtrowanie i Sortowanie Ofert
```typescript
// 1. Ustawienie filtrów
dispatch(setSelectedCategory({ id: '1', name: 'Sale Weselne' }));
dispatch(setSelectedCity('Warszawa'));
dispatch(setSortOption('price_asc'));
dispatch(setFilterOption({
  filterCategoryId: 1,
  filterOptionId: 2,
  isSelected: true
}));

// 2. Aktualizacja widoku ofert
useEffect(() => {
  const filters = {
    category: selectedCategory,
    city: selectedCity,
    sortBy: sortOption,
    priceRange: selectedPriceRange,
    customFilters: selectedFilters
  };
  fetchFilteredOffers(filters);
}, [selectedCategory, selectedCity, sortOption, selectedFilters]);
```

#### 8.4.7. Zarządzanie Kalendarzem
```typescript
// 1. Inicjalizacja kalendarza
useEffect(() => {
  const fetchData = async () => {
    const response = await axios.get(`/api/calendar/${listingId}`);
    dispatch(setDatesStatusMap(response.data));
  };
  fetchData();
}, [listingId]);

// 2. Dodawanie terminów
const handleDateSelect = (date, status) => {
  dispatch(addDate({ date, availabilityStatus: status }));
  saveCalendarChanges({
    listingId,
    date,
    status
  });
};

// 3. Usuwanie terminów
const handleDateRemove = (date) => {
  dispatch(removeDate(date));
  deleteCalendarEntry({
    listingId,
    date
  });
};
```

---

## 9. System Powiadomień i Komunikacji

### 9.1. Powiadomienia

#### 9.1.1. Tworzenie Powiadomień
- **Automatyczne Powiadomienia**:
  - Generowane przez backend w odpowiedzi na określone zdarzenia, np. dodanie opinii, zmiana statusu konta.
  - Kluczowe funkcje:
    - `createAutomaticNotification` w `NotificationService` (backend).
    - Obsługuje typy powiadomień: `app` (aplikacyjne) i `email` (e-mail).
  - Przykład użycia:
    ```typescript
    await NotificationService.createAutomaticNotification({
      userId: vendorId,
      message: `Dodano nową opinię do ogłoszenia: "${vendorListing.title}"`,
      eventType: 'new_review',
      notificationType: 'app',
    });
    ```

- **Powiadomienia Administracyjne**:
  - Tworzone przez administratora w panelu admina.
  - Kluczowe funkcje:
    - `createAdminNotification` w `NotificationService`.
    - Obsługuje wybór grup odbiorców (np. wszyscy użytkownicy, usługodawcy, pary młode).
  - Przykład użycia:
    ```typescript
    await NotificationService.createAdminNotification({
      senderId: adminId,
      recipients: recipientIds,
      message: 'Nowe powiadomienie administracyjne',
      notificationType: 'email',
    });
    ```

#### 9.1.2. Wyświetlanie Powiadomień
- **Frontend**:
  - Komponenty:
    - `NotificationBell`: Ikona dzwonka z licznikiem nieprzeczytanych powiadomień.
    - `NotificationModal`: Modal z listą powiadomień.
  - Redux Slice: `adminNotificationsSlice` i `notificationsSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(fetchNotifications(userId));
    ```

- **Backend**:
  - Endpointy:
    - `GET /api/notifications/:userId`: Pobiera powiadomienia użytkownika.
    - `POST /api/notifications/mark-as-read`: Oznacza powiadomienie jako przeczytane.

### 9.2. Komunikacja

#### 9.2.1. System Wiadomości
- **Tworzenie Konwersacji**:
  - Backend: `conversationController.ts`.
  - Funkcja: `createOrUpdateConversation`.
  - Przykład użycia:
    ```typescript
    const conversation = await Conversation.findOrCreate({
      where: { user1Id: senderId, user2Id: receiverId },
    });
    ```

- **Wysyłanie Wiadomości**:
  - Backend: `conversationController.ts`.
  - Funkcja: `sendMessage`.
  - Przykład użycia:
    ```typescript
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      messageContent,
    });
    ```

- **Frontend**:
  - Komponenty:
    - `MessageComponent`: Główny komponent czatu.
    - `MessageItem`: Pojedyncza wiadomość.
  - Redux Slice: `messagesSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(fetchMessages(conversationId));
    ```

---

## 10. System Kalendarza i Bookowania

### 10.1. Zarządzanie Kalendarzem
- **Backend**:
  - Endpoint: `POST /api/calendar/modify`.
  - Funkcja: `modifyCalendarInDatabase` w `seedWideofilmowanieOffer.ts`.
  - Przykład użycia:
    ```typescript
    await axios.post('/api/calendar/modify', bookingData);
    ```

- **Frontend**:
  - Komponenty:
    - `MonthCalendarComponent`: Wyświetla dostępność terminów.
  - Redux Slice: `calendarSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(addDate({ date, availabilityStatus: 'booked' }));
    ```

### 10.2. Generowanie Bookowań
- **Backend**:
  - Funkcja: `generateBookingData` w `seedWideofilmowanieOffer.ts`.
  - Przykład użycia:
    ```typescript
    const bookings = generateBookingData(listingId);
    ```

---

## 11. System Recenzji

### 11.1. Dodawanie Recenzji
- **Backend**:
  - Endpoint: `POST /api/reviews/add`.
  - Funkcja: `addReviewToDatabase` w `seedWideofilmowanieOffer.ts`.
  - Przykład użycia:
    ```typescript
    await axios.post('/api/reviews/add', reviewData);
    ```

- **Frontend**:
  - Komponenty:
    - `AddReviewForm`: Formularz dodawania opinii.
  - Redux Slice: `reviewsSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(addReview(reviewData));
    ```

### 11.2. Wyświetlanie Recenzji
- **Frontend**:
  - Komponenty:
    - `ReviewList`: Lista recenzji.
    - `ReviewSummary`: Średnia ocen.
  - Redux Slice: `reviewsSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(fetchReviews(listingId));
    ```

---

## 12. System Raportów i Statystyk

### 12.1. Generowanie Raportów
- **Backend**:
  - Endpoint: `POST /api/reports/generated-reports`.
  - Funkcja: `generateReport` w `reportController.ts`.
  - Przykład użycia:
    ```typescript
    const report = await GeneratedReport.create({ reportName, reportType, reportData });
    ```

- **Frontend**:
  - Komponenty:
    - `ReportsControls`: Generowanie raportów.
  - Redux Slice: `reportsSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(generateReport({ reportType: 'monthly' }));
    ```

### 12.2. Wyświetlanie Statystyk
- **Frontend**:
  - Komponenty:
    - `StatsOverview`: Przegląd statystyk.
    - `ChartsSection`: Wykresy.
  - Redux Slice: `adminStatsSlice`.
  - Przykład akcji:
    ```typescript
    dispatch(fetchSystemStats());
    ```

---

## 13. Uprawnienia i Autoryzacja

### 13.1. Role Użytkowników
- **Typy Ról**:
  - `admin`: Zarządzanie systemem.
  - `vendor`: Zarządzanie ofertami.
  - `couple`: Zarządzanie gośćmi i planem stołów.

### 13.2. Middleware Autoryzacyjne
- **authUserMiddleware**:
  - Weryfikuje token JWT.
  - Dodaje dane użytkownika do obiektu request.

- **authVendorMiddleware**:
  - Sprawdza, czy użytkownik jest usługodawcą.

- **authCoupleMiddleware**:
  - Sprawdza, czy użytkownik jest parą młodą.

### 13.3. Przykłady Użycia Middleware
- **Przykład**:
  ```typescript
  router.put('/update', authUserMiddleware, updateUser);
  ```

### 13.4. Obsługa Błędów Autoryzacji
- **Przykłady Kodów Odpowiedzi**:
  - `401`: Brak tokenu.
  - `403`: Brak uprawnień.