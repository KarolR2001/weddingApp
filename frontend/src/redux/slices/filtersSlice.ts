import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  selectedCategory: string | null;
  selectedCategoryId: string | null;
  selectedCity: string | null;
  sortOption: string;
  selectedTravelOption: string;
  selectedFilters: { [key: string]: any };
}

const initialState: FiltersState = {
  selectedCategory: sessionStorage.getItem('selectedCategory') || null,
  selectedCategoryId: sessionStorage.getItem('selectedCategoryId') || null,
  selectedCity: sessionStorage.getItem('selectedCity') || null,
  sortOption: sessionStorage.getItem('sortOption') || 'Domyślnie',
  selectedTravelOption: sessionStorage.getItem('selectedTravelOption') || 'Pokaż oferty z dojazdem',
  selectedFilters: JSON.parse(sessionStorage.getItem('selectedFilters') || '{}'),
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload.name;
      state.selectedCategoryId = action.payload.id;
      sessionStorage.setItem('selectedCategory', action.payload.name);
      sessionStorage.setItem('selectedCategoryId', action.payload.id);
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
      sessionStorage.setItem('selectedCity', action.payload);
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
      sessionStorage.setItem('sortOption', action.payload);
    },
    setSelectedTravelOption: (state, action) => {
      state.selectedTravelOption = action.payload;
      sessionStorage.setItem('selectedTravelOption', action.payload);
    },
    setFilterOption: (state, action: PayloadAction<{ filterCategoryId: number; filterOptionId: number; isSelected: boolean }>) => {
      const { filterCategoryId, filterOptionId, isSelected } = action.payload;
      if (!state.selectedFilters[filterCategoryId]) {
        state.selectedFilters[filterCategoryId] = {};
      }
      state.selectedFilters[filterCategoryId][filterOptionId] = isSelected;
      sessionStorage.setItem('selectedFilters', JSON.stringify(state.selectedFilters));
    },
    setDropdownFilter: (state, action: PayloadAction<{ filterCategoryId: number; selectedOptionId: string }>) => {
      const { filterCategoryId, selectedOptionId } = action.payload;
      state.selectedFilters[filterCategoryId] = selectedOptionId;
      sessionStorage.setItem('selectedFilters', JSON.stringify(state.selectedFilters));
    },
    setPriceRange: (state, action: PayloadAction<{ filterCategoryId: number; minValue: string; maxValue: string }>) => {
      const { filterCategoryId, minValue, maxValue } = action.payload;
      state.selectedFilters[filterCategoryId] = { minValue, maxValue };
      sessionStorage.setItem('selectedFilters', JSON.stringify(state.selectedFilters));
    },
    clearFilters: (state) => {
      state.selectedFilters = {};
      sessionStorage.removeItem('selectedFilters');
    },
  },
});

export const {
  setSelectedCategory,
  setSelectedCity,
  setSortOption,
  setSelectedTravelOption,
  setFilterOption,
  setDropdownFilter,
  setPriceRange,
  clearFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
