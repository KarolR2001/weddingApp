import React, { useState, useEffect, useRef  } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Review } from '../redux/slices/reviewsSlice';
import { setReviews } from '../redux/slices/reviewsSlice';
import NoLoginTopMenu from '../components/NoLoginTopMenu';
import LoginTopMenu from '../components/LoginTopMenu';
import ImageGallery from '../components/ImageGallery';
import ListingDetailLeftSection from '../components/ListingDetailLeftSection';
import ContactInfoSection from '../components/ContactInfoSection';
import ContactFormSection from '../components/ContactForm';
import styles from '../styles/ListingDetailPage.module.css';
import MonthCalendarComponent from '../components/MonthCalendarComponent';
import LocationMap from '../components/LocationMap';
import Spinner from '../components/Spinner'; 


const SERVER_URL = "http://localhost:5000";

interface Media {
  mediaId: number;
  mediaType: string;
  mediaUrl: string;
}

interface FilterOption {
  optionName: string;
  filterCategory: {
    filterName: string;
    displayType: string;
  };
}

interface ListingFilter {
  filterOption: FilterOption;
}
interface CalendarEntry {
  calendarId: number;
  date: string;
  availabilityStatus: 'booked' | 'reserved';
}
interface Listing {
  listingId: number;
  vendorId: number;
  title: string;
  city: string;
  longDescription: string;
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
  calendarEntries: CalendarEntry[];
  reviews: Review[];
}

const detectDeviceType = (): string => {
  return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
};

const sendActivityToBackend = async (listingId: number) => {
  const deviceType = detectDeviceType();
  const dayOfWeek = new Date().toLocaleDateString("pl-PL", { weekday: "long" });
  const hourOfDay = new Date().getHours().toString().padStart(2, "0");

  console.log("Dane do wysłania:", {
    listingId,
    deviceType,
    dayOfWeek,
    hourOfDay,
  });

  try {
    const response = await axios.post(`${SERVER_URL}/api/listings/stats`, {
      listingId,
      deviceType,
      dayOfWeek,
      hourOfDay,
    });
    console.log("Odpowiedź z backendu:", response.data);
  } catch (error) {
    console.error("Błąd podczas wysyłania danych statystyk:", error);
  }
};

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const dispatch = useDispatch();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); 
  const currentYear = currentDate.getFullYear();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (listing) {
      sendActivityToBackend(listing.listingId);
    }
  }, [listing]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let startTime = Date.now(); // Początkowy czas
  
    const sendTimeToBackend = () => {
      const elapsed = (Date.now() - startTime) / 1000; 
      const payload = {
        listingId: id,
        activeTime: parseFloat(elapsed.toFixed(3)), 
      };
    
      axios
        .post(`${SERVER_URL}/api/listings/activity`, payload)
        .then((response) => {
          console.log('Odpowiedź serwera:', response.data);
        })
        .catch((error) => {
          console.error('Błąd podczas wysyłania danych do backendu:', error.response?.data || error.message);
        });
    };
  
    if (!intervalId) {
      console.log('Uruchamiam timer do wysyłania danych co 10 sekund');
      intervalId = setInterval(() => {
        sendTimeToBackend();
      }, 10000); 
    }
  
    return () => {
      if (intervalId) {
        console.log('Zatrzymuję timer do wysyłania danych');
        clearInterval(intervalId); 
      }
    };
  }, [id]);
  


  
  
  useEffect(() => {
    
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/listings/listing/${id}`);
        setListing(response.data);
        
        dispatch(setReviews({ reviews: response.data.reviews, listingId: id || '' }));      } catch (error) {
        console.error('Błąd podczas pobierania szczegółów oferty:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [dispatch,id]);

  useEffect(() => {
    const fetchCitiesData = async () => {
      if (listing?.city) {
        try {
          const response = await fetch('/cities.json');
          const cities = await response.json();

          // Find coordinates for the specified city in listing
          const cityData = cities.find(
            (city: any) => city.placeName.toLowerCase() === listing.city.toLowerCase()
          );

          if (cityData) {
            setCityCoordinates({
              lat: parseFloat(cityData.latitude),
              lng: parseFloat(cityData.longitude),
            });
          } else {
            console.warn(`City ${listing.city} not found in cities.json`);
          }
        } catch (error) {
          console.error('Error fetching city coordinates:', error);
        }
      }
    };

    fetchCitiesData();
  }, [listing]);

  const videoUrls = listing?.media
    .filter((m) => m.mediaType === 'video')
    .map((m) => `https://www.youtube.com/embed/${m.mediaUrl}`) || [];

    if (loading) {
      return (
        <div className={styles.spinnerContainer}>
          <Spinner /> 
        </div>
      );
    }

  if (!listing) {
    return <p>Nie znaleziono oferty.</p>;
  }
  const datesStatusMap = new Map<string, 'booked' | 'reserved'>();

  listing.calendarEntries.forEach((entry) => {
    datesStatusMap.set(entry.date, entry.availabilityStatus);
  });

  return (
    <div className={styles.container}>
      {token && user ? <LoginTopMenu /> : <NoLoginTopMenu />}
      <ImageGallery media={listing.media} SERVER_URL={SERVER_URL} />

      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
           <ListingDetailLeftSection
           listingId={Number(id)}
            title={listing.title}
            city={listing.city}
            aboutText={listing.longDescription}
            priceMin={listing.priceMin}
            priceMax={listing.priceMax}
            videoUrls={videoUrls}
            filters={listing.listingFilters}
          /> 
        </div>

        <div className={styles.rightSection}>
           <ContactInfoSection
            phone={listing.contactPhone}
            email={listing.email}
            websiteUrl={listing.websiteUrl}
            socialMedia={{
              facebookUrl: listing.facebookUrl,
              instagramUrl: listing.instagramUrl,
              youtubeUrl: listing.youtubeUrl,
              tiktokUrl: listing.tiktokUrl,
              spotifyUrl: listing.spotifyUrl,
              soundcloudUrl: listing.soundcloudUrl,
              pinterestUrl: listing.pinterestUrl
            }}
          />
          <ContactFormSection vendorId={listing?.vendorId} recipientEmail={listing.email} listingId={listing.listingId}/>
          <MonthCalendarComponent month={currentMonth} year={currentYear} datesStatusMap={datesStatusMap} />
          {cityCoordinates ? (
            <LocationMap lat={cityCoordinates.lat} lng={cityCoordinates.lng} />
          ) : (
            <p>City coordinates not found.</p>
          )} 
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
