import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

export interface DeviceAttributes {
  deviceId: number;
  userId: number;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  lastLoginAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'deviceId' | 'createdAt' | 'updatedAt'> {}

export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public deviceId!: number;
  public userId!: number;
  public deviceName!: string;
  public deviceType!: string;
  public ipAddress!: string;
  public lastLoginAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Device.init(
  {
    deviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'device_id', // Mapowanie na device_id
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id', // Mapowanie na user_id
    },
    deviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'device_name', // Mapowanie na device_name
    },
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'device_type', // Mapowanie na device_type
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'ip_address', // Mapowanie na ip_address
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'last_login_at', // Mapowanie na last_login_at
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at', // Mapowanie na created_at
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at', // Mapowanie na updated_at
    },
  },
  {
    tableName: 'Devices', // Nazwa tabeli w bazie danych
    sequelize,
    timestamps: true,
  }
);