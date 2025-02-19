import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ReactComponent as SuccessIcon } from '../../assets/chart.svg';
import styles from '../../styles/Admin/AdminReportsPage.module.css';

const ChartsSection: React.FC = () => {
  const { stats } = useSelector((state: RootState) => state.adminStats);

  if (!stats) return null;

  // Dane dla wykresu słupkowego
  const barDataValues = [120, 150, 180, 200, 135, 190];
  const maxValue = Math.max(...barDataValues); 
  const barColors = barDataValues.map((value) =>
    value === maxValue ? '#c3937c' : '#EAD9C9' 
  );

  const barData = {
    labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec'],
    datasets: [
      {
        label: 'Czas spędzony (minuty)',
        data: barDataValues,
        backgroundColor: barColors,
        borderRadius: 8,
      },
    ],
  };

  // Dane dla wykresu donut
  const donutData = {
    labels: ['Mobile', 'Desktop'],
    datasets: [
      {
        data: [stats.deviceTypeDistribution.mobile, stats.deviceTypeDistribution.desktop],
        backgroundColor: ['#787878', '#c3937c'],
        borderRadius: 15,
      },
    ],
  };

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.headerContainer}>
        <SuccessIcon />
        Wykresy
      </div>
      <div className={styles.contentChart}>
        <div className={styles.chartBar}>
          <Bar data={barData} />
        </div>
        <div className={styles.chartDonut}>
          <Doughnut data={donutData} />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
