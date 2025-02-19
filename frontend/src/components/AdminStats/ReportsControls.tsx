import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateReport, fetchReports } from '../../redux/slices/reportsSlice';
import { RootState, AppDispatch } from '../../redux/store';
import styles from '../../styles/Admin/AdminReportsPage.module.css';
import refreshIcon from '../../assets/refresh-cw.svg';
import editIcon from '../../assets/edit.svg';
import { printReportPDF } from '../../utils/printReportPdf';
import printerIcon from '../../assets/printer.svg';
import logoPath from '../../assets/logo_png.png';

const ReportsControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports } = useSelector((state: RootState) => state.reports);

  const handleRefresh = () => dispatch(fetchReports({ page: 1, search: '' }));

  const handleGenerateReport = () => dispatch(generateReport('monthly'));

  const handlePrintReport = () => {
    if (reports.length === 0) {
      alert('Brak raportów do wydrukowania.');
      return;
    }

    // Znajdź najnowszy raport
    const latestReport = reports.reduce((latest, report) =>
      new Date(report.created_at) > new Date(latest.created_at) ? report : latest
    );

    // Wywołaj funkcję drukowania z najnowszym raportem
    printReportPDF(latestReport, logoPath);
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.button} onClick={handleRefresh}>
        <img src={refreshIcon} alt="Odśwież" className={styles.icon} />
        Odśwież dane
      </div>
      <div className={styles.button} onClick={handleGenerateReport}>
        <img src={editIcon} alt="Generuj" className={styles.icon} />
        Generuj nowy raport
      </div>
      <div className={styles.button} onClick={handlePrintReport}>
        <img src={printerIcon} alt="Drukuj" className={styles.icon} />
        Drukuj raport
      </div>
    </div>
  );
};

export default ReportsControls;
