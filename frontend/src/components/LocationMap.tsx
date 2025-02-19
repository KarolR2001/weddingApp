import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from '../styles/LocationMap.module.css';
import customPin from '../assets/map-pin-alt.svg'; // import ikony SVG

interface LocationMapProps {
  lat: number;
  lng: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng }) => {
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = {
    lat,
    lng,
  };

  // Funkcja onLoad, która uruchomi się po załadowaniu Markera
  const onLoad = (marker: google.maps.Marker) => {
    if (window.google) {
      marker.setIcon({
        url: customPin,
        scaledSize: new window.google.maps.Size(40, 40), // Skalowanie ikony, dostosuj w razie potrzeby
      });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lokalizacja</h2>
      <LoadScript googleMapsApiKey="AIzaSyCkJmUY0NNLzRiEaopmKm5yk2wRkBIm0fg">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={11}>
          <Marker position={center} onLoad={onLoad} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default LocationMap;
