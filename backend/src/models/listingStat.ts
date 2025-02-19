import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';

export interface ListingStatAttributes {
  statId: number;
  listingId: number;
  viewsCount?: number;
  clicksCount?: number;
  inquiriesCount?: number;
  avgBrowsingTime?: number;
  mostActiveDay?: string;
  mostActiveHour?: string;
  deviceTypeDistribution?: object; 
  activeDaysDistribution?: object;
  activeHoursDistribution?: object;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt?: Date;
}

interface ListingStatCreationAttributes extends Optional<ListingStatAttributes, 'statId' | 'viewsCount' | 'clicksCount' | 'inquiriesCount' | 'avgBrowsingTime' | 'mostActiveDay' | 'mostActiveHour' | 'deviceTypeDistribution' | 'createdAt'> {}

export class ListingStat extends Model<ListingStatAttributes, ListingStatCreationAttributes> implements ListingStatAttributes {
  public statId!: number;
  public listingId!: number;
  public viewsCount?: number;
  public clicksCount?: number;
  public inquiriesCount?: number;
  public avgBrowsingTime?: number;
  public mostActiveDay?: string;
  public mostActiveHour?: string;
  public deviceTypeDistribution?: object;
  public activeDaysDistribution?: object;
  public activeHoursDistribution?: object;
  public period!: 'daily' | 'weekly' | 'monthly' | 'yearly';

  public readonly createdAt!: Date;
}

ListingStat.init(
  {
    statId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'stat_id',
    },
    listingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'VendorListings',
        key: 'listing_id',
      },
      field: 'listing_id',
    },
    viewsCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'views_count',
    },
    clicksCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'clicks_count',
    },
    inquiriesCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'inquiries_count',
    },
    avgBrowsingTime: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.0,
      field: 'avg_browsing_time',
    },
    mostActiveDay: {
      type: DataTypes.STRING(20),
      field: 'most_active_day',
    },
    mostActiveHour: {
      type: DataTypes.STRING(10),
      field: 'most_active_hour',
    },
    deviceTypeDistribution: {
      type: DataTypes.JSON,
      field: 'device_type_distribution',
    },
    activeDaysDistribution: {
      type: DataTypes.JSON, 
      field: 'active_days_distribution',
      defaultValue: {}, 
    },
    activeHoursDistribution: {
      type: DataTypes.JSON, 
      field: 'active_hours_distribution',
      defaultValue: {}, 
    },
    period: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      defaultValue: 'daily',
    },
  },
  {
    tableName: 'ListingStats',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
