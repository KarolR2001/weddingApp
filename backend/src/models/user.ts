import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Vendor } from './vendor';
import { Couple } from './couple';
import { UserNotificationSetting } from './userNotificationSetting';

export interface UserAttributes {
  id: number;
  userType: 'vendor' | 'couple' | 'admin';
  email: string;
  passwordHash: string;
  phoneNumber: string;
  status: 'active' | 'blocked' | 'deactivated' | 'deleted';
  lastLoginAt?: Date; // Dodana kolumna
  created_at?: Date;
  updatedAt?: Date;
  vendorProfile?: Vendor;
  coupleProfile?: Couple;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'status' | 'created_at' | 'updatedAt' | 'lastLoginAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public userType!: 'vendor' | 'couple' | 'admin';
  public email!: string;
  public passwordHash!: string;
  public phoneNumber!: string;
  public status!: 'active' | 'blocked' | 'deactivated' | 'deleted';
  public lastLoginAt?: Date; // Dodana kolumna

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Asocjacje
  public vendorProfile?: Vendor;
  public coupleProfile?: Couple;
  public notificationSettings?: UserNotificationSetting[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userType: {
      type: DataTypes.ENUM('vendor', 'couple', 'admin'),
      allowNull: false,
      field: 'user_type',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'phone_number',
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked', 'deactivated', 'deleted'),
      defaultValue: 'active',
      allowNull: false,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    tableName: 'Users',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
