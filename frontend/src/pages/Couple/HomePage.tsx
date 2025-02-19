import React, { useState } from "react";
import { pl } from "date-fns/locale";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RootState } from "../../redux/store";
import { updateWeddingDate } from "../../redux/slices/userSlice";
import { loadUserFromLocalStorage  } from "../../redux/slices/authSlice";
import styles from "../../styles/Couple/HomePage.module.css";
import WidgetSVG from "../../assets/Widget.svg";
import { ReactComponent as CalendarIcon } from "../../assets/calendar-month.svg";
import axios from "axios";

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Pobranie danych z Redux
  const brideName = user?.coupleProfile?.partner1Name || "Pani Młoda";
  const groomName = user?.coupleProfile?.partner2Name || "Pan Młody";
  const weddingDate = user?.coupleProfile?.weddingDate
  ? new Date(user.coupleProfile.weddingDate) // Konwersja z string na Date
  : null;

  // Obliczenie liczby dni do ślubu
  const today = new Date();
  const daysLeft = weddingDate
    ? Math.max(
        Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        0
      )
    : null;

  // Stan dla datownika
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const updateWeddingDateInDB = async (formattedDate: string) => {
    try {
      const token = localStorage.getItem("token"); // Pobierz token z localStorage
      if (!token) throw new Error("Brak tokenu uwierzytelnienia.");

      await axios.put(
        "http://localhost:5000/api/users/update",
        { weddingDate: formattedDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data ślubu została pomyślnie zapisana w bazie danych.");
    } catch (error) {
      console.error("Wystąpił błąd podczas zapisywania daty w bazie danych:", error);
    }
  };

  // Obsługa wyboru daty
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
  
      // Pobierz bieżącego użytkownika z localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (currentUser && currentUser.coupleProfile) {
        // Zaktualizuj weddingDate w obiekcie użytkownika
        const updatedUser = {
          ...currentUser,
          coupleProfile: {
            ...currentUser.coupleProfile,
            weddingDate: formattedDate,
          },
        };
  
        // Zapisz zaktualizowanego użytkownika do localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
  
        // Wywołaj akcję Redux, aby odświeżyć stan
        dispatch(loadUserFromLocalStorage());
        updateWeddingDateInDB(formattedDate);
        console.log('Zaktualizowano localStorage i Redux:', updatedUser);
      } else {
        console.warn('Nie znaleziono danych użytkownika w localStorage.');
      }
    }
  };
  

  return (
    <div className={styles.container}>
      {/* Tło SVG */}
      <div className={styles.widget}>
        <img src={WidgetSVG} alt="Wedding Widget" className={styles.widgetBackground} />

        {/* Imiona */}
        <div className={styles.names}>
          <p>{brideName.toUpperCase()}</p>
          <p>{groomName.toUpperCase()}</p>
        </div>

        {/* Liczba dni lub ikona kalendarza */}
        <div className={styles.days}>
          {daysLeft !== null ? (
            <>
              <span>{daysLeft}</span>
              <p>dni</p>
            </>
          ) : (
            <>
              {!isDatePickerOpen && (
                <CalendarIcon
                  className={styles.calendarIcon}
                  onClick={() => setIsDatePickerOpen(true)} // Otwórz datownik
                />
              )}
              {isDatePickerOpen && (
                <div className={styles.datePickerContainer}>
                  <DatePicker
                    selected={weddingDate}
                    onChange={handleDateChange}
                    inline
                    locale={pl} // Ustawienie języka na polski
                    className={styles.datePicker}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
