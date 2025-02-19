import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

export interface NotificationAttributes {
  notificationId: number;
  senderId?: number;
  title?: string;
  message: string;
  notificationType: 'email' | 'sms' | 'app';
  recipientsGroup?: string;
  sentAt?: Date;
  status: 'sent' | 'pending' | 'failed';
  attachmentUrl?: string;
  isAdminNotification: boolean; 
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'notificationId' | 'senderId' | 'sentAt' | 'status' | 'attachmentUrl'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public notificationId!: number;
  public senderId?: number;
  public title?: string;
  public message!: string;
  public notificationType!: 'email' | 'sms' | 'app';
  public recipientsGroup?: string;
  public sentAt!: Date;
  public status!: 'sent' | 'pending' | 'failed';
  public attachmentUrl?: string;
  public isAdminNotification!: boolean; 
}

Notification.init(
  {
    notificationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'notification_id',
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'sender_id',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notificationType: {
      type: DataTypes.ENUM('email', 'sms', 'app'),
      allowNull: false,
      field: 'notification_type',
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'sent_at',
    },
    status: {
      type: DataTypes.ENUM('sent', 'pending', 'failed'),
      defaultValue: 'pending',
      field: 'status',
    },
    attachmentUrl: {
      type: DataTypes.STRING(255),
      field: 'attachment_url',
    },
    isAdminNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Domyślnie automatyczne
      field: 'is_admin_notification',
    },
    title: {
      type: DataTypes.STRING(255), // Tytuł powiadomienia
      allowNull: true,
      field: 'title',
    },
    recipientsGroup: {
      type: DataTypes.TEXT, // Grupy użytkowników jako tekst
      allowNull: true,
      field: 'recipients_group',
    },
  },
  {
    tableName: 'Notifications',
    sequelize,
    timestamps: false,
  }
);
