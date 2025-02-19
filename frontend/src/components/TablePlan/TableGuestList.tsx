import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { assignGuest, unassignGuest } from '../../redux/slices/tablePlanSlice';
import Dropdown4 from '../Dropdown4';
import styles from '../../styles/Couple/TableGuestList.module.css';
import UserIcon from '../../assets/user.svg';
import MinusIcon from '../../assets/minus.svg';

interface TableGuestListProps {
  table: {
    tableId: number;
    maxGuests: number;
    guests: Array<{ guestId: number; guestName: string }>;
  };
}

const TableGuestList: React.FC<TableGuestListProps> = ({ table }) => {
    const { unassignedGuests } = useSelector((state: RootState) => state.tablePlan);
    const dispatch: AppDispatch = useDispatch();
    const [error, setError] = useState<string | null>(null);
  
    const handleAssignGuest = (guestId: string) => {
      if (table.guests.length >= table.maxGuests) {
        setError('Przekroczono maksymalną liczbę miejsc przy stole');
        return;
      }
  
      if (guestId) {
        dispatch(assignGuest({ tableId: table.tableId, guestId: Number(guestId) }));
        setError(null); // Usuwanie błędu po udanym przypisaniu
      }
    };
  
    const handleUnassignGuest = (guestId: number) => {
      dispatch(unassignGuest({ tableId: table.tableId, guestId }));
    };
  
    return (
      <div className={styles.guestList}>
        <ul className={styles.guestUl}>
          {table.guests.map((guest) => (
            <li key={guest.guestId} className={styles.guestRow}>
              <div className={styles.guestIcon}>
                <img src={UserIcon} alt="User Icon" />
              </div>
              <div className={styles.guestName}>{guest.guestName}</div>
              <div className={styles.guestActions} onClick={() => handleUnassignGuest(guest.guestId)}>
              <img src={MinusIcon} alt="Remove Guest" className={styles.minusIcon} />
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.addGuest}>
          <Dropdown4
            placeholder="Dodaj gościa do stołu"
            options={unassignedGuests.map((guest) => guest.guestName)}
            onSelect={(guestName) => {
              const guest = unassignedGuests.find((g) => g.guestName === guestName);
              if (guest) handleAssignGuest(String(guest.guestId));
            }}
            isValid={!error}
          errorMessage={error || ''}
          />
          
        </div>
      </div>
    );
  };
  
  export default TableGuestList;
  