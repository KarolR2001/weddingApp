import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchTables, fetchUnassignedGuests } from '../../redux/slices/tablePlanSlice';
import ControlPanel from '../../components/TablePlan/ControlPanel';
import TableList from '../../components/TablePlan/TableList';
import styles from '../../styles/Couple/TablePlanPage.module.css';

const TablePlanPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const coupleId = user?.coupleProfile?.coupleId;

  useEffect(() => {
    
    dispatch(fetchTables(coupleId));
    dispatch(fetchUnassignedGuests(coupleId));
  }, [dispatch]);

  return (
    <div className={styles.pageContainer}>
      <ControlPanel />
      <TableList />
    </div>
  );
};

export default TablePlanPage;
