import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { Notification } from '../models/notification';
import { NotificationRecipient } from '../models/notificationRecipient';
import { UserNotificationSetting } from '../models/userNotificationSetting';
import { User } from '../models/user';

export class NotificationService {
  /**
   * Tworzenie automatycznego powiadomienia
   */
  static async createAutomaticNotification({
    userId,
    message,
    eventType,
    notificationType = 'app',
  }: {
    userId: number;
    message: string;
    eventType: string;
    notificationType?: 'email' | 'app';
  }) {
    try {
      if (notificationType === 'app') {
        await NotificationService.createAppNotification(userId, message);
        return;
      }

      if (notificationType === 'email') {
        const userSettings = await UserNotificationSetting.findOne({
          where: { userId, eventType, notificationType, isEnabled: true },
        });

        if (!userSettings) {
          console.log(`Powiadomienia e-mail ${eventType} wyłączone dla użytkownika ${userId}`);
          return;
        }

        await NotificationService.sendEmailNotification(userId, message, eventType);
      }
    } catch (error) {
      console.error('Błąd tworzenia automatycznego powiadomienia:', error);
    }
  }

  /**
   * Tworzenie powiadomienia aplikacyjnego
   */
  static async createAppNotification(userId: number, message: string) {
    try {
      const notification = await Notification.create({
        message,
        notificationType: 'app',
        isAdminNotification: false,
        status: 'sent',
      });

      await NotificationRecipient.create({
        notificationId: notification.notificationId,
        userId,
        isRead: false,
      });

      console.log(`Powiadomienie aplikacyjne utworzone dla użytkownika ${userId}`);
    } catch (error) {
      console.error('Błąd tworzenia powiadomienia aplikacyjnego:', error);
    }
  }

  /**
   * Wysyłanie powiadomień e-mail
   */
  static async sendEmailNotification(userId: number, message: string, eventType: string) {
    try {
      const userEmail = await getUserEmail(userId);
      if (!userEmail) {
        console.log(`Nie znaleziono adresu e-mail dla użytkownika ${userId}`);
        return;
      }
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const templatePath = path.resolve('./src/templates/notificationsEmailTemplate.hbs');
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
  
      const htmlToSend = template({
        message,
        eventType,
      });
  
      const mailOptions = {
        from: `Weselny Zakątek <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Powiadomienie od Weselny Zakątek`,
        html: htmlToSend,
        attachments: [
          {
            filename: 'logo.png',
            path: './src/templates/LOGO.png', // Ścieżka do logo
            cid: 'logo', // `cid` dla osadzenia obrazu
          },
        ],
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`E-mail wysłany do ${userEmail} z powiadomieniem typu: ${eventType}`);
    } catch (error) {
      console.error('Błąd podczas wysyłania e-maila powiadomienia:', error);
    }
  }
  

  /**
   * Tworzenie powiadomienia administracyjnego
   */
  static async createAdminNotification({
    senderId,
    recipients,
    message,
    notificationType,
  }: {
    senderId: number;
    recipients: number[];
    message: string;
    notificationType: 'email' | 'app';
  }) {
    try {
      const notification = await Notification.create({
        senderId,
        message,
        notificationType,
        isAdminNotification: true,
        status: 'sent',
      });

      const recipientsData = recipients.map((userId) => ({
        notificationId: notification.notificationId,
        userId,
        isRead: false,
      }));

      await NotificationRecipient.bulkCreate(recipientsData);

      console.log(
        `Powiadomienie administracyjne wysłane przez użytkownika ${senderId} do ${recipients.length} odbiorców.`
      );
    } catch (error) {
      console.error('Błąd tworzenia powiadomienia administracyjnego:', error);
    }
  }
}
export const getUserEmail = async (userId: number): Promise<string | null> => {
    try {
      const user = await User.findOne({
        where: { id: userId }, 
        attributes: ['email'], 
      });
  
      if (user && user.email) {
        return user.email;
      }
  
      console.warn(`Nie znaleziono użytkownika z id ${userId}`);
      return null;
    } catch (error) {
      console.error(`Błąd podczas pobierania e-maila użytkownika ${userId}:`, error);
      throw error; // Przekazanie błędu dalej
    }
  };