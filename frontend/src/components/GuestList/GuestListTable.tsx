import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GuestRow from './GuestRow';
import AddGuestRow from './AddGuestRow';
import GuestListTableHeader from './GuestListTableHeader';
import styles from '../../styles/Couple/GuestListTable.module.css';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchGuests, fetchGroups, addGuest, updateGuest, sortGuests } from '../../redux/slices/guestListSlice';
import { selectFilteredGuests, deleteGuest, openModal } from '../../redux/slices/guestListSlice';
import GuestNoteModal from './GuestNoteModal';
import Spinner from '../Spinner';


const GuestListTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const filteredGuests = useSelector(selectFilteredGuests); 
  const { groups, loading } = useSelector((state: RootState) => state.guestList);
  const { user } = useSelector((state: RootState) => state.auth);
  const coupleId = user?.coupleProfile?.coupleId;

  useEffect(() => {
    if (coupleId) {
      dispatch(fetchGuests(coupleId));
      dispatch(fetchGroups(coupleId));
    }
  }, [dispatch, coupleId]);

  const handleAddGuest = async (guest: { name: string; status: 'invited' | 'confirmed' | 'declined'; group: string }) => {
    const group = groups.find((g) => g.groupName === guest.group);
    if (!group) {
      alert('Niepoprawna grupa!');
      return;
    }

    if (coupleId) {
      const resultAction = await dispatch(
        addGuest({
          coupleId,
          guestName: guest.name,
          guestStatus: guest.status,
          groupId: group.groupId,
        })
      );

      if (addGuest.fulfilled.match(resultAction)) {
        console.log('Nowy gość dodany:', resultAction.payload);
      } else {
        console.error('Błąd podczas dodawania nowego gościa:', resultAction.payload);
      }
    }
  };
  const handleSort = (column: 'name' | 'status' | 'group') => {
    dispatch(sortGuests({ column }));
  };
  return (
    <div className={styles.tableContainer}>
      <GuestListTableHeader onSort={handleSort} />
      <AddGuestRow onAddGuest={handleAddGuest} />
      {loading ? (
        <Spinner /> // Wyświetlanie spinnera zamiast tabeli
      ) : (
        filteredGuests.map((guest) => {
          const group = groups.find((g) => g.groupId === guest.groupId)?.groupName || 'Brak grupy';
          return (
            <GuestRow
              key={guest.guestId}
              guestName={guest.guestName}
              status={guest.guestStatus}
              group={group}
              onStatusChange={(newStatus) =>
                dispatch(
                  updateGuest({
                    guestId: guest.guestId,
                    updates: { guestStatus: newStatus as 'invited' | 'confirmed' | 'declined' },
                  })
                )
              }
              onGroupChange={(newGroup) => {
                const updatedGroup = groups.find((g) => g.groupName === newGroup);
                if (updatedGroup) {
                  dispatch(updateGuest({ guestId: guest.guestId, updates: { groupId: updatedGroup.groupId } }));
                }
              }}
              onDelete={() => {
                dispatch(deleteGuest(guest.guestId));
              }}
              onNoteClick={() => dispatch(openModal(guest.guestId))}
            />
          );
        })
      )}
      <GuestNoteModal />
    </div>
  );
};

export default GuestListTable;