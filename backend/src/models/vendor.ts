import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';
import { ServiceCategory } from './serviceCategory';

export interface VendorAttributes {
  vendorId: number;
  companyName: string;
  serviceCategoryId?: number;
  locationCity?: string;
  offersNationwideService: boolean;
  googleCalendarId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VendorCreationAttributes extends Optional<VendorAttributes, 'vendorId' | 'offersNationwideService' | 'createdAt' | 'updatedAt'> {}

export class Vendor extends Model<VendorAttributes, VendorCreationAttributes> implements VendorAttributes {
  public vendorId!: number;
  public companyName!: string;
  public serviceCategoryId?: number;
  public locationCity?: string;
  public offersNationwideService!: boolean;
  public googleCalendarId?: string;
  public googleAccessToken?: string;
  public googleRefreshToken?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vendor.init(
  {
    vendorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'vendor_id',
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
    },
    serviceCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,  // Ustawienie jako opcjonalne
      references: {
        model: 'ServiceCategories',
        key: 'category_id',
      },
      field: 'service_category_id',
    },
    locationCity: {
      type: DataTypes.STRING(255),
      allowNull: true,  // Ustawienie jako opcjonalne
      field: 'location_city',
    },
    offersNationwideService: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'offers_nationwide_service',
    },
    googleCalendarId: {
      type: DataTypes.STRING(255),
      field: 'google_calendar_id',
    },
    googleAccessToken: {
      type: DataTypes.STRING(255),
      field: 'google_access_token',
    },
    googleRefreshToken: {
      type: DataTypes.STRING(255),
      field: 'google_refresh_token',
    },
  },
  {
    tableName: 'Vendors',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
