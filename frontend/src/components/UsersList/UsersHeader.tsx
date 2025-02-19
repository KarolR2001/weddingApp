import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, fetchUsers } from '../../redux/slices/usersSlice';
import { RootState, AppDispatch } from '../../redux/store';
import styles from '../../styles/Admin/UsersList/UsersHeader.module.css';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';

const UsersHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchQuery = useSelector((state: RootState) => state.users.searchQuery);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
      dispatch(fetchUsers({ page: 1, searchQuery: localSearch }));
    }, 250); // 300 ms opóźnienia

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.title}>Konta Użytkowników</h1>
      <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={localSearch}
            placeholder={`Wyszukaj użytkownika...`}
            className={styles.searchInput}
            onChange={handleSearchChange}
          />
        </div>
    </div>
  );
};

export default UsersHeader;
