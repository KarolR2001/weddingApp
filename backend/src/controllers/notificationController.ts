import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/notification';
import { NotificationRecipient } from '../models/notificationRecipient';
import { User } from '../models/user';
import { sequelize } from '../config/database';

// Pobieranie wszystkich powiadomień dla danego użytkownika
export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
  
    try {
      // Pobieranie wszystkich nieprzeczytanych powiadomień typu 'app'
      const unreadNotifications = await NotificationRecipient.findAll({
        where: {
          userId,
          isRead: false,
        },
        include: [
          {
            model: Notification,
            as: 'notification', // Alias zdefiniowany w asocjacji
            attributes: [
              'notificationId',
              'message',
              'notificationType',
              'sentAt',
              'status',
              'attachmentUrl',
              'isAdminNotification',
            ],
            where: { notificationType: 'app' }, // Ograniczenie do typu 'app'
          },
        ],
        attributes: ['isRead'], // Pobierz isRead z NotificationRecipient
        order: [[sequelize.col('notification.sent_at'), 'DESC']], // Sortowanie według daty wysłania
      });
  
      // Pobieranie maksymalnie 4 przeczytanych powiadomień typu 'app'
      const readNotifications = await NotificationRecipient.findAll({
        where: {
          userId,
          isRead: true,
        },
        include: [
          {
            model: Notification,
            as: 'notification',
            attributes: [
              'notificationId',
              'message',
              'notificationType',
              'sentAt',
              'status',
              'attachmentUrl',
              'isAdminNotification',
            ],
            where: { notificationType: 'app' }, // Ograniczenie do typu 'app'
          },
        ],
        attributes: ['isRead'],
        order: [[sequelize.col('notification.sent_at'), 'DESC']],
        limit: 4, // Ograniczenie do 4 przeczytanych powiadomień
      });
  
      // Połączenie nieprzeczytanych i przeczytanych powiadomień
      const notifications = [...unreadNotifications, ...readNotifications];
  
      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      next(error);
    }
  };
  
  

// Oznaczanie powiadomienia jako przeczytane
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId, notificationId } = req.body;

  try {
    const recipient = await NotificationRecipient.findOne({
      where: { userId, notificationId },
    });

    if (!recipient) {
      res.status(404).json({ message: 'Powiadomienie nie zostało znalezione.' });
      return;
    }

    recipient.isRead = true;
    await recipient.save();

    res.status(200).json({ message: 'Powiadomienie oznaczone jako przeczytane.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};
