import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Notification } from '../models/notification';
import { NotificationRecipient } from '../models/notificationRecipient';

// Pobieranie powiadomień dla administratora z paginacją, sortowaniem i filtrowaniem
export const getAdminNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { page = 1, limit = 10, search, sortBy = 'sentAt', order = 'DESC' } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { isAdminNotification: true };

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      attributes: ['notificationId', 'title', 'recipientsGroup', 'notificationType', 'sentAt', 'status'],
      order: [[sortBy as string, order as string]],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      notifications: notifications.rows,
      totalCount: notifications.count,
      currentPage: Number(page),
      totalPages: Math.ceil(notifications.count / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    next(error);
  }
};


// Usuwanie powiadomienia i powiązanych rekordów w NotificationRecipients
export const deleteAdminNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    await NotificationRecipient.destroy({ where: { notificationId: id } });
    await notification.destroy();

    res.status(200).json({ message: 'Notification and associated recipients deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    next(error);
  }
};

// Pobieranie szczegółowych informacji o powiadomieniu
export const getAdminNotificationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: NotificationRecipient,
          as: 'recipients',
          attributes: ['userId', 'isRead'],
        },
      ],
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error fetching notification details:', error);
    next(error);
  }
};
export const addAdminNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { title, message, notificationType, recipientsGroup, recipientIds } = req.body;

  try {
    const notification = await Notification.create({
      title,
      message,
      notificationType,
      recipientsGroup,
      isAdminNotification: true,
      status: 'sent',
    });

    const recipients = recipientIds.map((userId: number) => ({
      notificationId: notification.notificationId,
      userId,
    }));

    await NotificationRecipient.bulkCreate(recipients);

    res.status(201).json({ message: 'Notification created successfully.', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    next(error);
  }
};
export const resendAdminNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: NotificationRecipient,
          as: 'recipients',
        },
      ],
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    // Przetwórz ponowne wysyłanie (przykład dla 'app')
    if (notification.notificationType === 'app') {
      await NotificationRecipient.update({ isRead: false }, { where: { notificationId: id } });
    }

    res.status(200).json({ message: 'Notification resent successfully.' });
  } catch (error) {
    console.error('Error resending notification:', error);
    next(error);
  }
};

import { User } from '../models/user';
import { VendorListing } from '../models/vendorListing';


export const getUserIdsByFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userType, status, categoryId } = req.query;

  try {
    // Budowanie warunków
    const whereConditions: any = {};

    // Filtr na podstawie typu użytkownika
    if (userType) {
      whereConditions.userType = userType;
    }

    // Filtr na podstawie statusu konta
    if (status) {
      whereConditions.status = status;
    }

    // Jeśli wybrano kategorię ogłoszeń
    if (categoryId) {
      // Konwersja categoryId na liczbę
      const parsedCategoryId = Array.isArray(categoryId)
        ? parseInt(categoryId[0] as string, 10)
        : parseInt(categoryId as string, 10);

      if (isNaN(parsedCategoryId)) {
        res.status(400).json({ message: 'Invalid categoryId provided.' });
        return;
      }

      const vendorIds = await VendorListing.findAll({
        where: { categoryId: parsedCategoryId },
        attributes: ['vendorId'], // Pobierz tylko vendorId
        group: ['vendorId'], // Grupuj, aby uniknąć powtórzeń
      });

      const vendorIdArray = vendorIds.map((listing) => listing.vendorId);

      // Dodaj filtr dla `id` użytkowników typu `vendor`
      whereConditions.id = { [Op.in]: vendorIdArray };
    }

    // Pobierz użytkowników na podstawie warunków
    const users = await User.findAll({
      where: whereConditions,
      attributes: ['id'], // Zwracamy tylko ID
    });

    // Wyodrębnienie ID użytkowników do tablicy
    const userIds = users.map((user) => user.id);

    res.status(200).json({ userIds });
  } catch (error) {
    console.error('Error fetching user IDs:', error);
    next(error);
  }
};
