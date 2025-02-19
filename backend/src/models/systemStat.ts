import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SystemStatAttributes {
  statId: number;
  totalUsers?: number;
  activeUsers?: number;
  couplesCount?: number;
  vendorsCount?: number;
  avgListingViews?: number;
  mostActiveCategory?: string;
  totalInquiries?: number;
  mostActiveHour?: string;
  mostActiveDay?: string; // Dodane pole
  deviceTypeDistribution?: object;
  reportPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt?: Date;
}

interface SystemStatCreationAttributes extends Optional<SystemStatAttributes, 'statId' | 'totalUsers' | 'activeUsers' | 'couplesCount' | 'vendorsCount' | 'avgListingViews' | 'mostActiveCategory' | 'totalInquiries' | 'mostActiveHour' | 'mostActiveDay' | 'deviceTypeDistribution' | 'createdAt'> {}

export class SystemStat extends Model<SystemStatAttributes, SystemStatCreationAttributes> implements SystemStatAttributes {
  public statId!: number;
  public totalUsers?: number;
  public activeUsers?: number;
  public couplesCount?: number;
  public vendorsCount?: number;
  public avgListingViews?: number;
  public mostActiveCategory?: string;
  public totalInquiries?: number;
  public mostActiveHour?: string;
  public mostActiveDay?: string; // Dodane pole
  public deviceTypeDistribution?: object;
  public reportPeriod!: 'daily' | 'weekly' | 'monthly' | 'yearly';

  public readonly createdAt!: Date;
}

SystemStat.init(
  {
    statId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'stat_id',
    },
    totalUsers: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'total_users',
    },
    activeUsers: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'active_users',
    },
    couplesCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'couples_count',
    },
    vendorsCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'vendors_count',
    },
    avgListingViews: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      field: 'avg_listing_views',
    },
    mostActiveCategory: {
      type: DataTypes.STRING(255),
      field: 'most_active_category',
    },
    totalInquiries: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'total_inquiries',
    },
    mostActiveHour: {
      type: DataTypes.STRING(10),
      field: 'most_active_hour',
    },
    mostActiveDay: {
      type: DataTypes.STRING(20),
      field: 'most_active_day',
    },
    deviceTypeDistribution: {
      type: DataTypes.JSON,
      field: 'device_type_distribution',
    },
    reportPeriod: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      defaultValue: 'daily',
      field: 'report_period',
    },
  },
  {
    tableName: 'SystemStats',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
