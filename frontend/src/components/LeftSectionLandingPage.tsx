import React, { useState, useEffect } from 'react';
import styles from '../styles/LeftSectionLandingPage.module.css';
import Dropdown1 from './Dropdown1';
import Input1 from './Input1';
import Button1 from './Button1';
import { useDispatch } from 'react-redux';
import { setSelectedCategory, setSelectedCity } from '../redux/slices/filtersSlice';
import { useNavigate } from 'react-router-dom';  // Importuj hook do nawigacji

const LeftSection: React.FC = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ placeName: string; adminName2: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);  // Przechowujemy nazwy kategorii i ich ID
  const dispatch = useDispatch();
  const navigate = useNavigate();  // Hook do nawigacji

  useEffect(() => {
    const fetchCities = async () => {
      const response = await fetch('/cities.json');
      const data = await response.json();
      setCities(data);
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories/names');
        const data = await response.json();
        console.log('Fetched Categories:', data);  // Sprawdź, czy struktura danych jest poprawna
        const categoryNames = data.map((category: { category_id: string, categoryName: string }) => ({
          id: category.category_id,  // Poprawione na category_id
          name: category.categoryName
        }));
        setCategories(categoryNames);
      } catch (error) {
        console.error('Błąd podczas pobierania kategorii:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLocationChange = (value: string) => {
    setInputValue(value);
    if (value.length > 0) {
      const filtered = cities
        .filter((city) => city.placeName.toLowerCase().startsWith(value.toLowerCase()))
        .map((city) => ({
          placeName: city.placeName,
          adminName2: city.adminName2,
        }));
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city: string) => {
    setInputValue(city);
    dispatch(setSelectedCity(city));
  };

  // Funkcja do obsługi wyboru kategorii i jej ID
  const handleCategorySelect = (option: string) => {
    const selectedCategory = categories.find(category => category.name === option);
    if (selectedCategory) {
      console.log('Selected Category:', selectedCategory);  // Upewnij się, że id nie jest undefined
      dispatch(setSelectedCategory({ name: selectedCategory.name, id: selectedCategory.id }));
    } else {
      console.error('Nie znaleziono kategorii dla opcji:', option);
    }
  };
  const handleSearchClick = () => {
    navigate('/list');  // Przekierowanie do strony listy
  };

  return (
    <div className={styles.container}>
      <div className={styles.textSection}>
        <div className={styles.subHeading}>MIŁOŚĆ TO PODRÓŻ</div>
        <div className={styles.description}>
          Znajdź najlepszych usługodawców, którzy zadbają o każdy szczegół, tworząc dzień pełen magii i niezapomnianych chwil
        </div>
        <div className={styles.heading}>Z nami stworzysz <br /> wspomnienia na zawsze.</div>
      </div>

      <div className={styles.inputGroup}>
        <Dropdown1
          label="Wybierz kategorię"
          options={categories.map(category => category.name)}
          onSelect={handleCategorySelect}  // Wywołujemy obsługę wyboru kategorii
        />

        <Input1
          placeholder="Wpisz lokalizację"
          value={inputValue}
          onChange={handleLocationChange}
          filteredCities={filteredCities}
          onCitySelect={handleCitySelect}
        />
      </div>

      <div className={styles.searchButtonWrapper}>
        <Button1 label="Szukaj" onClick={handleSearchClick} />
      </div>
    </div>
  );
};

export default LeftSection;
