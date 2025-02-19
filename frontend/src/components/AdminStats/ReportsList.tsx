import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, setSearch } from '../../redux/slices/reportsSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { ReactComponent as SuccessIcon } from '../../assets/chart-mixed.svg';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as SortIcon } from '../../assets/bxs_sort-alt.svg';
import OptionsButtonIcon from '../../assets/OptionsButton.svg';
import { generateReportPDF } from '../../utils/pdfRaportGenerator';
import { printReportPDF } from '../../utils/printReportPdf';
import logoPath from '../../assets/logo_png.png';
import styles from '../../styles/Admin/AdminReportsPage.module.css';

// Funkcja mapująca typ raportu na polskie odpowiedniki
const mapReportTypeToPolish = (type: string): string => {
  const types: Record<string, string> = {
    daily: 'Dzienny',
    weekly: 'Tygodniowy',
    monthly: 'Miesięczny',
    yearly: 'Roczny',
  };
  return types[type] || 'Nieznany';
};

const ReportsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, loading, search } = useSelector((state: RootState) => state.reports);
  const [localSearch, setLocalSearch] = useState(search);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchReports({ page: 1, search }));
  }, [dispatch, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    dispatch(setSearch(e.target.value));
  };

  const toggleMenu = (id: number) => {
    setMenuOpen((prev) => (prev === id ? null : id));
  };
  
  return (
    <div className={styles.reportsListContainer}>
      <div className={styles.headerContainerListReports}>
        <div className={styles.titleHeaderReportsList}>
          <SuccessIcon />
          Wygenerowane Raporty
        </div>
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={localSearch}
            placeholder="Wyszukaj raport..."
            className={styles.searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderContainer}>
            <div className={styles.headerColumn}>
              <span>Nazwa</span>
              <SortIcon className={styles.sortIcon} />
            </div>
            <div className={styles.headerColumn}>
              <span>Typ</span>
              <SortIcon className={styles.sortIcon} />
            </div>
            <div className={styles.headerColumn}>
              <span>Data utworzenia</span>
              <SortIcon className={styles.sortIcon} />
            </div>
            <div className={styles.emptyColumn}></div>
          </div>
          <div>
            {reports.map((report) => (
              <div className={styles.tableRow} key={report.reportId}>
                <div className={styles.tableColumn}>
                  <div className={styles.text}>{report.reportName}</div>
                </div>
                <div className={styles.tableColumn}>
                  <div className={styles.text}>{mapReportTypeToPolish(report.reportType)}</div>
                </div>
                <div className={styles.tableColumn}>
                  <div className={styles.text}>{new Date(report.created_at).toLocaleDateString()}</div>
                </div>
                <div className={styles.actionsColumn}>
  <button
    className={styles.optionsButton}
    onClick={() => toggleMenu(report.reportId)}
  >
    <img src={OptionsButtonIcon} alt="Opcje" />
  </button>
  {menuOpen === report.reportId && (
    <div className={styles.optionsMenu}>
      <div
        className={styles.option}
        onClick={() => generateReportPDF(report, logoPath)}
      >
        Pobierz PDF
      </div>
      <div
        className={styles.option}
        onClick={() => printReportPDF(report, logoPath)}
      >
        Drukuj
      </div>
    </div>
  )}
</div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
