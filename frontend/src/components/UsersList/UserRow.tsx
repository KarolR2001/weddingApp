import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserStatus } from '../../redux/slices/usersSlice';
import { AppDispatch } from '../../redux/store';
import styles from '../../styles/Admin/UsersList/UserRow.module.css';
import { ReactComponent as OptionsIcon } from '../../assets/OptionsButton.svg';

interface User {
  id: number;
  email: string;
  userType: string;
  status: string;
  created_at: string;
  lastLoginAt: string | null;
}

interface UserRowProps {
  user: User;
}

const UserRow: React.FC<UserRowProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggleMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 120; // Przybliżona wysokość menu
      const viewportHeight = window.innerHeight;

      const fitsBelow = rect.bottom + 5 + menuHeight <= viewportHeight;

      setMenuPosition({
        top: fitsBelow ? rect.bottom + 5 + window.scrollY : rect.top - menuHeight - 5 + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setIsMenuOpen((prev) => !prev);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: string) => {
    dispatch(updateUserStatus({ userId: user.id, status }));
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.rowContainer}>
      <div className={styles.column}>
        <span>{user.email}</span>
      </div>
      <div className={styles.column}>
        <div className={`${styles.userTypeBadge} ${styles[user.userType]}`}>
          {user.userType === 'vendor' ? 'Usługodawca' : user.userType === 'couple' ? 'Para młoda' : 'Administrator'}
        </div>
      </div>
      <div className={styles.column}>
        <div className={`${styles.statusBadge} ${styles[user.status]}`}>
          {user.status === 'active' ? 'Aktywne' : user.status === 'blocked' ? 'Zablokowane' : 'Usunięte'}
        </div>
      </div>
      <div className={styles.column}>
        <span>{new Date(user.created_at).toLocaleDateString()}</span>
      </div>
      <div className={styles.column}>
        <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Brak'}</span>
      </div>
      <div className={styles.moreOptionsColumn}>
        <button
          ref={buttonRef}
          className={styles.moreOptionsButton}
          onClick={handleToggleMenu}
        >
          <OptionsIcon className={styles.optionsIcon} />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={styles.optionsMenu}
            style={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 10,
            }}
          >
            {user.status !== 'blocked' && (
              <div className={styles.option} onClick={() => handleStatusChange('blocked')}>
                Zablokuj
              </div>
            )}
            {user.status !== 'active' && (
              <div className={styles.option} onClick={() => handleStatusChange('active')}>
                Aktywuj
              </div>
            )}
            {user.status !== 'deleted' && (
              <div className={styles.option} onClick={() => handleStatusChange('deleted')}>
                Usuń
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRow;
