import React, { useState, useEffect } from 'react';
import styles from '../styles/ImageGallery.module.css';
import LeftArrowIcon from '../assets/Vector_75.svg';
import RightArrowIcon from '../assets/Vector_75.svg';

interface Media {
  mediaId: number;
  mediaType: string;
  mediaUrl: string;
}

interface ImageGalleryProps {
  media: Media[];
  SERVER_URL: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ media, SERVER_URL }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [maxVisibleThumbnails, setMaxVisibleThumbnails] = useState(5);

  useEffect(() => {
    // Zmieniamy liczbę wyświetlanych miniaturek w zależności od szerokości ekranu
    const updateThumbnails = () => {
      if (window.innerWidth <= 768) {
        setMaxVisibleThumbnails(4); // Na mniejszych ekranach pokaż 3 miniaturki
      } else {
        setMaxVisibleThumbnails(5); // Na większych ekranach pokaż 5 miniaturek
      }
    };

    window.addEventListener('resize', updateThumbnails);
    updateThumbnails();

    return () => {
      window.removeEventListener('resize', updateThumbnails);
    };
  }, []);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleShowMoreThumbnails = () => {
    const totalMedia = media.length;
    const remainingThumbnails = totalMedia - thumbnailStartIndex - maxVisibleThumbnails;
    if (remainingThumbnails > 0) {
      setThumbnailStartIndex((prevIndex) => Math.min(prevIndex + maxVisibleThumbnails, totalMedia - maxVisibleThumbnails));
    }
  };

  const handleShowPreviousThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex((prevIndex) => Math.max(prevIndex - maxVisibleThumbnails, 0));
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const remainingThumbnailsCount = media.length - thumbnailStartIndex - maxVisibleThumbnails;
  const previousThumbnailsCount = thumbnailStartIndex;

  const previousImageUrl = previousThumbnailsCount > 0 ? `${SERVER_URL}${media[thumbnailStartIndex - 1].mediaUrl}` : null;
  const nextImageUrl = remainingThumbnailsCount > 0 ? `${SERVER_URL}${media[thumbnailStartIndex + maxVisibleThumbnails].mediaUrl}` : null;

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageContainer}>
        <img
          src={`${SERVER_URL}${media[currentImageIndex].mediaUrl}`}
          alt="Główne zdjęcie"
          className={styles.mainImage}
          onClick={openModal}
        />
        <button className={styles.leftArrow} onClick={handlePreviousImage}>
          <img src={LeftArrowIcon} alt="Left Arrow" className={styles.arrowIcon} />
        </button>
        <button className={styles.rightArrow} onClick={handleNextImage}>
          <img src={RightArrowIcon} alt="Right Arrow" className={`${styles.arrowIcon} ${styles.rightIcon}`} />
        </button>
      </div>
      <div className={styles.thumbnailContainer}>
        {previousThumbnailsCount > 0 && previousImageUrl && (
          <div
            className={styles.moreImages}
            onClick={handleShowPreviousThumbnails}
            style={{ backgroundImage: `url(${previousImageUrl})` }}
          >
            <div className={styles.moreOverlay}>
              <div className={styles.moreText}>+ {previousThumbnailsCount} mniej</div>
            </div>
          </div>
        )}

        {media.slice(thumbnailStartIndex, thumbnailStartIndex + maxVisibleThumbnails).map((mediaItem, index) => (
          <img
            key={mediaItem.mediaId}
            src={`${SERVER_URL}${mediaItem.mediaUrl}`}
            alt={`Miniaturka ${index + 1}`}
            className={styles.thumbnail}
            onClick={() => handleThumbnailClick(index + thumbnailStartIndex)}
          />
        ))}

        {remainingThumbnailsCount > 0 && nextImageUrl && (
          <div
            className={styles.moreImages}
            onClick={handleShowMoreThumbnails}
            style={{ backgroundImage: `url(${nextImageUrl})` }}
          >
            <div className={styles.moreOverlay}>
              <div className={styles.moreText}>+ {remainingThumbnailsCount} więcej</div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <span className={styles.closeModal} onClick={closeModal}>&times;</span>
          <button className={styles.modalLeftArrow} onClick={handlePreviousImage}>
            <img src={LeftArrowIcon} alt="Left Arrow" className={styles.arrowIcon} />
          </button>
          <img
            className={styles.modalContent}
            src={`${SERVER_URL}${media[currentImageIndex].mediaUrl}`}
            alt="Powiększone zdjęcie"
          />
          <button className={styles.modalRightArrow} onClick={handleNextImage}>
            <img src={RightArrowIcon} alt="Right Arrow" className={`${styles.arrowIcon} ${styles.rightIcon}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
