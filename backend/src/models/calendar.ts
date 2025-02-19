import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';

export interface CalendarAttributes {
  calendarId: number;
  listingId: number;
  date: Date;
  availabilityStatus: 'free' | 'reserved' | 'booked';
  createdAt?: Date;
  updatedAt?: Date;
}

interface CalendarCreationAttributes extends Optional<CalendarAttributes, 'calendarId' | 'createdAt' | 'updatedAt'> {}

export class Calendar extends Model<CalendarAttributes, CalendarCreationAttributes> implements CalendarAttributes {
  public calendarId!: number;
  public listingId!: number;
  public date!: Date;
  public availabilityStatus!: 'free' | 'reserved' | 'booked';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Calendar.init(
  {
    calendarId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'calendar_id',
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    availabilityStatus: {
      type: DataTypes.ENUM('free', 'reserved', 'booked'),
      allowNull: false,
      field: 'availability_status',
    },
  },
  {
    tableName: 'Calendar',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
