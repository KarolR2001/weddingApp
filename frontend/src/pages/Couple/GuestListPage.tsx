import React from 'react';
import GuestListHeader from '../../components/GuestList/GuestListHeader';
import GuestListTable from '../../components/GuestList/GuestListTable';
import styles from '../../styles/Couple/GuestListPage.module.css';
import SummaryBar from '../../components/GuestList/SummaryBar';

const GuestListPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <GuestListHeader />
      <GuestListTable />
      <SummaryBar />
    </div>
  );
};

export default GuestListPage;
