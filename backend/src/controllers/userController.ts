import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { Vendor } from '../models/vendor';
import { Couple } from '../models/couple';
import { UserNotificationSetting } from '../models/userNotificationSetting';
import { Op } from 'sequelize';
import { NotificationService } from '../services/NotificationService';

interface CustomRequest extends Request {
  user?: { userId: number; userType: string };
}

export const updateUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId; // Pobieramy ID użytkownika z tokenu JWT
  const { email, password, phoneNumber, weddingDate, partner1Name, partner2Name } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'Brak autoryzacji. Zaloguj się, aby kontynuować.' });
    return;
  }

  if (!email && !password && !phoneNumber && !weddingDate && !partner1Name && !partner2Name) {
    res.status(400).json({ message: 'Musisz podać przynajmniej jedno pole do aktualizacji.' });
    return;
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
      return;
    }

    let notifications: { message: string; eventType: string }[] = [];
    let emailNotifications: string[] = [];

    // Aktualizacja danych w tabeli User
    if (email && email !== user.email) {
      user.email = email;
      notifications.push({
        message: 'Adres e-mail został zaktualizowany.',
        eventType: 'account_change',
      });
      emailNotifications.push('Twój adres e-mail został zaktualizowany.');
    }

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
      notifications.push({
        message: 'Hasło zostało zaktualizowane.',
        eventType: 'account_change',
      });
      emailNotifications.push('Twoje hasło zostało zaktualizowane.');
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      notifications.push({
        message: 'Numer telefonu został zaktualizowany.',
        eventType: 'account_change',
      });
      emailNotifications.push('Twój numer telefonu został zaktualizowany.');
    }

    await user.save();

    if (user.userType === 'couple') {
      let couple = await Couple.findOne({ where: { coupleId: userId } });

      if (!couple) {
        couple = await Couple.create({
          coupleId: userId,
          weddingDate,
          partner1Name,
          partner2Name,
        });
      } else {
        if (weddingDate && weddingDate !== couple.weddingDate) {
          couple.weddingDate = weddingDate;
          notifications.push({
            message: 'Data ślubu została zaktualizowana.',
            eventType: 'account_change',
          });
          emailNotifications.push('Data ślubu została zaktualizowana.');
        }
        if (partner1Name && partner1Name !== couple.partner1Name) {
          couple.partner1Name = partner1Name;
          notifications.push({
            message: 'Imię zostało zaktualizowane.',
            eventType: 'account_change',
          });
          emailNotifications.push('Imię Partnera zostało zaktualizowane.');
        }
        if (partner2Name && partner2Name !== couple.partner2Name) {
          couple.partner2Name = partner2Name;
          notifications.push({
            message: 'Imię zostało zaktualizowane.',
            eventType: 'account_change',
          });
          emailNotifications.push('Imię Partnerki zostało zaktualizowane.');
        }

        await couple.save();
      }
    } else if (weddingDate || partner1Name || partner2Name) {
      res.status(403).json({ message: 'Brak uprawnień do aktualizacji tych danych.' });
      return;
    }

    // Wysyłanie powiadomień aplikacyjnych
    for (const notification of notifications) {
      await NotificationService.createAutomaticNotification({
        userId,
        message: notification.message,
        eventType: notification.eventType,
        notificationType: 'app',
      });
    }

    // Wysyłanie powiadomień e-mail
    if (emailNotifications.length > 0) {
      const emailMessage = emailNotifications.join('<br>'); // Połącz wiadomości w HTML
      await NotificationService.sendEmailNotification(userId, emailMessage, 'account_change');
    }

    res.status(200).json({ message: 'Dane użytkownika zostały zaktualizowane.' });
  } catch (error) {
    console.error('Błąd podczas aktualizacji użytkownika:', error);
    next(error);
  }
};





export const getUserDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID.' });
    return;
  }

  try {
    // Pobranie użytkownika z ustawieniami powiadomień
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { model: UserNotificationSetting, as: 'notificationSettings' },
        { model: Vendor, as: 'vendorProfile' },
        { model: Couple, as: 'coupleProfile' },
      ],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Sprawdź, czy użytkownik ma ustawienia powiadomień
    if (!user.notificationSettings || user.notificationSettings.length === 0) {
      const baseNotifications = [
        { notificationType: 'email', eventType: 'account_change', isEnabled: true },
        { notificationType: 'email', eventType: 'new_device_login', isEnabled: true },
        { notificationType: 'email', eventType: 'payment_reminder', isEnabled: true },
        { notificationType: 'email', eventType: 'monthly_report', isEnabled: true },
        { notificationType: 'sms', eventType: 'account_change', isEnabled: true },
        { notificationType: 'sms', eventType: 'new_device_login', isEnabled: true },
        { notificationType: 'sms', eventType: 'payment_reminder', isEnabled: true },
        { notificationType: 'sms', eventType: 'monthly_report', isEnabled: true },
      ];

      // Dodanie powiadomień specyficznych dla typu użytkownika
      if (user.userType === 'vendor') {
        baseNotifications.push(
          { notificationType: 'email', eventType: 'new_review', isEnabled: true },
          { notificationType: 'email', eventType: 'new_message', isEnabled: true },
          { notificationType: 'sms', eventType: 'new_review', isEnabled: true },
          { notificationType: 'sms', eventType: 'new_message', isEnabled: true }
        );
      } else if (user.userType === 'couple') {
        baseNotifications.push(
          { notificationType: 'email', eventType: 'new_message', isEnabled: true },
          { notificationType: 'sms', eventType: 'new_message', isEnabled: true }
        );
      }

      const defaultNotifications = baseNotifications.map((notification) => ({
        userId: user.id,
        notificationType: notification.notificationType as 'email' | 'sms',
        eventType: notification.eventType as
          | 'account_change'
          | 'new_device_login'
          | 'payment_reminder'
          | 'new_review'
          | 'monthly_report'
          | 'new_message'
          | 'new_activity',
        isEnabled: notification.isEnabled,
      }));

      // Tworzenie domyślnych powiadomień
      await UserNotificationSetting.bulkCreate(defaultNotifications);

      // Pobranie ponownie użytkownika z dodanymi ustawieniami
      const updatedUser = await User.findOne({
        where: { id: userId },
        include: [
          { model: UserNotificationSetting, as: 'notificationSettings' },
          { model: Vendor, as: 'vendorProfile' },
          { model: Couple, as: 'coupleProfile' },
        ],
      });

      res.status(200).json(updatedUser);
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    next(error);
  }
};

export const updateNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Logowanie danych przychodzących
  console.log('--- START: updateNotificationSetting ---');
  console.log('Request body:', req.body);

  const { userId, notificationType, eventType, isEnabled } = req.body;

  // Walidacja danych wejściowych
  if (!userId || !notificationType || !eventType || isEnabled === undefined) {
    console.error('Validation failed: Missing required fields');
    res.status(400).json({
      message:
        'Missing required fields: userId, notificationType, eventType, or isEnabled.',
    });
    return;
  }

  console.log('Validation passed');
  console.log(`userId: ${userId}, notificationType: ${notificationType}, eventType: ${eventType}, isEnabled: ${isEnabled}`);

  try {
    // Logowanie przed wykonaniem zapytania do bazy danych
    console.log('Attempting to find the notification setting in the database...');
    const setting = await UserNotificationSetting.findOne({
      where: {
        userId,
        notificationType,
        eventType,
      },
    });

    // Logowanie wyniku zapytania
    if (setting) {
      console.log('Notification setting found:', setting.toJSON());
    } else {
      console.error('Notification setting not found');
      res.status(404).json({
        message:
          'Notification setting not found for the given userId, notificationType, and eventType.',
      });
      return;
    }

    // Aktualizacja pola isEnabled
    console.log('Updating the isEnabled field...');
    setting.isEnabled = isEnabled;
    await setting.save();
    console.log('Update successful');

    // Odpowiedź
    res.status(200).json({
      message: 'Notification setting updated successfully.',
      updatedSetting: setting,
    });
    console.log('--- END: updateNotificationSetting ---');
  } catch (error) {
    // Logowanie błędów
    console.error('Error during updateNotificationSetting:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



export const updateCoupleDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { coupleId, weddingDate, partner1Name, partner2Name } = req.body;

  if (!coupleId) {
    res.status(400).json({ message: 'coupleId is required.' });
    return;
  }

  try {
    // Znajdź rekord w tabeli Couples
    const couple = await Couple.findOne({ where: { coupleId } });

    if (!couple) {
      // Jeśli rekord nie istnieje, utwórz nowy
      const newCouple = await Couple.create({
        coupleId,
        weddingDate,
        partner1Name,
        partner2Name,
      });
      res.status(201).json({ message: 'Couple details created successfully.', couple: newCouple });
      return;
    }

    // Aktualizuj tylko podane kolumny
    if (weddingDate) {
      couple.weddingDate = weddingDate;
    }
    if (partner1Name) {
      couple.partner1Name = partner1Name;
    }
    if (partner2Name) {
      couple.partner2Name = partner2Name;
    }

    await couple.save();

    res.status(200).json({ message: 'Couple details updated successfully.', couple });
  } catch (error) {
    console.error('Error updating couple details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId, status } = req.body;

  // Sprawdzenie poprawności danych wejściowych
  if (!userId || !status) {
    res.status(400).json({ message: 'Musisz podać ID użytkownika oraz nowy status.' });
    return;
  }

  // Dozwolone statusy
  const allowedStatuses = ['active', 'blocked', 'deactivated', 'deleted'];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ message: `Nieprawidłowy status. Dozwolone statusy to: ${allowedStatuses.join(', ')}` });
    return;
  }

  try {
    // Pobranie użytkownika z bazy danych
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
      return;
    }

    // Aktualizacja statusu
    user.status = status;
    await user.save();

    res.status(200).json({ message: 'Status użytkownika został zaktualizowany.', user });
  } catch (error) {
    console.error('Błąd podczas aktualizacji statusu użytkownika:', error);
    next(error);
  }
};

import { RequestHandler } from 'express';

export const getUsers: RequestHandler = async (req, res, next) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
      res.status(400).json({ message: 'Nieprawidłowe parametry paginacji.' });
      return;
    }

    const offset = (pageNumber - 1) * limitNumber;

    const whereCondition = search
      ? {
          email: {
            [Op.like]: `%${search}%`, // Wyszukiwanie na podstawie fragmentu emaila
          },
        }
      : {};

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'email', 'userType', 'status', 'created_at', 'lastLoginAt'],
      offset,
      limit: limitNumber,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.status(200).json({
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
    });

  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    next(error);
  }
};
