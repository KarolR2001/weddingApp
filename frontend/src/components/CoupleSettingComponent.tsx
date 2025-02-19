import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import Toggle from './Toggle';
import Input2 from './forms/Input2';
import MiniButton from './MiniButton2';
import { RootState, AppDispatch } from '../redux/store';
import { fetchNotifications } from '../redux/slices/notificationsSlice'; 
import { loadUserFromLocalStorage } from '../redux/slices/authSlice'; // Import funkcji do zapisu danych w Redux
import styles from '../styles/SettingsComponent.module.css';

const CoupleSettingsComponent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const user = useSelector((state: RootState) => state.auth.user);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    emailaccountChange: true,
    emailnewDeviceLogin: true,
    emailpaymentReminder: true,
    emailnewMessage: true,
    emailmonthlyReport: true,
    SMSNotifications: true,
    SMSaccountChange: true,
    SMSnewDeviceLogin: true,
    SMSpaymentReminder: true,
    SMSnewMessage: true,
    SMSmonthlyReport: true,
  });

  const [formData, setFormData] = useState<{
    partner1Name: string;
    partner2Name: string;
    weddingDate: string;
    email: string;
    password: string;
    phoneNumber: string;
  }>({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  const [editMode, setEditMode] = useState({
    partner1Name: false,
    partner2Name: false,
    weddingDate: false,
    email: false,
    password: false,
    phoneNumber: false,
  });

  

   // Pobierz szczegóły użytkownika
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !token) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setFormData({
            partner1Name: userData.coupleProfile?.partner1Name || '',
          partner2Name: userData.coupleProfile?.partner2Name || '',
          weddingDate: userData.coupleProfile?.weddingDate || '',
          email: userData.email || '',
          password: '',
          phoneNumber: userData.phoneNumber || '',
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId, token]);



  const handleToggle = async (key: keyof typeof settings) => {
    console.log('--- START: handleToggle ---');
    console.log(`Toggle key: ${key}`);
  
    if (key === 'emailNotifications' || key === 'SMSNotifications') {
      const isParentEnabled = !settings[key]; // Czy przełącznik nadrzędny będzie włączony czy wyłączony
      const groupPrefix = key === 'emailNotifications' ? 'email' : 'SMS';
  
      console.log(`Toggling group: ${groupPrefix}, new state: ${isParentEnabled}`);
  
      // Zaktualizuj wszystkie przełączniki w grupie (włącznie z głównym)
      const updatedSettings = { ...settings };
  
      Object.keys(settings).forEach((settingKey) => {
        if (settingKey.startsWith(groupPrefix)) {
          updatedSettings[settingKey as keyof typeof settings] = isParentEnabled;
        }
      });
  
      setSettings(updatedSettings);
      console.log('Updated settings after toggling parent:', updatedSettings);
  
      // Wyślij zmiany do backendu dla każdego przełącznika w grupie
      for (const childKey of Object.keys(updatedSettings)) {
        if (childKey.startsWith(groupPrefix)) {
          const isEnabled = updatedSettings[childKey as keyof typeof settings];
          if (childKey !== `${groupPrefix}Notifications`) {
            await sendToggleUpdate(childKey as keyof typeof settings, isEnabled);
          }
        }
      }
    } else {
      // Jeśli podprzełącznik
      const [notificationType, eventTypeCamelCase] = key
        .replace('email', 'email.')
        .replace('SMS', 'sms.')
        .split('.');
  
      const eventType = eventTypeCamelCase
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase();
  
      const isEnabled = !settings[key];
      console.log(`Toggling single key: ${key}, new state: ${isEnabled}`);
  
      // Zaktualizuj stan lokalny dla podprzełącznika
      const updatedSettings = {
        ...settings,
        [key]: isEnabled,
      };
  
      // Synchronizuj główny przełącznik
      const groupPrefix = key.startsWith('email') ? 'email' : 'SMS';
      const groupKeys = Object.keys(updatedSettings).filter(
        (settingKey) => settingKey.startsWith(groupPrefix) && settingKey !== `${groupPrefix}Notifications`
      );
  
      const isGroupEnabled = groupKeys.some((settingKey) => updatedSettings[settingKey as keyof typeof settings]);
      updatedSettings[`${groupPrefix}Notifications` as keyof typeof settings] = isGroupEnabled;
  
      setSettings(updatedSettings);
      console.log('Updated settings after toggling child:', updatedSettings);
  
      // Wyślij zmiany do backendu dla podprzełącznika
      await sendToggleUpdate(key, isEnabled);
    }
  
    console.log('--- END: handleToggle ---');
  };
  
const sendToggleUpdate = async (key: keyof typeof settings, isEnabled: boolean) => {
  const [notificationType, eventTypeCamelCase] = key
    .replace('email', 'email.')
    .replace('SMS', 'sms.')
    .split('.');

  const eventType = eventTypeCamelCase
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();

  const requestBody = {
    userId,
    notificationType,
    eventType,
    isEnabled,
  };

  console.log('Sending update to backend:', requestBody);

  try {
    const response = await axios.put(
      `http://localhost:5000/api/users/update-setting`,
      requestBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Backend response:', response.data);
  } catch (error) {
    console.error('Error while updating backend:', error);
  }
};


const startEditing = (field: keyof typeof formData) => {
    setEditMode((prev) => ({ ...prev, [field]: true }));
  };

  const cancelEditing = (field: keyof typeof formData) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
  };
  const saveChanges = async (field: keyof typeof formData) => {
    try {
      const endpoint = 'http://localhost:5000/api/users/update';
      const data = { [field]: formData[field] };

      await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode((prev) => ({ ...prev, [field]: false }));

     // Zaktualizuj localStorage
     const updatedUser = {
        ...user, // Zachowaj istniejące właściwości użytkownika
        coupleProfile: {
          ...user?.coupleProfile,
          partner1Name: formData.partner1Name,
          partner2Name: formData.partner2Name,
          weddingDate: formData.weddingDate,
        },
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };
  
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      // Załaduj zmienione dane z localStorage do Redux
      dispatch(loadUserFromLocalStorage());
      if (userId) {
        dispatch(fetchNotifications(userId));
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };


  const toggleAccountStatus = async () => {
  try {
    const endpoint = 'http://localhost:5000/api/users/status';
    const newStatus = user?.status === 'active' ? 'deactivated' : 'active';

    const data = {
      userId,
      status: newStatus,
    };

    console.log('Sending account status update to API:', data);

    const response = await axios.put(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('API response:', response.data);
// Zaktualizuj localStorage
    const updatedUser = { ...user, status: newStatus };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch(loadUserFromLocalStorage());
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  } catch (error) {
    console.error('Error updating account status:', error);
  }
};
  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.header}>Ustawienia</h1>
      <div className={styles.content}>
       {/* Powiadomienia e-mail */}
<div className={styles.settingsInContainer}>
  <div className={`${styles.settingRow} ${styles.headerRow}`}>
    <div className={styles.settingLabel}>Powiadomienia e-mail</div>
    <Toggle
      isOn={settings.emailNotifications}
      onToggle={() => handleToggle('emailNotifications')}
    />
  </div>
  {[
    { key: 'accountChange', label: 'Zmiana danych konta' },
    { key: 'newDeviceLogin', label: 'Logowanie z nowego urządzenia' },
   // { key: 'paymentReminder', label: 'Przypomnienie o płatnościach' },
    { key: 'newMessage', label: 'Nowa wiadomość' },
   // { key: 'monthlyReport', label: 'Miesięczny raport' },
  ].map(({ key, label }) => (
    <div key={`email${key}`} className={styles.settingRow}>
      <div className={styles.settingLabel}>{label}</div>
      <Toggle
        isOn={settings[`email${key}` as keyof typeof settings]}
        onToggle={() => handleToggle(`email${key}` as keyof typeof settings)}
      />
    </div>
  ))}
</div>

{/* Powiadomienia SMS */}
{/* <div className={styles.settingsInContainer}>
  <div className={`${styles.settingRow} ${styles.headerRow}`}>
    <div className={styles.settingLabel}>Powiadomienia SMS</div>
    <Toggle
      isOn={settings.SMSNotifications}
      onToggle={() => handleToggle('SMSNotifications')}
    />
  </div>
  {[
    { key: 'accountChange', label: 'Zmiana danych konta' },
    { key: 'newDeviceLogin', label: 'Logowanie z nowego urządzenia' },
    { key: 'paymentReminder', label: 'Przypomnienie o płatnościach' },
    { key: 'newMessage', label: 'Nowa wiadomość' },
    { key: 'monthlyReport', label: 'Miesięczny raport' },
  ].map(({ key, label }) => (
    <div key={`SMS${key}`} className={styles.settingRow}>
      <div className={styles.settingLabel}>{label}</div>
      <Toggle
        isOn={settings[`SMS${key}` as keyof typeof settings]}
        onToggle={() => handleToggle(`SMS${key}` as keyof typeof settings)}
      />
    </div>
  ))}
</div> */}


{/* General Settings */}
<div className={styles.settingsInContainer}>
      {/* Imię Pani Młodej */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>Imię Pani Młodej:
        {editMode.partner1Name ? (
            <div className={styles.inputContainer}>
          <Input2
            type="text"
            placeholder="Imię Pani Młodej"
            value={formData.partner1Name}
            onChange={(e) => handleInputChange(e, 'partner1Name')}
          />
          </div>
        ) : (
          <span>{formData.partner1Name}</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.partner1Name ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.partner1Name ? saveChanges('partner1Name') : startEditing('partner1Name')
            }
          />
          {editMode.partner1Name && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('partner1Name')}
            />
          )}
        </div>
      </div>

      {/* Imię Pana Młodego */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>Imię Pana Młodego:
        {editMode.partner2Name ? (
          <Input2
            type="text"
            placeholder="Imię Pana Młodego"
            value={formData.partner2Name}
            onChange={(e) => handleInputChange(e, 'partner2Name')}
          />
        ) : (
          <span>{formData.partner2Name}</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.partner2Name ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.partner2Name ? saveChanges('partner2Name') : startEditing('partner2Name')
            }
          />
          {editMode.partner2Name && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('partner2Name')}
            />
          )}
        </div>
      </div>

      {/* Data przyjęcia */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>Data przyjęcia:
        {editMode.weddingDate ? (
          <Input2
            type="date"
            placeholder="Data przyjęcia"
            value={formData.weddingDate}
            onChange={(e) => handleInputChange(e, 'weddingDate')}
          />
        ) : (
          <span>{formData.weddingDate}</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.weddingDate ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.weddingDate ? saveChanges('weddingDate') : startEditing('weddingDate')
            }
          />
          {editMode.weddingDate && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('weddingDate')}
            />
          )}
        </div>
      </div>

      {/* Email */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>E-mail:
        {editMode.email ? (
          <Input2
            type="email"
            placeholder="Podaj nowy adres e-mail"
            value={formData.email}
            onChange={(e) => handleInputChange(e, 'email')}
          />
          
        ) : (
          <span>{formData.email}</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.email ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.email ? saveChanges('email') : startEditing('email')
            }
          />
          {editMode.email && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('email')}
            />
          )}
        </div>
      </div>

      {/* Hasło */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>Hasło:
        {editMode.password ? (
          <Input2
            type="password"
            placeholder="Podaj nowe hasło"
            value={formData.password}
            onChange={(e) => handleInputChange(e, 'password')}
          />
        ) : (
          <span>********</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.password ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.password ? saveChanges('password') : startEditing('password')
            }
          />
          {editMode.password && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('password')}
            />
          )}
        </div>
      </div>

      {/* Numer telefonu */}
      <div className={styles.settingRow}>
        <div className={styles.settingLabel}>Numer telefonu:
        {editMode.phoneNumber ? (
          <Input2
            type="text"
            placeholder="Podaj nowy numer telefonu"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange(e, 'phoneNumber')}
          />
        ) : (
          <span>{formData.phoneNumber}</span>
        )}
        </div>
        <div className={styles.buttonGroup}>
          <MiniButton
            label={editMode.phoneNumber ? 'Zapisz' : 'Zmień'}
            onClick={() =>
              editMode.phoneNumber ? saveChanges('phoneNumber') : startEditing('phoneNumber')
            }
          />
          {editMode.phoneNumber && (
            <MiniButton
              label="Anuluj"
              onClick={() => cancelEditing('phoneNumber')}
            />
          )}
        </div>
      </div>
      {/* Dezaktywacja / Aktywacja */}
      <div className={styles.settingRow}>
    <div className={styles.settingLabel}>Dezaktywacja konta:</div>
    <div className={styles.buttonGroup}>
      <MiniButton
        label={user?.status === 'active' ? 'Dezaktywuj' : 'Aktywuj'}
        onClick={toggleAccountStatus}
      />
    </div>
  </div>
    </div>
    </div>
    </div>
  );
};

export default CoupleSettingsComponent;