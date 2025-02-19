import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchGuests, setLoading } from '../../redux/slices/guestListSlice'; // Dodano `setLoading`
import styles from '../../styles/Couple/GuestListHeader.module.css';
import modalStyles from '../../styles/Couple/GuestListHeader.module.css';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import axios from 'axios';
import { RootState, AppDispatch } from '../../redux/store';
import Button1 from '../../components/Button1';
import Button2 from '../../components/Button2';
import { generatePDF } from "../../utils/generatePdf";
import logoUrl from "../../assets/logo_png.png";


const GuestListHeader: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const filteredGuests = useSelector((state: RootState) => state.guestList.guests);
  const coupleId = useSelector((state: RootState) => state.auth.user?.coupleProfile?.coupleId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const groups = useSelector((state: RootState) => state.guestList.groups);
  const guests = useSelector((state: RootState) => state.guestList.guests);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleImportClick = () => {
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && coupleId) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('coupleId', coupleId.toString());

      dispatch(setLoading(true)); // Ustawienie loading na true
      setModalOpen(false);
      try {
        await axios.post('http://localhost:5000/api/guests/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        dispatch(fetchGuests(coupleId)); // Odświeżenie listy gości
      } catch (error) {
        console.error('Błąd podczas importu pliku:', error);
      } finally {
        dispatch(setLoading(false)); // Ustawienie loading na false
        setModalOpen(false); // Zamknięcie modala
      }
    }
  };

  const handleDownloadTemplate = () => {
    console.log('Wysłanie żądania GET na endpoint /template-xlsx');
    window.location.href = 'http://localhost:5000/api/guests/template'; // Dopasowanie do routera
  };
  const handleExportToPdf = () => {

    generatePDF(guests, groups, logoUrl);
  };

  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.title}>Lista Gości</h1>
      <div className={styles.actionContainer}>
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder={`Wyszukaj wśród ${filteredGuests.length} gości...`}
            className={styles.searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <button className={styles.exportButton} onClick={handleExportToPdf}>Eksportuj</button>
        <button className={styles.importButton} onClick={handleImportClick}>
          Importuj Listę z Excela
        </button>
      </div>

      {isModalOpen && (
  <div
    className={modalStyles.modalBackdrop}
    onClick={() => setModalOpen(false)} // Zamknięcie po kliknięciu poza modalem
  >
    <div
      className={modalStyles.modalContent}
      onClick={(e) => e.stopPropagation()} // Zapobiega zamknięciu przy kliknięciu wewnątrz modala
    >
      <button
        className={modalStyles.closeButton}
        onClick={() => setModalOpen(false)}
      >
        ×
      </button>
      <h2 className={modalStyles.titleModal}>Importowanie listy gości</h2>
      <div className={modalStyles.instructions}>
        <p className={modalStyles.hed}>Aby poprawnie zaimportować listę gości:</p>
        <ol>
          <li className={modalStyles.typing}>1. Pobierz szablon XLSX, klikając przycisk poniżej.</li>
          <li className={modalStyles.typing}>2. Otwórz plik w programie Excel.</li>
          <li className={modalStyles.typing}>3. Uzupełnij dane zgodnie z nagłówkami w pliku.</li>
          <li className={modalStyles.typing}>4. Zapisz plik i wróć tutaj, aby go zaimportować.</li>
        </ol>
      </div>
      <div className={modalStyles.buttonContainer}>
        <Button2
          label="Pobierz szablon XLSX"
          onClick={handleDownloadTemplate}
        />
        <Button1
          label="Wybierz plik XLSX"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default GuestListHeader;
