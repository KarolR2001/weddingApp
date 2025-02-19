import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { addGroup, deleteGroup, fetchGroups } from '../../redux/slices/guestListSlice';
import Input2 from '../forms/Input2';
import styles from '../../styles/Couple/GroupDropdown.module.css';
import { ReactComponent as CirclePlus } from '../../assets/circle-plus.svg';
import { ReactComponent as CircleMinus } from '../../assets/circle-minus.svg';
import { ReactComponent as CaretDown } from '../../assets/angle-down.svg';

interface GroupDropdownProps {
  selectedGroup: string | null;
  onSelectGroup: (groupName: string) => void;
}

const GroupDropdown: React.FC<GroupDropdownProps> = ({
  selectedGroup,
  onSelectGroup,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const groups = useSelector((state: RootState) => state.guestList.groups);
  const coupleId = useSelector((state: RootState) => state.auth.user?.coupleProfile?.coupleId);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAddingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      // Resetowanie stanu dla dodawania nowej grupy przy otwieraniu
      setAddingGroup(false);
      setNewGroupName('');
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    // Resetowanie stanu przy zamykaniu menu
    setAddingGroup(false);
    setNewGroupName('');
  };

  const handleAddGroup = async () => {
    if (newGroupName.trim() && coupleId) {
      await dispatch(addGroup({ coupleId, groupName: newGroupName }));
      setNewGroupName('');
      setAddingGroup(false);
      dispatch(fetchGroups(coupleId));
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    await dispatch(deleteGroup(groupId));
  };

  const handleSelectGroup = (groupName: string) => {
    onSelectGroup(groupName);
    closeDropdown(); // Zamknięcie menu po wyborze grupy
  };

  // Zamknięcie menu, gdy klikniemy poza dropdownem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      {/* Przycisk rozwijający */}
      <div className={styles.dropdownButton} onClick={toggleDropdown}>
        {selectedGroup || 'Wybierz grupę *'}
        <CaretDown
          className={`${styles.caretIcon} ${
            isDropdownOpen ? styles.rotated : ''
          }`}
        />
      </div>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {/* Lista grup */}
          {groups.map((group) => (
            <div
              className={`${styles.dropdownRow} ${
                group.groupName === selectedGroup ? styles.activeRow : ''
              }`}
              key={group.groupId}
              onClick={() => handleSelectGroup(group.groupName)}
            >
              <div className={styles.groupName}>{group.groupName}</div>
              <CircleMinus
                className={styles.iconButton}
                onClick={(e) => {
                  e.stopPropagation(); // Zapobiegaj wyborowi grupy przy usuwaniu
                  handleDeleteGroup(group.groupId);
                }}
              />
            </div>
          ))}

          {/* Opcja dodania nowej grupy */}
          {!isAddingGroup ? (
            <div
              className={styles.dropdownRow}
              onClick={() => setAddingGroup(true)}
            >
              <div className={styles.addNewGroup}>+ Dodaj nową grupę</div>
              <CirclePlus className={styles.iconButton} />
            </div>
          ) : (
            <div className={styles.addGroupRow}>
              <Input2
                placeholder="Wpisz nazwę ..."
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <CirclePlus
                className={styles.iconButton}
                onClick={handleAddGroup}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
