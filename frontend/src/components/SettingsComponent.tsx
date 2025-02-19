import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import Toggle from './Toggle';
import Input2 from './forms/Input2';
import MiniButton from './MiniButton2';
import { RootState, AppDispatch } from '../redux/store';
import { fetchNotifications } from '../redux/slices/notificationsSlice'; 
import { setUserDetails } from '../redux/slices/userSlice'; // Import funkcji do zapisu danych w Redux
import styles from '../styles/SettingsComponent.module.css';

const SettingsComponent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    emailaccountChange: true,
    emailnewDeviceLogin: true,
    emailnewMessage: true,
    emailnewReview: true,
    emailmonthlyReport: true,
    SMSNotifications: true,
    SMSaccountChange: true,
    SMSnewDeviceLogin: true,
    SMSnewMessage: true,
    SMSnewReview: true,
    SMSmonthlyReport: true,
  });

  const [editMode, setEditMode] = useState<{
    email: boolean;
    password: boolean;
    phoneNumber: boolean;
  }>({
    email: false,
    password: false,
    phoneNumber: false,
  });

  const [formData, setFormData] = useState({
    email: 'e-mail', // Replace with the actual email from Redux
    password: 'Hasło', // Default placeholder, replace securely
    phoneNumber: 'Tel', // Replace with the actual phone number from Redux
  });
  const [originalData, setOriginalData] = useState({
    email: 'e-mail',
    password: 'Hasło', // Puste, bo hasła nie przechowujemy w Redux
    phoneNumber: 'Tel',
  });
  

  // Funkcja do pobrania szczegółów użytkownika
  const fetchUserDetails = async () => {
    console.log('--- START: fetchUserDetails ---');

    try {
      if (!userId || !token) {
        console.error('Missing userId or token');
        return;
      }

      console.log(`Fetching details for userId: ${userId} with token: ${token}`);

      const response = await axios.get(`http://localhost:5000/api/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response from /details endpoint:', response.data);

      const userData = response.data;

      // Zapisz dane użytkownika do Redux
      console.log('Dispatching user details to Redux');
      dispatch(setUserDetails(userData));

      // Ustaw dane do stanu lokalnego
      setFormData({
        email: userData.email || '',
        password: '', // Hasła nie przechowujemy w Redux
        phoneNumber: userData.phoneNumber || '',
      });

      setOriginalData({
        email: userData.email || '',
        password: '',
        phoneNumber: userData.phoneNumber || '',
      });

      // Ustawienia powiadomień
      const emailSettings = userData.notificationSettings.filter(
        (n: any) => n.notificationType === 'email'
      );
      const smsSettings = userData.notificationSettings.filter(
        (n: any) => n.notificationType === 'sms'
      );

      console.log('Email settings:', emailSettings);
      console.log('SMS settings:', smsSettings);

      setSettings({
        emailNotifications: emailSettings.every((s: any) => s.isEnabled),
        emailaccountChange: emailSettings.find((s: any) => s.eventType === 'account_change')?.isEnabled ?? true,
        emailnewDeviceLogin: emailSettings.find((s: any) => s.eventType === 'new_device_login')?.isEnabled ?? true,
        emailnewMessage: emailSettings.find((s: any) => s.eventType === 'new_message')?.isEnabled ?? true,
        emailnewReview: emailSettings.find((s: any) => s.eventType === 'new_review')?.isEnabled ?? true,
        emailmonthlyReport: emailSettings.find((s: any) => s.eventType === 'monthly_report')?.isEnabled ?? true,
        SMSNotifications: smsSettings.every((s: any) => s.isEnabled),
        SMSaccountChange: smsSettings.find((s: any) => s.eventType === 'account_change')?.isEnabled ?? true,
        SMSnewDeviceLogin: smsSettings.find((s: any) => s.eventType === 'new_device_login')?.isEnabled ?? true,
        SMSnewMessage: smsSettings.find((s: any) => s.eventType === 'new_message')?.isEnabled ?? true,
        SMSnewReview: smsSettings.find((s: any) => s.eventType === 'new_review')?.isEnabled ?? true,
        SMSmonthlyReport: smsSettings.find((s: any) => s.eventType === 'monthly_report')?.isEnabled ?? true,
      });

      console.log('Updated settings:', settings);
    } catch (error) {
      console.error('Error while fetching user details:', error);
    }

    console.log('--- END: fetchUserDetails ---');
  };

  // Wywołaj fetchUserDetails po załadowaniu komponentu
  useEffect(() => {
    if (userId && token) {
      fetchUserDetails();
    }
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


  const startEditing = (field: 'email' | 'password' | 'phoneNumber') => {
    setOriginalData((prev) => ({ ...prev, [field]: formData[field] }));
    setEditMode((prev) => ({ ...prev, [field]: true }));
  };
  const cancelEditing = (field: 'email' | 'password' | 'phoneNumber') => {
    setFormData((prev) => ({ ...prev, [field]: originalData[field] }));
    setEditMode((prev) => ({ ...prev, [field]: false }));
  };
  const saveChanges = async (field: 'email' | 'password' | 'phoneNumber') => {
    try {
      const endpoint = 'http://localhost:5000/api/users/update';
      const data: Partial<typeof formData> = { [field]: formData[field] };

      await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode((prev) => ({ ...prev, [field]: false }));
      
      if (userId) {
        dispatch(fetchNotifications(userId)); // Typowany dispatch
      }

    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
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
    { key: 'newMessage', label: 'Nowa wiadomość' },
    { key: 'newReview', label: 'Nowa opinia klienta' },
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
    { key: 'newMessage', label: 'Nowa wiadomość' },
    { key: 'newReview', label: 'Nowa opinia klienta' },
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
  <div className={`${styles.settingRow} ${styles.headerRow}`}>
    <div className={styles.settingLabel}>Ogólne</div>
  </div>
  
  {/* Email Change */}
  <div className={styles.settingRow}>
    <div className={styles.settingLabel}>
      Zmień adres e-mail:
      {editMode.email ? (
        <div className={styles.inputContainer}>
          <Input2
            type="email"
            placeholder="Podaj nowy adres e-mail"
            value={formData.email}
            onChange={(e) => handleInputChange(e, 'email')}
          />
        </div>
      ) : (
        ` ${formData.email.replace(/.(?=.{4}@)/g, '*')}`
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
  
  {/* Password Change */}
  <div className={styles.settingRow}>
    <div className={styles.settingLabel}>
      Zmień hasło:
      {editMode.password ? (
        <div className={styles.inputContainer}>
          <Input2
            type="text"
            placeholder="Podaj nowe hasło"
            value={formData.password}
            onChange={(e) => handleInputChange(e, 'password')}
          />
        </div>
      ) : (
        ' ********'
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

  {/* Phone Number Change */}
  <div className={styles.settingRow}>
    <div className={styles.settingLabel}>
      Zmień nr telefonu:
      {editMode.phoneNumber ? (
        <div className={styles.inputContainer}>
          <Input2
            type="text"
            placeholder="Podaj nowy numer telefonu"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange(e, 'phoneNumber')}
          />
        </div>
      ) : (
        ` ${formData.phoneNumber.replace(/.(?=.{4})/g, '*')}`
      )}
    </div>
    <div className={styles.buttonGroup}>
      <MiniButton
        label={editMode.phoneNumber ? 'Zapisz' : 'Zmień'}
        onClick={() =>
          editMode.phoneNumber
            ? saveChanges('phoneNumber')
            : startEditing('phoneNumber')
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
</div>
</div>

    </div>
  );
};

export default SettingsComponent;
