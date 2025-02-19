import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import UsersHeader from '../../components/UsersList/UsersHeader';
import UsersTable from '../../components/UsersList/UsersTable';
import Pagination from '../../components/Pagination';
import { fetchUsers } from '../../redux/slices/usersSlice';
import Spinner from '../../components/Spinner'; // Import Spinner
import styles from '../../styles/Admin/AdminAccountManagementPage.module.css';

const AdminAccountManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, pagination, searchQuery, loading } = useSelector((state: RootState) => state.users);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, searchQuery }));
  }, [dispatch, currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.pageContainer}>
      <UsersHeader />
      {loading ? (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.contentContainer}>
          <UsersTable users={users} />
          <div className={styles.paginationContainer}>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountManagementPage;
