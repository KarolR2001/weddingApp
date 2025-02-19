import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch  } from 'react-redux';
import { setActiveComponent } from '../../redux/slices/activeComponentSlice';
import { RootState } from '../../redux/store';
import styles from '../../styles/Vendor/AddListing.module.css';
import filtersStyles from '../../styles/FilterModal.module.css';
import Dropdown from '../../components/Dropdown4';
import Button1 from '../../components/Button1';
import Button2 from '../../components/Button2';
import MiniButton from '../../components/MiniButton3';
import Input from '../../components/forms/Input2';
import TextArea from '../../components/Textarea';
import Checkbox from '../../components/Checkbox';
import CheckboxFilter from '../../components/CheckboxFilter';
import DropdownFilter from '../../components/DropdownFilter';
import PriceFilter from '../../components/PriceFilter';
import Slider from '../../components/CustomSlider';
import { ReactComponent as CameraIcon } from '../../assets/camera-photo.svg';
import { ReactComponent as VideoIcon } from '../../assets/video-icon.svg';
import { ReactComponent as TextIcon } from '../../assets/text-cursor.svg';
import { ReactComponent as FilterIcon } from '../../assets/filter.svg';
import { ReactComponent as LinkIcon } from '../../assets/link.svg';
import { ReactComponent as LocationIcon } from '../../assets/locate-fixed.svg';
import { ReactComponent as InfoIcon } from '../../assets/info.svg';
import Spinner from '../../components/Spinner';
import { ReactComponent as SuccessIcon } from '../../assets/Success.svg';

interface Media {
    mediaId: number;
    mediaType: string;
    mediaUrl: string;
  }
  

  
  interface ListingFilter {
    filterOption: FilterOption;
  }

interface Listing {
    listingId: number;
    title: string;
    city: string;
    categoryId: number;
    rangeInKm: number;
    longDescription: string;
    shortDescription: string;
    offersNationwideService: boolean;
    priceMin: string;
    priceMax: string;
    contactPhone: string;
    websiteUrl?: string;
    email: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    spotifyUrl?: string;
    soundcloudUrl?: string;
    pinterestUrl?: string;
    media: Media[];
    listingFilters: ListingFilter[];

  }
interface FilterOption {
    filterOptionId: number;
    optionName: string;
  }

const SERVER_URL = 'http://localhost:5000';

const EditListing: React.FC = () => {
    const [images, setImages] = useState<string[]>([]); // Kopia listy zdjęć
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
    const [errorImage, setErrorImage] = useState<string | null>(null);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [videos, setVideos] = useState<Array<{ fullUrl: string; thumbnailUrl: string }>>([]);
    const [videoInput, setVideoInput] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null);
    const [titleOffer, setTitleOffer] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [titleErrorMessage, setTitleErrorMessage] = useState('');
    const [isShortDescriptionValid, setIsShortDescriptionValid] = useState(true);
    const [isLongDescriptionValid, setIsLongDescriptionValid] = useState(true);
    const [filters, setFilters] = useState<any[]>([]);
    const [localFilters, setLocalFilters] = useState<{ [key: string]: any }>({});
    const [priceMin, setPriceMin] = useState<string | null>(null);
    const [priceMax, setPriceMax] = useState<string | null>(null);
    const [maxDistance, setMaxDistance] = useState<number>(0);
    const [linkPageWWW, setLinkPageWWW] = useState('');
    const [linkFacebook, setLinkFacebook] = useState('');
    const [linkYouTube, setLinkYouTube] = useState('');
    const [linkInstagram, setLinkInstagram] = useState('');
    const [linkTikTok, setLinkTikTok] = useState('');
    const [linkSpotify, setLinkSpotify] = useState('');
    const [linkSoundCloud, setLinkSoundCloud] = useState('');
    const [linkPinterest, setLinkPinterest] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [isCheckedLocation, setIsCheckedLocation] = useState(false);
    const [isCityValid, setIsCityValid] = useState(true);
    const [cityErrorMessage, setCityErrorMessage] = useState('');
    const [isDistanceValid, setIsDistanceValid] = useState(true);
    const [distanceErrorMessage, setDistanceErrorMessage] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(true);
    const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
    const [videosToRemove, setVideosToRemove] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const dispatch = useDispatch();

  const selectedListingId = useSelector(
    (state: RootState) => state.activeComponent.selectedListingId
  );
  const token = useSelector((state: RootState) => state.auth.token);

  // Pobranie danych ogłoszenia i kategorii
  useEffect(() => {
    
    const fetchListingData = async () => {
        setIsLoading(true);
      try {
        console.log('Fetching listing data...');
  
        // Pobranie kategorii
        const categoriesResponse = await axios.get(`${SERVER_URL}/api/categories/names`);
        const categoryData = categoriesResponse.data.map((category: any) => ({
          id: category.category_id,
          name: category.categoryName,
        }));
        setCategories(categoryData);
  
        if (selectedListingId) {
          // Pobranie szczegółów ogłoszenia
          const listingResponse = await axios.get(
            `${SERVER_URL}/api/listings/listing/${selectedListingId}`
          );
          const listingData = listingResponse.data;
  
          // Ustawienie istniejących zdjęć
          const existingMedia = listingData.media
            .filter((mediaItem: any) => mediaItem.mediaType === 'image')
            .map((mediaItem: any) => `${SERVER_URL}${mediaItem.mediaUrl}`);
          setImages(existingMedia);
  
          // Ustawienie wideo
          const existingVideos = listingData.media
            .filter((mediaItem: { mediaType: string }) => mediaItem.mediaType === 'video')
            .map((video: { mediaUrl: string }) => {
              const match = video.mediaUrl.match(
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)?([^"&?/\s]{11})/
              );
              if (match && match[1]) {
                const videoId = match[1];
                return {
                  fullUrl: `https://youtu.be/${videoId}`,
                  thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                };
              } else {
                console.error('Nieprawidłowy identyfikator wideo:', video.mediaUrl);
                return null;
              }
            })
            .filter(Boolean); // Usuwa wartości null
          setVideos(existingVideos);
  
          // Dopasowanie kategorii
          const matchingCategory = categoryData.find(
            (category: { id: string; name: string }) =>
              parseInt(category.id, 10) === listingData.categoryId
          );
          if (matchingCategory) {
            setSelectedCategoryName(matchingCategory.name);
            setSelectedCategoryId(matchingCategory.id);
  
            // Pobranie filtrów dla wybranej kategorii
            const filtersResponse = await axios.get(
              `${SERVER_URL}/api/filters/${matchingCategory.id}`
            );
            const filtersData = filtersResponse.data;
            setFilters(filtersData);
  
            // Ustawienie lokalnych filtrów
            const newFilters: { [key: string]: any } = {};
            listingData.listingFilters.forEach((listingFilter: any) => {
              const optionId = listingFilter.filterOption.filterOptionId.toString();
              const category = filtersData.find((filterCategory: any) =>
                filterCategory.filterOptions.some(
                  (option: FilterOption) => option.filterOptionId.toString() === optionId
                )
              );
              if (category) {
                const filterCategoryId = category.filterCategoryId;
                if (category.displayType === 'checkbox') {
                  if (!newFilters[filterCategoryId]) {
                    newFilters[filterCategoryId] = {};
                  }
                  newFilters[filterCategoryId][optionId] = true;
                } else if (category.displayType === 'dropdown') {
                  newFilters[filterCategoryId] = optionId; // Ustaw tylko wartość dla dropdownu
                }
              }
            });
  
            setLocalFilters(newFilters);
          }
  
          // Ustawienie wartości cen
          setPriceMin(listingData.priceMin || '');
          setPriceMax(listingData.priceMax || '');
  
          // Przypisanie reszty danych
          setTitleOffer(listingData.title || '');
          setShortDescription(listingData.shortDescription || '');
          setLongDescription(listingData.longDescription || '');
          setMaxDistance(listingData.rangeInKm || 0);
            setLinkPageWWW(listingData.websiteUrl || '');
            setLinkFacebook(listingData.facebookUrl || '');
            setLinkYouTube(listingData.youtubeUrl || '');
            setLinkInstagram(listingData.instagramUrl || '');
            setLinkTikTok(listingData.tiktokUrl || '');
            setLinkSpotify(listingData.spotifyUrl || '');
            setLinkSoundCloud(listingData.soundcloudUrl || '');
            setLinkPinterest(listingData.pinterestUrl || '');
            setPhone(listingData.contactPhone || '');
            setEmail(listingData.email || '');
            setCity(listingData.city || '');
            setIsCheckedLocation(listingData.offersNationwideService || false);
          
        }
      } catch (error) {
        console.error('Error fetching listing data:', error);
      } finally {
        setIsLoading(false); 
      }
    };
  
    fetchListingData();
  }, [selectedListingId]);
  

  // Dodawanie nowych zdjęć
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesArray = Array.from(e.target.files);
      const validFormats = ['image/png', 'image/jpg', 'image/jpeg'];
      const maxSize = 25 * 1024 * 1024; // 25 MB
  
      let validFiles: File[] = [];
  
      for (const file of newFilesArray) {
        if (!validFormats.includes(file.type)) {
          setErrorImage('Zdjęcie musi być w formacie PNG, JPG lub JPEG.');
          return;
        } else if (file.size > maxSize) {
          setErrorImage('Zdjęcie nie może być większe niż 25 MB.');
          return;
        }
        validFiles.push(file);
      }
  
      if (images.length + validFiles.length > 50) {
        setErrorImage('Możesz przesłać maksymalnie 50 zdjęć.');
        return;
      }
  
      // Dodanie plików do stanu newFiles
      setNewFiles((prevFiles) => [...prevFiles, ...validFiles]);
  
      // Dodanie ścieżek tymczasowych do galerii
      setImages((prevImages) => [
        ...prevImages,
        ...validFiles.map((file) => URL.createObjectURL(file)),
      ]);
  
      setErrorImage(null); // Clear error if successful
    }
  };

  // Usuwanie zdjęcia z listy
  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      const removedImage = updatedImages.splice(index, 1)[0];
      // Jeśli zdjęcie istnieje na serwerze, dodaj je do listy do usunięcia
      if (removedImage.startsWith(SERVER_URL)) {
        setImagesToRemove((prev) => [...prev, removedImage.replace(SERVER_URL, '')]);
      }
      return updatedImages;
    });
  };
  const uploadImages = async (): Promise<string[]> => {
    const formData = new FormData();
    newFiles.forEach((file) => {
      formData.append('images', file);
    });
  
    try {
      const response = await axios.post('http://localhost:5000/api/listings/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.imagePaths; 
    } catch (error) {
      console.error('Błąd podczas przesyłania zdjęć:', error);
      return [];
    }
  };
  // Zmiana kolejności zdjęć
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
    console.log(`Dragging image at index: ${index}`);
 };

 const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (index: number) => {
    if (draggedImageIndex === null) return;

    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(draggedImageIndex, 1);
    reorderedImages.splice(index, 0, draggedImage);

    setImages(reorderedImages);
    setDraggedImageIndex(null);

    console.log('Images after reordering:', reorderedImages);
 };
 const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoInput(e.target.value);
    };

    const handleAddVideo = (videoUrl?: string) => {
        if (videos.length >= 12) {
          setErrorMessage('Możesz dodać maksymalnie 12 filmów.');
          return;
        }
    
        const urlToUse = videoUrl || videoInput;
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = urlToUse.match(youtubeRegex);
    
        if (match && match[1]) {
          const videoId = match[1];
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
          setVideos((prevVideos) => [
            ...prevVideos,
            { fullUrl: urlToUse, thumbnailUrl },
          ]);
    
          if (!videoUrl) {
            setVideoInput('');
          }
          setErrorMessage('');
        } else {
          setErrorMessage('Niepoprawny link. Upewnij się, że link pochodzi z YouTube.');
        }
      };
      

      const handleRemoveVideo = (index: number) => {
        setVideos((prevVideos) => {
          const removedVideo = prevVideos[index];
          if (removedVideo.fullUrl.startsWith('https://youtu.be/')) {
            setVideosToRemove((prev) => [...prev, removedVideo.fullUrl]);
          }
          return prevVideos.filter((_, i) => i !== index);
        });
      };

 const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Sprawdzenie minimalnej długości (4 znaki)
    if (input.length > 0 && input.length < 4) {
      setTitleErrorMessage('Tytuł musi mieć więcej niż 4 znaki.');
      setIsTitleValid(false);
    } else if (input.length === 0) {
      setTitleErrorMessage('Tytuł nie może być pusty.');
      setIsTitleValid(false);
    } else {
      setTitleErrorMessage('');
      setIsTitleValid(true);
    }
  
    // Ustaw tytuł w stanie, bez ograniczeń znakowych
    setTitleOffer(input);
  };
    
    const handleShortDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setShortDescription(e.target.value);
        setIsShortDescriptionValid(e.target.value.trim() !== ''); // Sprawdzenie, czy pole nie jest puste
    };
    
    const handleLongDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLongDescription(e.target.value);
        setIsLongDescriptionValid(e.target.value.trim() !== ''); // Sprawdzenie, czy pole nie jest puste
    };

     const handleCategorySelect = async (option: string) => {
        const selectedCategory = categories.find((category) => category.name === option);
        if (selectedCategory) {
          setSelectedCategoryId(selectedCategory.id);
          setSelectedCategoryName(option);
          try {
            const response = await fetch(`http://localhost:5000/api/filters/${selectedCategory.id}`);
            const data = await response.json();
            setFilters(data);
          } catch (error) {
            console.error('Error fetching filters:', error);
          }
        }
      }; 

      const handleCategoryChange = async (option: string) => {
        const selectedCategory = categories.find((category) => category.name === option);
      
        if (selectedCategory) {
          // Aktualizacja wybranej kategorii
          setSelectedCategoryId(selectedCategory.id);
          setSelectedCategoryName(option);
      
          try {
            // Czyść istniejące filtry
            setLocalFilters({});
            setFilters([]);
      
            // Pobierz nowe filtry dla wybranej kategorii
            const response = await fetch(`http://localhost:5000/api/filters/${selectedCategory.id}`);
            const newFilters = await response.json();
      
            // Zaktualizuj stan filtrów
            setFilters(newFilters);
          } catch (error) {
            console.error("Error fetching filters for the selected category:", error);
          }
        }
      };
      

      const handleCheckboxChange = (filterCategoryId: number, optionId: number) => {
        setLocalFilters((prevFilters: any) => ({
          ...prevFilters,
          [filterCategoryId]: {
            ...prevFilters[filterCategoryId],
            [optionId]: !prevFilters[filterCategoryId]?.[optionId],
          },
        }));
      };
    
      const handleDropdownChange = (filterCategoryId: number, selectedOptionId: string) => {
        setLocalFilters((prevFilters: any) => ({
          ...prevFilters,
          [filterCategoryId]: selectedOptionId,
        }));
      };
    
      const handlePriceChange = (min: string, max: string) => {
        setPriceMin(min);
        setPriceMax(max);
      };
      const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
    
        // Sprawdzenie, czy wszystkie znaki są literami lub spacją
        const lettersOnly = /^[a-zA-Z\s]*$/;
        if (!lettersOnly.test(input)) {
          return; // Nie dodawaj znaku, jeśli nie jest literą ani spacją
        }
    
        // Ustawienie pierwszej litery na wielką, reszty na małe
        input = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    
        // Walidacja długości nazwy miasta
        if (input.length > 0 && input.length < 3) {
          setCityErrorMessage('Nazwa miasta musi mieć więcej niż 2 znaki.');
          setIsCityValid(false);
        } else {
          setCityErrorMessage('');
          setIsCityValid(true);
        }
    
        setCity(input);
    };

    const handleCheckboxLocationChange = () => {
        const newCheckedState = !isCheckedLocation;
        setIsCheckedLocation(newCheckedState);
        validateDistance(newCheckedState, maxDistance); 
    };

    const handleSliderChange = (value: number) => {
        setMaxDistance(value);
        validateDistance(isCheckedLocation, value);
    };
    const validateDistance = (isChecked: boolean, distance: number): boolean => {
        if (isChecked || distance > 0) {
          setDistanceErrorMessage('');
          return true;
        } else {
          setDistanceErrorMessage('Wybierz "Cała Polska" lub ustaw odległość na suwaku.');
          return false;
        }
    };
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const numbersOnly = /^[0-9]*$/;
      
        // Sprawdzenie, czy wszystkie znaki to cyfry i ograniczenie długości
        if (numbersOnly.test(input) && input.length <= 9) {
          setPhone(input);
          setPhoneErrorMessage('');
          setIsPhoneValid(true);
        } else {
          setPhoneErrorMessage('Numer telefonu może zawierać tylko cyfry i musi mieć dokładnie 9 znaków.');
          setIsPhoneValid(false);
        }
    };
      
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        setEmail(input);
      
        if (!emailPattern.test(input)) {
          setEmailErrorMessage('Wprowadź poprawny adres e-mail.');
          setIsEmailValid(false);
        } else {
          setEmailErrorMessage('');
          setIsEmailValid(true);
        }
    };
    const handleAnulujChange = () => {
        dispatch(setActiveComponent({ component: 'offers' }));
    };

    const validateForm = () => {
        let isValid = true;
      
        // Walidacja zdjęć
        if (images.length === 0) {
          setErrorImage('Dodaj co najmniej jedno zdjęcie przed przesłaniem.');
          isValid = false;
        } else {
          setErrorImage(null);
        }
      
        // Walidacja tytułu
        if (titleOffer.trim().length < 4) {
          setTitleErrorMessage('Tytuł musi mieć więcej niż 4 znaki.');
          setIsTitleValid(false);
          isValid = false;
        } else {
          setIsTitleValid(true);
          setTitleErrorMessage('');
        }
      
        // Walidacja opisu
        const shortDescValid = shortDescription.trim() !== '';
        const longDescValid = longDescription.trim() !== '';
        setIsShortDescriptionValid(shortDescValid);
        setIsLongDescriptionValid(longDescValid);
      
        if (!shortDescValid) {
          isValid = false;
        }
        if (!longDescValid) {
          isValid = false;
        }
      
        // Walidacja numeru telefonu
        if (phone.length !== 9 || !/^[0-9]+$/.test(phone)) {
          setPhoneErrorMessage('Numer telefonu musi mieć 9 cyfr.');
          setIsPhoneValid(false);
          isValid = false;
        } else {
          setPhoneErrorMessage('');
          setIsPhoneValid(true);
        }
      
        // Walidacja adresu e-mail
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          setEmailErrorMessage('Wprowadź poprawny adres e-mail.');
          setIsEmailValid(false);
          isValid = false;
        } else {
          setEmailErrorMessage('');
          setIsEmailValid(true);
        }
      
        // Walidacja miasta
        if (city.trim().length < 3) {
          setCityErrorMessage('Nazwa miasta musi mieć więcej niż 2 znaki.');
          setIsCityValid(false);
          isValid = false;
        } else {
          setCityErrorMessage('');
          setIsCityValid(true);
        }
      
        // Walidacja dystansu
        const distanceIsValid = validateDistance(isCheckedLocation, maxDistance);
        setIsDistanceValid(distanceIsValid);
        if (!distanceIsValid) {
          isValid = false;
        }
      
        return isValid;
      };
  // Zapisanie zmian na serwerze
  const handleSaveChanges = async () => {
    const isFormValid = validateForm();
  
    if (!isFormValid) {
      console.error('Formularz zawiera błędy. Popraw je przed zapisem.');
      return;
    }
    setIsLoading(true); // Rozpoczęcie procesu zapisu
    setIsSuccess(false); // Resetowanie statusu sukcesu   
    try {
      // Prześlij nowe zdjęcia do serwera
      const uploadedImagePaths = await uploadImages();
  
      // Przygotuj dane do wysłania
      const formData = {
        ...gatherFormData(),
        newMedia: [
          ...uploadedImagePaths.map((path) => ({ mediaType: 'image', mediaUrl: path })),
          ...videos
            .filter((video) => !video.fullUrl.startsWith('https://youtu.be/'))
            .map((video) => ({ mediaType: 'video', mediaUrl: video.fullUrl })),
        ],
        mediaToRemove: [...imagesToRemove, ...videosToRemove],
      };
  
      console.log('Dane do wysłania:', JSON.stringify(formData, null, 2));
  
      if (!token) {
        alert('Brak tokena autoryzacyjnego. Użytkownik musi być zalogowany.');
        return;
      }
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.put(`${SERVER_URL}/api/listings/update`, formData, config);
  
      if (response.status === 200) {
        setIsSuccess(true);
       
        
      } else {
        console.error('Nieoczekiwany status odpowiedzi:', response.status);
        alert('Wystąpił problem podczas zapisywania danych.');
      }
    } catch (error) {
      console.error('Błąd podczas zapisu danych:', error);
      alert('Wystąpił błąd podczas zapisywania danych.');
    }finally {
        setIsLoading(false); // Zakończenie procesu zapisu
      }
  };
  
  // Funkcja do zbierania danych
  const gatherFormData = () => {
    return {
      listingId: selectedListingId,
      categoryId: selectedCategoryId,
      title: titleOffer,
      shortDescription,
      longDescription,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      rangeInKm: maxDistance,
      offersNationwideService: isCheckedLocation,
      contactPhone: phone,
      email,
      city,
      websiteUrl: linkPageWWW,
      facebookUrl: linkFacebook,
      youtubeUrl: linkYouTube,
      instagramUrl: linkInstagram,
      tiktokUrl: linkTikTok,
      spotifyUrl: linkSpotify,
      soundcloudUrl: linkSoundCloud,
      pinterestUrl: linkPinterest,
      media: [
        ...images.map((image) => ({ mediaType: 'image', mediaUrl: image.replace(SERVER_URL, '') })),
        ...videos.map((video) => ({ mediaType: 'video', mediaUrl: video.fullUrl })), // Wszystkie filmy
      ],
      // Filtry pozostają bez zmian
      filters: Object.keys(localFilters).flatMap((categoryId) => {
        const filter = localFilters[categoryId];
        if (typeof filter === 'string') {
          return [filter];
        } else {
          return Object.keys(filter).filter((optionId) => filter[optionId]);
        }
      }),
    };
  };
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        dispatch(setActiveComponent({ component: "offers" })); // Przejście do komponentu "offers"
      }, 3000); // 3 sekundy
  
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch]);
  if (isLoading) {
    return (
      <div className={styles.successMessage}>
        <Spinner />
        <p>Ładowanie...</p>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className={styles.successMessage}>
        <SuccessIcon style={{ width: 200, height: 200 }} />
        <p>Ogłoszenie zostało zmodyfikowane pomyślnie!</p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.title}>Edytuj ogłoszenie</div>
      <div className={styles.dropdown}>
        <Dropdown
          placeholder="Wybierz kategorię"
          options={categories.map((category) => category.name)}
          onSelect={handleCategoryChange}
          value={selectedCategoryName}
        />
      </div>

      <div className={styles.addPhotoContainer}>
        <div className={styles.photoHeader}>
          <CameraIcon className={styles.icon} />
          <div className={styles.photoTitle}>Zdjęcia</div>
        </div>
        <div className={styles.photoInstructions}>
          Dodaj minimalnie 1, a maksymalnie 50 zdjęć.
        </div>
        <div className={styles.photoGallery}>
          {images.map((image, index) => (
            <div
              key={index}
              className={styles.photoWrapper}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <img src={image} alt={`Uploaded ${index}`} className={styles.photo} />
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveImage(index)}
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            Przeciągnij i upuść zdjęcie lub
            <input
              type="file"
              multiple
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleImageUpload}
              className={styles.fileInput}
              style={{ display: 'none' }}
            />
            <Button1 label="+ dodaj zdjęcie" onClick={() => {}} />
          </label>
          {errorImage && <p className={styles.errorMessage}>{errorImage}</p>}
        </div>
      </div>



      <div className={styles.addVideoContainer}>
        <div className={styles.videoHeader}>
          <VideoIcon className={styles.icon} />
          <div className={styles.videoTitle}>Filmy</div>
        </div>
        <div className={styles.videoInstructions}>
          Możesz dodać maksymalnie 12 filmów. Wklej linki z YouTube.
        </div>
        <div className={styles.videoGallery}>
          {videos.map((videoItem, index) => (
            <div key={index} className={styles.videoWrapper}>
              <img src={videoItem.thumbnailUrl} alt={`Video ${index}`} className={styles.videoThumbnail} />
              <button className={styles.removeButton} onClick={() => handleRemoveVideo(index)}>Usuń</button>
            </div>
          ))}
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.inputy}>
          <input
            type="text"
            value={videoInput}
            onChange={handleVideoInputChange}
            placeholder="Wklej link z YouTube"
            className={styles.videoInput}
          />
          <MiniButton label="Dodaj" onClick={() => handleAddVideo()} />
          </div>
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </div>
      </div>
      <div className={styles.addTextContainer}>
        <div className={styles.textHeader}>
          <TextIcon className={styles.icon} />
          <div className={styles.videoTitle}>Treść</div>
        </div>
        <div className={styles.inputContainer}>
            <Input
                placeholder="Wpisz tytuł ogłoszenia *"
                type="text"
                value={titleOffer}
                onChange={handleTitleChange}
                isValid={isTitleValid}
                errorMessage={titleErrorMessage}
            />
            <TextArea
                maxLength={200}
                placeholder="Wpisz krótki opis ogłoszenia. Będzie on wyświetlany na małych wizytówkach na głównej stronie. *"
                onChange={handleShortDescriptionChange}
                value={shortDescription}
                isValid={isShortDescriptionValid}
            />
            <TextArea
                placeholder="Zareklamuj, opisz swoje usługi! Podkreśl, co Cię wyróżnia i dlaczego warto wybrać właśnie Ciebie. *"
                onChange={handleLongDescriptionChange}
                value={longDescription}
                isValid={isLongDescriptionValid}
            />
        </div>
      </div>

      <div className={styles.addFiltersContainer}>
          <div className={styles.filtersHeader}>
            <FilterIcon className={styles.icon} />
            <div className={styles.videoTitle}>Filtry</div>
          </div>
          <div className={styles.filterContainer}>
            {filters.length > 0 ? (
              filters.map((filterCategory) => (
                <div key={filterCategory.filterCategoryId} className={filtersStyles.filter}>
                  {filterCategory.displayType === 'checkbox' && (
                    <CheckboxFilter
                      label={filterCategory.filterName}
                      options={filterCategory.filterOptions.map((option: FilterOption) => ({
                        id: option.filterOptionId.toString(),
                        name: option.optionName,
                        checked: localFilters[filterCategory.filterCategoryId]?.[option.filterOptionId] || false,
                      }))}
                      onOptionChange={(optionId) =>
                        handleCheckboxChange(filterCategory.filterCategoryId, parseInt(optionId))
                      }
                    />
                  )}
                  {filterCategory.displayType === 'dropdown' && (
                    <DropdownFilter
                      label={filterCategory.filterName}
                      options={filterCategory.filterOptions.map((option: FilterOption) => ({
                        id: option.filterOptionId.toString(),
                        name: option.optionName,
                      }))}
                      selectedOption={
                        filterCategory.filterOptions.find(
                          (option: FilterOption) =>
                            option.filterOptionId.toString() ===
                            localFilters[filterCategory.filterCategoryId]?.toString()
                        )?.optionName || 'Wybierz opcję'
                      }
                      onSelect={(selectedOptionId: string) =>
                        handleDropdownChange(filterCategory.filterCategoryId, selectedOptionId)
                      }
                    />
                  )}
                  {filterCategory.displayType === 'slider' && (
                    <PriceFilter
                      label={filterCategory.filterName}
                      minValue={priceMin || ''}
                      maxValue={priceMax || ''}
                      onMinChange={(minValue) => handlePriceChange(minValue, priceMax || '')}
                      onMaxChange={(maxValue) => handlePriceChange(priceMin || '', maxValue)}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className={styles.uploadLabel}>Wybierz kategorię, aby zobaczyć dostępne filtry.</p>
            )}
          </div>
        </div>

        <div className={styles.addLinkContainer}>
        <div className={styles.linkHeader}>
          <LinkIcon className={styles.icon} />
          <div className={styles.videoTitle}>Linki zewnętrzne</div>
        </div>
        <div className={styles.linkContent}>
          <div className={styles.linkRow}>
            <Input placeholder='Strona www' type='text' onChange={(e) =>    setLinkPageWWW(e.target.value)} value={linkPageWWW} />
            <Input placeholder='Facebook' type='text' onChange={(e) => setLinkFacebook(e.target.value)} value={linkFacebook} /></div>
          <div className={styles.linkRow}>
            <Input placeholder='Youtube' type='text' onChange={(e) => setLinkYouTube(e.target.value)} value={linkYouTube} />
            <Input placeholder='Instagram' type='text' onChange={(e) => setLinkInstagram(e.target.value)} value={linkInstagram} /></div>
          <div className={styles.linkRow}>
            <Input placeholder='TikTok' type='text' onChange={(e) => setLinkTikTok(e.target.value)} value={linkTikTok} />
            <Input placeholder='Spotify' type='text' onChange={(e) => setLinkSpotify(e.target.value)} value={linkSpotify} /></div>
          <div className={styles.linkRow}>
            <Input placeholder='SoundCloud' type='text' onChange={(e) => setLinkSoundCloud(e.target.value)} value={linkSoundCloud} />
            <Input placeholder='Pinterest' type='text' onChange={(e) => setLinkPinterest(e.target.value)} value={linkPinterest} /></div>
        </div>
      </div>

      <div className={styles.addLocationContainer}>
        <div className={styles.locationHeader}>
          <LocationIcon className={styles.icon} />
          <div className={styles.videoTitle}>Lokalizacja</div>
        </div>
        
            <div className={styles.linkRow}>
            <Input
              placeholder="Wpisz miasto"
              type="text"
              value={city}
              onChange={handleCityChange}
              isValid={isCityValid}
              errorMessage={cityErrorMessage}
            />
            <div className={styles.sliderContener}>
              <p className={styles.uploadLabel}>Wybierz maksymalny obszar wykonywanych usług</p>
              <Checkbox label='Cała Polska' checked={isCheckedLocation} onChange={handleCheckboxLocationChange}/>
              <Slider min={0} max={400} initialValue={0} onChange={handleSliderChange} disabled={isCheckedLocation}/>
              {!isDistanceValid && (
                <span className={styles.errorMessage}>{distanceErrorMessage}</span>
              )}
            </div>
          </div>
      </div>
      
      <div className={styles.addAdditionalInformation}>
        <div className={styles.additionalHeader}>
          <InfoIcon className={styles.icon} />
          <div className={styles.videoTitle}>Dodatkowe</div>
        </div>
        <div className={styles.linkRow}>        
        <Input
          placeholder="Numer telefonu"
          type="phone"
          value={phone}
          onChange={handlePhoneChange}
          isValid={isPhoneValid}
          errorMessage={phoneErrorMessage}
        />
          <Input
            placeholder="Email"
            type="e-mail"
            value={email}
            onChange={handleEmailChange}
            isValid={isEmailValid}
            errorMessage={emailErrorMessage}
          />
        </div>
      </div>

      <div className={styles.buttonSection}>
        <Button1 label="Anuluj" onClick={handleAnulujChange} />
        <Button2 label="Zapisz" onClick={handleSaveChanges} />
      </div>
    </div>
  );
};

export default EditListing;
