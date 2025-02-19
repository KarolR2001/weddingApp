import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';
import { PromotionType } from './promotionType';

export interface PromotionAttributes {
  promotionId: number;
  listingId: number;
  promotionTypeId: number;
  promotionStatus: 'active' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
}

interface PromotionCreationAttributes extends Optional<PromotionAttributes, 'promotionId' | 'createdAt'> {}

export class Promotion extends Model<PromotionAttributes, PromotionCreationAttributes> implements PromotionAttributes {
  public promotionId!: number;
  public listingId!: number;
  public promotionTypeId!: number;
  public promotionStatus!: 'active' | 'expired' | 'pending';
  public startDate!: Date;
  public endDate!: Date;

  public readonly createdAt!: Date;
}

Promotion.init(
  {
    promotionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'promotion_id',
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
    promotionTypeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'PromotionTypes',
        key: 'promotion_type_id',
      },
      field: 'promotion_type_id',
    },
    promotionStatus: {
      type: DataTypes.ENUM('active', 'expired', 'pending'),
      allowNull: false,
      field: 'promotion_status',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
    },
  },
  {
    tableName: 'Promotions',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
