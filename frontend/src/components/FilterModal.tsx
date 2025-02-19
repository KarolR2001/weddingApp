import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import styles from '../styles/FilterModal.module.css';
import Button1 from './Button1';
import Button2 from './Button2';
import CheckboxFilter from './CheckboxFilter';
import DropdownFilter from './DropdownFilter';
import PriceFilter from './PriceFilter';
import { setFilterOption, setDropdownFilter, setPriceRange, clearFilters } from '../redux/slices/filtersSlice'; // Import clearFilters

interface FilterOption {
  filterOptionId: number;
  optionName: string;
}

interface FilterCategory {
  filterCategoryId: number;
  filterName: string;
  displayType: 'checkbox' | 'dropdown' | 'slider';
  filterOptions: FilterOption[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: () => void; // Callback to notify when filters are applied
  filters: FilterCategory[];
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onFilter, filters }) => {
  const selectedFilters = useSelector((state: RootState) => state.filters.selectedFilters);
  const selectedCategoryId = useSelector((state: RootState) => state.filters.selectedCategoryId);
  const dispatch = useDispatch();

  const [localFilters, setLocalFilters] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(selectedFilters);
    }
  }, [isOpen, selectedFilters]);

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

  const handlePriceChange = (filterCategoryId: number, minValue: string, maxValue: string) => {
    setLocalFilters((prevFilters: any) => ({
      ...prevFilters,
      [filterCategoryId]: { minValue, maxValue },
    }));
  };

  const applyFilters = async () => {
    Object.keys(localFilters).forEach((filterCategoryId) => {
      const filterData = localFilters[filterCategoryId];
      if (typeof filterData === 'object' && 'minValue' in filterData && 'maxValue' in filterData) {
        dispatch(setPriceRange({
          filterCategoryId: Number(filterCategoryId),
          minValue: filterData.minValue,
          maxValue: filterData.maxValue,
        }));
      } else if (typeof filterData === 'object') {
        Object.keys(filterData).forEach((optionId) => {
          dispatch(setFilterOption({
            filterCategoryId: Number(filterCategoryId),
            filterOptionId: Number(optionId),
            isSelected: filterData[optionId],
          }));
        });
      } else {
        dispatch(setDropdownFilter({
          filterCategoryId: Number(filterCategoryId),
          selectedOptionId: filterData,
        }));
      }
    });

    // Notify the parent component (OfferListPage) to fetch offers
    onFilter();

    onClose(); // Close modal after applying filters
  };

  const clearAllFilters = () => {
    // Clear all filters in Redux
    dispatch(clearFilters());

    // Clear local state filters
    setLocalFilters({});
  };

  if (!isOpen) {
    return null;
  }

  const sortedFilters = [...filters].sort((a, b) => {
    const order = { checkbox: 1, dropdown: 2, slider: 3 };
    return order[a.displayType] - order[b.displayType];
  });

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {sortedFilters.map((filterCategory) => (
            <div key={filterCategory.filterCategoryId} className={styles.filter}>
              {filterCategory.displayType === 'checkbox' && (
                <CheckboxFilter
                  label={filterCategory.filterName}
                  options={filterCategory.filterOptions.map(option => ({
                    id: option.filterOptionId.toString(),
                    name: option.optionName,
                    checked: localFilters[filterCategory.filterCategoryId]?.[option.filterOptionId] || false,
                  }))}
                  onOptionChange={(optionId) => handleCheckboxChange(filterCategory.filterCategoryId, parseInt(optionId))}
                />
              )}
              {filterCategory.displayType === 'dropdown' && (
                <DropdownFilter
                  label={filterCategory.filterName}
                  options={filterCategory.filterOptions.map(option => ({
                    id: option.filterOptionId.toString(),
                    name: option.optionName,
                  }))}
                  selectedOption={filterCategory.filterOptions.find(option => option.filterOptionId.toString() === localFilters[filterCategory.filterCategoryId])?.optionName || 'Wybierz opcję'}
                  onSelect={(selectedOptionId) => handleDropdownChange(filterCategory.filterCategoryId, selectedOptionId)}
                />
              )}
              {filterCategory.displayType === 'slider' && (
                <PriceFilter
                  label={filterCategory.filterName}
                  minValue={localFilters[filterCategory.filterCategoryId]?.minValue || ''}
                  maxValue={localFilters[filterCategory.filterCategoryId]?.maxValue || ''}
                  onMinChange={(minValue) => handlePriceChange(filterCategory.filterCategoryId, minValue, localFilters[filterCategory.filterCategoryId]?.maxValue || '')}
                  onMaxChange={(maxValue) => handlePriceChange(filterCategory.filterCategoryId, localFilters[filterCategory.filterCategoryId]?.minValue || '', maxValue)}
                />
              )}
            </div>
          ))}

          <div className={styles.buttons}>
            <Button1 label="Wyczyść filtry" onClick={clearAllFilters} />
            <Button1 label="Anuluj" onClick={onClose} />
            <Button2 label="Filtruj" onClick={applyFilters} />
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
