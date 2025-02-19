import React, { useState } from "react";
import styles from "../../styles/Couple/ControlPanel.module.css";
import AddTableModal from "./AddTableModal";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { generateTablePlanPDF } from "../../utils/generateTablePlanPdf";
import logoUrl from "../../assets/logo_png.png";

const ControlPanel: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tables = useSelector((state: RootState) => state.tablePlan.tables);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleExport = () => {
    if (tables.length > 0) {
      generateTablePlanPDF(tables, logoUrl);
    } else {
      alert("Brak stołów do eksportu.");
    }
  };

  return (
    <div className={styles.controlPanel}>
      <h1 className={styles.title}>Plan Stołów</h1>
      <div className={styles.actionContainer}>
        <button onClick={handleExport} className={styles.exportButton}>
          Eksportuj
        </button>
        <button className={styles.addButton} onClick={openModal}>
          Dodaj stół
        </button>
      </div>
      {isModalOpen && <AddTableModal onClose={closeModal} />}
    </div>
  );
};

export default ControlPanel;
