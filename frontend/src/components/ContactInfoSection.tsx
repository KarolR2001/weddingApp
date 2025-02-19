import React from 'react';
import styles from '../styles/ContactInfoSection.module.css';
import phoneIcon from '../assets/phone.svg';
import websiteIcon from '../assets/website.svg';
import emailIcon from '../assets/mail.svg';
import instagramIcon from '../assets/instagram.svg';
import facebookIcon from '../assets/facebook.svg';
import youtubeIcon from '../assets/youtube.svg';
import tiktokIcon from '../assets/TikTok.svg';
import pinterestIcon from '../assets/Pinterest.svg';
import soundcloudIcon from '../assets/Soundcloud.svg';
import spotifyIcon from '../assets/Spotify.svg';

interface ContactInfoSectionProps {
  phone: string;
  websiteUrl?: string;
  email: string;
  socialMedia: {
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    pinterestUrl?: string;
    soundcloudUrl?: string;
    spotifyUrl?: string;
  };
}

const formatUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};
const formatPhoneNumber = (phone: string) => {
  // Usuń wszystkie znaki inne niż cyfry
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Formatuj numer na grupy z '-'
  if (cleanPhone.length === 10) {
    // Dla numerów 10-cyfrowych np. 123-456-7890
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    // Dla numerów 11-cyfrowych zaczynających się na '1' np. 1-234-567-8901
    return `${cleanPhone.slice(0, 1)}-${cleanPhone.slice(1, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  } else if (cleanPhone.length === 9) {
    // Dla numerów 9-cyfrowych np. 123-456-789
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else {
    // Domyślny format dla innych długości
    return cleanPhone;
  }
};
const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ phone, websiteUrl, email, socialMedia }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>KONTAKT</h2>

      <div className={styles.contactItem}>
        <img src={phoneIcon} alt="Phone" className={styles.icon} />
        <span>{formatPhoneNumber(phone)}</span>
      </div>

      {websiteUrl && (
        <div className={styles.contactItem}>
          <img src={websiteIcon} alt="Website" className={styles.icon} />
          <a href={formatUrl(websiteUrl)} target="_blank" rel="noopener noreferrer">
            {websiteUrl}
          </a>
        </div>
      )}

      <div className={styles.contactItem}>
        <img src={emailIcon} alt="Email" className={styles.icon} />
        <a href={`mailto:${email}`}>{email}</a>
      </div>

      <div className={styles.socialMedia}>
        {socialMedia.facebookUrl && (
          <a href={formatUrl(socialMedia.facebookUrl)} target="_blank" rel="noopener noreferrer">
            <img src={facebookIcon} alt="Facebook" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.instagramUrl && (
          <a href={formatUrl(socialMedia.instagramUrl)} target="_blank" rel="noopener noreferrer">
            <img src={instagramIcon} alt="Instagram" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.youtubeUrl && (
          <a href={formatUrl(socialMedia.youtubeUrl)} target="_blank" rel="noopener noreferrer">
            <img src={youtubeIcon} alt="YouTube" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.tiktokUrl && (
          <a href={formatUrl(socialMedia.tiktokUrl)} target="_blank" rel="noopener noreferrer">
            <img src={tiktokIcon} alt="TikTok" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.pinterestUrl && (
          <a href={formatUrl(socialMedia.pinterestUrl)} target="_blank" rel="noopener noreferrer">
            <img src={pinterestIcon} alt="Pinterest" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.soundcloudUrl && (
          <a href={formatUrl(socialMedia.soundcloudUrl)} target="_blank" rel="noopener noreferrer">
            <img src={soundcloudIcon} alt="SoundCloud" className={styles.socialIcon} />
          </a>
        )}
        {socialMedia.spotifyUrl && (
          <a href={formatUrl(socialMedia.spotifyUrl)} target="_blank" rel="noopener noreferrer">
            <img src={spotifyIcon} alt="Spotify" className={styles.socialIcon} />
          </a>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSection;
