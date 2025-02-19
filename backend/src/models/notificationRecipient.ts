import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Notification } from './notification';

export interface NotificationRecipientAttributes {
  recipientId: number;
  notificationId: number;
  userId: number;
  isRead?: boolean; 
}

interface NotificationRecipientCreationAttributes extends Optional<NotificationRecipientAttributes, 'recipientId'> {}

export class NotificationRecipient extends Model<NotificationRecipientAttributes, NotificationRecipientCreationAttributes>
  implements NotificationRecipientAttributes {
  public recipientId!: number;
  public notificationId!: number;
  public userId!: number;
  public isRead!: boolean; 
}

NotificationRecipient.init(
  {
    recipientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'recipient_id',
    },
    notificationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Notifications',
        key: 'notification_id',
      },
      field: 'notification_id',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Domyślnie nieprzeczytane
      field: 'is_read',
    },
  },
  {
    tableName: 'NotificationRecipients',
    sequelize,
    timestamps: false,
  }
);
