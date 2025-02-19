import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DiscountAttributes {
  discountId: number;
  code: string;
  discountPercentage: number;
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  timesUsed?: number;
  createdAt?: Date;
}

interface DiscountCreationAttributes extends Optional<DiscountAttributes, 'discountId' | 'maxUses' | 'timesUsed' | 'createdAt'> {}

export class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
  public discountId!: number;
  public code!: string;
  public discountPercentage!: number;
  public validFrom!: Date;
  public validUntil!: Date;
  public maxUses?: number;
  public timesUsed?: number;

  public readonly createdAt!: Date;
}

Discount.init(
  {
    discountId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'discount_id',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'discount_percentage',
    },
    validFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'valid_from',
    },
    validUntil: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'valid_until',
    },
    maxUses: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
      field: 'max_uses',
    },
    timesUsed: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'times_used',
    },
  },
  {
    tableName: 'Discounts',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
