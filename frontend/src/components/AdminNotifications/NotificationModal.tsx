import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, fetchCategories, fetchUserIdsByFilters } from '../../redux/slices/recipientsSlice';
import { addAdminNotification } from '../../redux/slices/adminNotificationsSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Toggle from '../Toggle';
import Input2 from '../forms/Input2';
import Textarea from '../Textarea';
import Checkbox from '../Checkbox';
import Dropdown5 from '../Dropdown5';
import Button1 from '../Button2';
import Button2 from '../Button1';
import styles from '../../styles/Admin/Notifications/NotificationModal.module.css';

interface NotificationModalProps { onClose: () => void; }

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const { users, categories, statuses, userIds } = useSelector((state: RootState) => state.recipients);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationTypes, setNotificationTypes] = useState({ email: false, sms: false, app: true });
  const [recipientType, setRecipientType] = useState<string>('');
  const [individualUser, setIndividualUser] = useState<number | null>(null);
  const [selectedGroupOption, setSelectedGroupOption] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => { dispatch(fetchUsers({ page: 1, limit: 40 })); dispatch(fetchCategories()); }, [dispatch]);

  const handleNotificationTypeChange = (type: keyof typeof notificationTypes) => {
    setNotificationTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleRecipientChange = (type: string) => {
    setRecipientType(type); setIndividualUser(null); setSelectedGroupOption(''); setSelectedCategory(null); setSelectedStatus(null);
  };

  const handleGroupOptionChange = async (option: string) => {
    setSelectedGroupOption(option); const filters: any = {};
    if (option === 'vendors') filters.userType = 'vendor';
    else if (option === 'couples') filters.userType = 'couple';
    else if (option === 'category' && selectedCategory) filters.categoryId = selectedCategory;
    else if (option === 'status' && selectedStatus) filters.status = selectedStatus;
    if (Object.keys(filters).length > 0) dispatch(fetchUserIdsByFilters(filters));
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId); if (selectedGroupOption === 'category') dispatch(fetchUserIdsByFilters({ categoryId }));
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status); if (selectedGroupOption === 'status') dispatch(fetchUserIdsByFilters({ status }));
  };
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Tytuł powiadomienia jest wymagany.';
    if (!message.trim()) newErrors.message = 'Treść powiadomienia jest wymagana.';
    if (!notificationTypes.email && !notificationTypes.sms && !notificationTypes.app) {
      newErrors.notificationTypes = 'Wybierz co najmniej jeden typ powiadomienia.';
    }
    if (!recipientType) {
      newErrors.recipientType = 'Wybierz typ odbiorcy.';
    } else if (recipientType === 'individual' && !individualUser) {
      newErrors.individualUser = 'Wybierz użytkownika.';
    } else if (recipientType === 'group' && !selectedGroupOption) {
      newErrors.groupOption = 'Wybierz grupę odbiorców.';
    } else if (selectedGroupOption === 'category' && !selectedCategory) {
      newErrors.category = 'Wybierz kategorię.';
    } else if (selectedGroupOption === 'status' && !selectedStatus) {
      newErrors.status = 'Wybierz status konta.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return alert('Uzupełnij wszystkie dane !!!');

    let recipientIds: number[] = []; let recipientsGroup = '';
    if (recipientType === 'all') {
      const allUsers = await dispatch(fetchUserIdsByFilters({})).unwrap();
      recipientIds = allUsers; recipientsGroup = 'Wszyscy użytkownicy';
    } else if (recipientType === 'individual' && individualUser) {
      recipientIds = [individualUser];
      recipientsGroup = users.find((user) => user.id === individualUser) ? 'Indywidualny wybór' : 'Indywidualny wybór';
    } else if (recipientType === 'group') {
      recipientIds = userIds;
      if (selectedGroupOption === 'vendors') recipientsGroup = 'Usługodawcy';
      else if (selectedGroupOption === 'couples') recipientsGroup = 'Pary Młode';
      else if (selectedGroupOption === 'category' && selectedCategory !== null) {
        recipientsGroup = categories.find((cat) => cat.category_id === selectedCategory)?.categoryName || 'Kategoria';
      } else if (selectedGroupOption === 'status' && selectedStatus) {
        recipientsGroup = `Status konta: ${selectedStatus}`;
      }
    }
    const notificationData = {
      title, message,
      notificationType: Object.entries(notificationTypes).filter(([_, isOn]) => isOn).map(([type]) => type).join(','),
      recipientsGroup, recipientIds,
    };
    try { await dispatch(addAdminNotification(notificationData)).unwrap(); onClose(); }
    catch (error) { console.error('Błąd podczas wysyłania powiadomienia:', error); }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerModal}>
          <h2 className={styles.title}>Nowe Powiadomienie</h2>
          <div className={styles.actions}>
            {/* <Button2 label='Anuluj' onClick={onClose}/> */}
            <Button1 label='Wyślij' onClick={handleSubmit}/>
          </div>
        </div>
        <Input2 placeholder="Tytuł powiadomienia *" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Treść powiadomienia *" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className={styles.notificationTypes}>
          <div className={styles.label}>Wybierz typ powiadominia:</div>
          <div className={styles.notificationToggles}>
            <label className={styles.toggle}><span>E-mail:</span><Toggle isOn={notificationTypes.email} onToggle={() => handleNotificationTypeChange('email')} /></label>
            {/* <label className={styles.toggle}><span>SMS:</span><Toggle isOn={notificationTypes.sms} onToggle={() => handleNotificationTypeChange('sms')} /></label> */}
            <label className={styles.toggle}><span>Wewnątrz aplikacji:</span><Toggle isOn={notificationTypes.app} onToggle={() => handleNotificationTypeChange('app')} /></label>
          </div>
        </div>
        <div className={styles.recipients}>
          <div className={styles.label}>Wybierz odbiorców powiadomienia:</div>
          <div className={styles.notificationRecipientsGroups}>
            <Checkbox label="Wszyscy użytkownicy" checked={recipientType === 'all'} onChange={() => handleRecipientChange('all')} />
            <Checkbox label="Indywidualny wybór" checked={recipientType === 'individual'} onChange={() => handleRecipientChange('individual')} />
            <Checkbox label="Wybrana grupa" checked={recipientType === 'group'} onChange={() => handleRecipientChange('group')} />
          </div>
          <div className={styles.optionsGroup}>
            {recipientType === 'individual' && (
              <Dropdown5
                label="Wybierz użytkownika"
                options={users.map((user) => user.email)}
                onSelect={(option) => setIndividualUser(users.find((user) => user.email === option)?.id || null)}
              />
            )}
            {recipientType === 'group' && (
              <div className={styles.optionsGroup}>
                <Checkbox label="Usługodawcy" checked={selectedGroupOption === 'vendors'} onChange={() => handleGroupOptionChange('vendors')} />
                <Checkbox label="Pary Młode" checked={selectedGroupOption === 'couples'} onChange={() => handleGroupOptionChange('couples')} />
                <div className={styles.inlineGroup}>
                  <Checkbox label="" checked={selectedGroupOption === 'category'} onChange={() => handleGroupOptionChange('category')} />
                  <Dropdown5
                    label="Wybierz kategorię"
                    options={categories.map((category) => category.categoryName)}
                    onSelect={(option) => handleCategoryChange(categories.find((cat) => cat.categoryName === option)?.category_id || 0)}
                    disabled={selectedGroupOption !== 'category'}
                  />
                </div>
                <div className={styles.inlineGroup}>
                  <Checkbox label="" checked={selectedGroupOption === 'status'} onChange={() => handleGroupOptionChange('status')} />
                  <Dropdown5
                    label="Wybierz status"
                    options={statuses}
                    onSelect={(option) => handleStatusChange(option)}
                    disabled={selectedGroupOption !== 'status'}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default NotificationModal;
