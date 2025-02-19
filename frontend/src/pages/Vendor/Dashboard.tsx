import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setActiveComponent } from '../../redux/slices/activeComponentSlice';
import styles from '../../styles/Vendor/VendorDashboard.module.css';
import LoginTopMenu from '../../components/LoginTopMenu';
import VendorSideMenuMenu from '../../components/VendorSidebarMenu';
import VendorOfferList from '../../pages/Vendor/VendorOfferList';
import Messages from '../Vendor/MessagesComponent';
import Payments from '../Vendor/PaymentsComponent';
import AddListing from '../Vendor/AddListingComponent';
import VendorOfferDetails from '../Vendor/VendorOfferDetails';
import EditListing from '../Vendor/EditListing';
import VendorReviewDetails from '../Vendor/VendorReviewDetails';
import VendorMessagesDetails from '../Vendor/VendorMessagesDetails';
import VendorCalendarDetails from '../Vendor/VendorCalendarDetails';
import SettingsComponent from '../../components/SettingsComponent';

const VendorDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const activeComponent = useSelector((state: RootState) => state.activeComponent.component);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'messages':
        return <Messages />;
      case 'payments':
        return <Payments />;
      case 'addListing':
        return <AddListing />;
      case 'offerListDetail':
        return <VendorOfferDetails />;
      case 'editListing': 
        return <EditListing />;
      case 'reviews':
        return <VendorReviewDetails />;
      case 'detailMessages':
        return <VendorMessagesDetails />;
      case 'calendar':
        return <VendorCalendarDetails />;  
      case 'settings':
        return <SettingsComponent />;  
      default:
        return <VendorOfferList />;
    }
  };

  useEffect(() => {
    // Set default component on mount
    dispatch(setActiveComponent({ component: 'offers' }));
  }, [dispatch]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidemenu */}
      <aside className={`${styles.sidemenu} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <VendorSideMenuMenu onToggleSidebar={handleSidebarToggle} />
      </aside>

      {/* Main content area */}
      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        {/* TopMenu */}
        <header className={styles.topMenu}>
          <LoginTopMenu />
        </header>

        {/* Content - Dynamiczne wyświetlanie komponentów */}
        <section className={styles.content}>
          {renderActiveComponent()}
        </section>
      </div>
    </div>
  );
};

export default VendorDashboard;