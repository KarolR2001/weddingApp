import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

export interface LogAttributes {
  logId: number;
  userId: number;
  action: string;
  actionDetails?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

interface LogCreationAttributes extends Optional<LogAttributes, 'logId' | 'actionDetails' | 'ipAddress' | 'userAgent' | 'createdAt'> {}

export class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  public logId!: number;
  public userId!: number;
  public action!: string;
  public actionDetails?: string;
  public ipAddress?: string;
  public userAgent?: string;

  public readonly createdAt!: Date;
}

Log.init(
  {
    logId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'log_id',
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
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    actionDetails: {
      type: DataTypes.TEXT,
      field: 'action_details',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(255),
      field: 'user_agent',
    },
  },
  {
    tableName: 'Logs',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
