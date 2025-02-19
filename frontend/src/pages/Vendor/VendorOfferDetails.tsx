import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../redux/store';
import { setActiveComponent } from '../../redux/slices/activeComponentSlice';
import styles from '../../styles/Vendor/VendorOfferDetails.module.css';
import externalLinkIcon from '../../assets/external-link.svg';
import editIcon from '../../assets/edit.svg';
import deleteIcon from '../../assets/x-square.svg';
import stopIcon from '../../assets/stop.svg';
import playIcon from '../../assets/play.svg';
import awardIcon from '../../assets/award.svg';
import bugIcon from '../../assets/bug.svg';
import saveIcon from '../../assets/save.svg';
import StatIcon from '../../assets/chart-mixed.svg';
import ChartIcon from '../../assets/chart.svg';
import Spinner from '../../components/Spinner';
import PieChart from '../../components/AmazingPieChart';
import { ReactComponent as SuccessIcon } from '../../assets/Success.svg';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';


interface OfferStats {
  viewsCount: number;
  clicksCount: number;
  inquiriesCount: number;
  avgBrowsingTime: string;
  mostActiveDay: string;
  mostActiveHour: string;
  deviceTypeDistribution: {
    mobile: number;
    desktop: number;
  };
  period: string;
}

interface OfferData {
  stats: OfferStats[]; 
  firstImage: {
    mediaId: number;
    mediaUrl: string;
  };
  title: string;
  city: string;
  categoryName: string;
  isSuspended: boolean;
}

const VendorOfferDetails: React.FC = () => {
  const dispatch = useDispatch();
  const [offerData, setOfferData] = useState<OfferData | null>(null);
  const listingId = useSelector((state: RootState) => state.activeComponent.selectedListingId);
  const token = useSelector((state: RootState) => state.auth.token);
  const SERVER_URL = "http://localhost:5000";
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    dispatch(setActiveComponent({ component: 'offerListDetail', selectedListingId: listingId, viewSidebar: 'details' }));

    const fetchOfferData = async () => {
      if (!listingId || !token) {
        console.warn("Brak listingId lub tokena, pomijam pobieranie danych");
        return;
      }

      try {
        const response = await axios.get(`${SERVER_URL}/api/listings/stats/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Pobrane dane szczegółowe oferty:", response.data);
        setOfferData(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania danych szczegółowych oferty:", error);
      }
    };

    fetchOfferData();
  }, [dispatch, listingId, token]);
  useEffect(() => {
    if (offerData?.stats?.[0]?.deviceTypeDistribution) {
      const { mobile, desktop } = offerData.stats[0].deviceTypeDistribution;
      const total = mobile + desktop;

      // Oblicz procenty
      const mobilePercentage = ((mobile / total) * 100).toFixed(2);
      const desktopPercentage = ((desktop / total) * 100).toFixed(2);

      // Przygotuj dane dla wykresu
      setChartData({
        labels: ['Mobile', 'Desktop'],
        datasets: [
          {
            data: [mobilePercentage, desktopPercentage],
            backgroundColor: ['#EAD9C9', '#C3937C'], // Kolory dla wykresu
            hoverBackgroundColor: ['#EAD9C9', '#C3937C'],
          },
        ],
      });
    }
  }, [offerData]);
  const handleOpenPreview = () => {
    if (listingId) {
      window.open(`/listing/${listingId}`, '_blank');
    }
  };

  const handleEditClick = (listingId: number) => {
    dispatch(setActiveComponent({ component: 'editListing', selectedListingId: listingId, viewSidebar: 'details' }));
  };

  const handleDeleteListing = async () => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?");
    if (!confirmDelete) return;

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch(`${SERVER_URL}/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          dispatch(setActiveComponent({ component: "offers" }));
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Wystąpił problem podczas usuwania ogłoszenia: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Błąd podczas usuwania ogłoszenia:", error);
      alert("Wystąpił błąd podczas usuwania ogłoszenia.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggleSuspension = async () => {
    if (!listingId || !token) {
      alert('Brak tokena lub ID ogłoszenia.');
      return;
    }

    try {
      const response = await axios.put(
        `${SERVER_URL}/api/listings/toggle-suspension/${listingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedSuspensionStatus = response.data.isSuspended;
      setOfferData((prev) => prev ? { ...prev, isSuspended: updatedSuspensionStatus } : null);
    } catch (error) {
      console.error('Błąd podczas przełączania stanu zawieszenia:', error);
      alert('Wystąpił błąd podczas przełączania stanu zawieszenia.');
    }
  };
  if (isLoading) {
    return (
      <div className={styles.successMessage}>
        <Spinner />
        <p>Trwa usuwanie ogłoszenia...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.successMessage}>
        <SuccessIcon style={{ width: 300, height: 300 }} />
        <p>Ogłoszenie zostało pomyślnie usunięte!</p>
      </div>
    );
  }

  return (
    <div className={styles.detailsContainer}>
      {listingId ? (
        offerData ? (
          <>
            <div className={styles.headerContainer}>
              <div className={styles.titleContainer}>
                <div className={styles.title}>{offerData.title}</div>
                <div className={styles.details}>
                  <span>Kategoria: {offerData.categoryName}</span>
                  <span>Lokalizacja: {offerData.city}</span>
                </div>
              </div>
            </div>
            <div className={styles.wrapper}>
              <div className={styles.imageContainer}>
                <img
                  className={styles.image}
                  src={`${SERVER_URL}${offerData.firstImage?.mediaUrl || '/placeholder.png'}`}
                  alt="Zdjęcie ogłoszenia"
                />
              </div>
              <div className={styles.buttonsContainer}>
                <div className={styles.button} onClick={handleOpenPreview}>
                  <img src={externalLinkIcon} alt="Podgląd icon" className={styles.icon} />
                  Podgląd
                </div>
                <div className={styles.button} onClick={() => handleEditClick(listingId)}>
                  <img src={editIcon} alt="Edycja icon" className={styles.icon} />
                  Edycja
                </div>
                <div className={styles.button} onClick={handleDeleteListing}>
                  <img src={deleteIcon} alt="Usuń icon" className={styles.icon} />
                  Usuń
                </div>
                <div className={styles.button} onClick={handleToggleSuspension}>
                  <img
                    src={offerData.isSuspended ? playIcon : stopIcon}
                    alt={offerData.isSuspended ? 'Wznów icon' : 'Zawieś icon'}
                    className={styles.icon}
                  />
                  {offerData.isSuspended ? 'Wznów' : 'Zawieś'}
                </div>
                {/* <div className={styles.button}>
                  <img src={awardIcon} alt="Promuj icon" className={styles.icon} />
                  Promuj
                </div>
                <div className={styles.button}>
                  <img src={bugIcon} alt="Zgłoś błąd icon" className={styles.icon} />
                  Zgłoś błąd
                </div>
                <div className={styles.button}>
                  <img src={saveIcon} alt="Zapisz szablon icon" className={styles.icon} />
                  Zapisz szablon
                </div> */}
              </div>

              <div className={styles.statsContainer}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsTitle}>
                  <img src={StatIcon} alt="Zapisz szablon icon" className={styles.icon} />
                  Statystyki</div>
                  {/* <div className={styles.statsPeriod}>Miesięcznie</div> */}
                </div>
                
                <div className={styles.statsContent}>
                  <p>
                    <span>Liczba wyświetleń ogłoszenia:</span>{" "}
                    <strong>{offerData.stats?.[0]?.viewsCount ?? 0}</strong>
                  </p>
                  <p>
                    <span>Liczba kliknięć w szczegóły:</span>{" "}
                    <strong>{offerData.stats?.[0]?.clicksCount ?? 0}</strong>
                  </p>
                  <p>
                    <span>Liczba zapytań od klientów:</span>{" "}
                    <strong>{offerData.stats?.[0]?.inquiriesCount ?? 0}</strong>
                  </p>
                  <p>
                    <span>Średni czas przeglądania:</span>
                    <strong>
                      {offerData.stats?.[0]?.clicksCount
                        ? (Number(offerData.stats?.[0]?.avgBrowsingTime || 0) /
                            Number(offerData.stats?.[0]?.clicksCount)).toFixed(2)
                        : "0"}{" "}
                      min
                    </strong>
                  </p>
                  <p>
                    <span>Najbardziej aktywny dzień:</span>{" "}
                    <strong>{offerData.stats?.[0]?.mostActiveDay || "Brak danych"}</strong>
                  </p>
                  <p>
                    <span>Najbardziej aktywna godzina:</span>{" "}
                    <strong>
                      {offerData.stats?.[0]?.mostActiveHour
                        ? `${offerData.stats[0].mostActiveHour}:00`
                        : "Brak danych"}
                    </strong>
                  </p>
                </div>

              </div> 

              <div className={styles.containerCharts}>
                <div className={styles.chartHeader}>
                  <div className={styles.chartTitleContainer}>
                    <div className={styles.chartIcon}>
                    <img src={ChartIcon} alt="Zapisz szablon icon" className={styles.icon} />
                    </div>
                    <div className={styles.chartTitle}>Wykresy</div>
                  </div>
                  <div className={styles.chartPeriodContainer}>
                    {/* <div className={styles.periodBorder}></div>
                    <div className={styles.periodText}>Miesięcznie</div>
                    <div className={styles.periodArrow}>
                      <div className={styles.arrowInner}></div>
                    </div> */}
                  </div>
                </div>

                <div style={{ width: 'auto', height: 'auto' }}>
                {chartData ? (
                 <PieChart data={offerData?.stats?.[0]?.deviceTypeDistribution} />

                ) : (
                  <p>Ładowanie danych wykresu...</p>
                )}</div>
              </div>
            </div>
          </>
        ) : (
          <p>Ładowanie danych szczegółowych...</p>
        )
      ) : (
        <p className={styles.noDetails}>Nie wybrano ogłoszenia do wyświetlenia.</p>
      )}
    </div>
  );
};

export default VendorOfferDetails;