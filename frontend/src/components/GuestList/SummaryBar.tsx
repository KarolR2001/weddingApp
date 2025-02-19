import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import styles from '../../styles/Couple/SummaryBar.module.css';

const SummaryBar: React.FC = () => {
  const guests = useSelector((state: RootState) => state.guestList.guests);
  const groups = useSelector((state: RootState) => state.guestList.groups);

  // Wyliczenia
  const allCount = guests.length;
  const invitedCount = guests.filter((guest) => guest.guestStatus === 'invited').length;
  const confirmedCount = guests.filter((guest) => guest.guestStatus === 'confirmed').length;
  const declinedCount = guests.filter((guest) => guest.guestStatus === 'declined').length;

  const groupCounts = groups.map((group) => ({
    groupName: group.groupName,
    count: guests.filter((guest) => guest.groupId === group.groupId).length,
  }));

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.statusRow}>
        <div className={styles.statusItem}>Wszyscy: {allCount}</div>
        <div className={styles.statusItem}>Niepotwierdzonych: {invitedCount}</div>
        <div className={styles.statusItem}>Potwierdzonych: {confirmedCount}</div>
        <div className={styles.statusItem}>Odmówiło: {declinedCount}</div>
      </div>
      <div className={styles.groupRow}>
        {groupCounts.map((group) => (
          <div key={group.groupName} className={styles.groupItem}>
            {group.groupName}: {group.count}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryBar;
