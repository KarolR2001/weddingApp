import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles/FilterComponent.module.css';
import Dropdown2 from './Dropdown2';
import FilterModal from './FilterModal';
import MiniDropdown from './MiniDropdown';
import MiniButton2 from './MiniButton2';
import { RootState } from '../redux/store';
import { setSelectedCategory, setSortOption, setSelectedTravelOption } from '../redux/slices/filtersSlice';
import { useRef } from 'react';

const debounce = (func: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  };
};

interface FilterComponentProps {
  onFilter: () => void; // Adding the onFilter prop to the component's props
}

const FilterComponent: React.FC<FilterComponentProps> = ({ onFilter }) => {
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<any[]>([]); 
  const dispatch = useDispatch();

  // Pobieranie wartości z Redux
  const selectedLocation = useSelector((state: RootState) => state.filters.selectedCity);
  const selectedCategory = useSelector((state: RootState) => state.filters.selectedCategory);
  const selectedCategoryId = useSelector((state: RootState) => state.filters.selectedCategoryId); 
  const selectedSortOption = useSelector((state: RootState) => state.filters.sortOption);
  const selectedTravelOption = useSelector((state: RootState) => state.filters.selectedTravelOption);
  const [descriptionText, setDescriptionText] = useState('');
  const debouncedOnFilter = useRef(debounce(onFilter, 300)).current;
  const handleDestinationSelect = (option: string) => {
    dispatch(setSelectedTravelOption(option));
    //onFilter();
  };

  const handleCategorySelect = (option: string) => {
    const selectedCategory = categories.find(category => category.name === option);
    if (selectedCategory) {
      dispatch(setSelectedCategory({ name: selectedCategory.name, id: selectedCategory.id }));
    }
  };

  const handleSortSelect = (option: string) => {
    dispatch(setSortOption(option));
  };

  useEffect(() => {
    if (selectedTravelOption === 'Pokaż oferty z dojazdem') {
      setDescriptionText(`Firmy z całej Polski działające na terenie ${selectedLocation} i okolic`);
    } else if (selectedTravelOption === 'Tylko najbliższa okolica') {
      setDescriptionText(`Firmy działające tylko z ${selectedLocation} i okolic`);
    }
  }, [selectedTravelOption, selectedLocation]);
  useEffect(() => {
    if (selectedTravelOption) {
      onFilter(); // Wywołaj onFilter dopiero po zmianie selectedTravelOption
    }
  }, [selectedTravelOption]);
  useEffect(() => {
    if (selectedSortOption) {
      onFilter(); // Wywołaj onFilter dopiero po zmianie selectedTravelOption
    }
  }, [selectedSortOption]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories/names');
        const data = await response.json();
        const categoryNames = data.map((category: { category_id: string, categoryName: string }) => ({
          id: category.category_id, 
          name: category.categoryName
        }));
        setCategories(categoryNames);
      } catch (error) {
        console.error('Błąd podczas pobierania kategorii:', error);
      }
    };
    fetchCategories();
  }, []);
  
  const handleFilterClick = async () => {
    if (!selectedCategoryId) {
      console.error('Nie wybrano kategorii!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/filters/${selectedCategoryId}`);
      const data = await response.json();
      setFilters(data); 
      setIsModalOpen(true);
    } catch (error) {
      console.error('Błąd podczas pobierania filtrów:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.dropdownWithLabel}>
        <Dropdown2
          label={selectedCategory || 'Wybierz kategorię'}
          options={categories.map(category => category.name)}
          onSelect={handleCategorySelect}
        />
        <div className={styles.categoryDescription}>
          {descriptionText || `Firmy z całej Polski działające na terenie ${selectedLocation} i okolic`}
        </div>
      </div>

      <MiniDropdown
        label={selectedTravelOption || 'Pokaż oferty z dojazdem'}
        options={['Pokaż oferty z dojazdem', 'Tylko najbliższa okolica']}
        onSelect={handleDestinationSelect}
      />

      <MiniButton2 label="Filtruj" onClick={handleFilterClick} /> 

      <MiniDropdown
        label={selectedSortOption || 'Sortuj'}
        options={['Domyślnie', 'Cena: Od najniższej', 'Cena: Od najwyższej', 'Najbliżej', 'Najdalej']}
        onSelect={handleSortSelect}
      />

      <FilterModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFilter={onFilter} // Passing the onFilter prop to FilterModal
        filters={filters} 
      />
    </div>
  );
};

export default FilterComponent;
