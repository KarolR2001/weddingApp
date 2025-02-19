import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

export interface UserNotificationSettingAttributes {
  settingId: number;
  userId: number;
  notificationType: 'email' | 'sms' | 'app';
  eventType: 'account_change' | 'new_device_login' | 'payment_reminder' | 'new_review' | 'monthly_report' | 'new_message' | 'new_activity';
  isEnabled: boolean;
}

interface UserNotificationSettingCreationAttributes extends Optional<UserNotificationSettingAttributes, 'settingId' | 'isEnabled'> {}

export class UserNotificationSetting extends Model<UserNotificationSettingAttributes, UserNotificationSettingCreationAttributes> implements UserNotificationSettingAttributes {
  public settingId!: number;
  public userId!: number;
  public notificationType!: 'email' | 'sms' | 'app';
  public eventType!: 'account_change' | 'new_device_login' | 'payment_reminder' | 'new_review' | 'monthly_report' | 'new_message' | 'new_activity';
  public isEnabled!: boolean;
}

UserNotificationSetting.init(
  {
    settingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'setting_id',
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
    notificationType: {
      type: DataTypes.ENUM('email', 'sms', 'app'),
      allowNull: false,
      field: 'notification_type',
    },
    eventType: {
      type: DataTypes.ENUM(
        'account_change',
        'new_device_login',
        'payment_reminder',
        'new_review',
        'monthly_report',
        'new_message',
        'new_activity'
      ),
      allowNull: false,
      field: 'event_type',
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_enabled',
    },
  },
  {
    tableName: 'UserNotificationSettings',
    sequelize,
    timestamps: false,
  }
);
