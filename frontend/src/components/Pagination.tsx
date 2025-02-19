import React from 'react';
import styles from '../styles/pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Dodanie przewijania do góry
    }
  };

  const renderPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={currentPage === i ? styles.activePage : styles.pageButton}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={currentPage === 1 ? styles.activePage : styles.pageButton}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(<span key="dots1" className={styles.dots}>...</span>);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={currentPage === i ? styles.activePage : styles.pageButton}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="dots2" className={styles.dots}>...</span>);
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={currentPage === totalPages ? styles.activePage : styles.pageButton}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.paginationContainer}>
      <button
        className={styles.arrowButton}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
      {renderPages()}
      <button
        className={styles.arrowButton}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
