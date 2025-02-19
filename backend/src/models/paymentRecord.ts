import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';
import { VendorListing } from './vendorListing';
import { Promotion } from './promotion';
import { Discount } from './discount';

export interface PaymentRecordAttributes {
  paymentId: number;
  userId: number;
  listingId?: number;
  promotionId?: number;
  discountId?: number;
  amount: number;
  dueDate?: Date;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'overdue';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  createdAt?: Date;
}

interface PaymentRecordCreationAttributes extends Optional<PaymentRecordAttributes, 'paymentId' | 'listingId' | 'promotionId' | 'discountId' | 'dueDate' | 'createdAt'> {}

export class PaymentRecord extends Model<PaymentRecordAttributes, PaymentRecordCreationAttributes> implements PaymentRecordAttributes {
  public paymentId!: number;
  public userId!: number;
  public listingId?: number;
  public promotionId?: number;
  public discountId?: number;
  public amount!: number;
  public dueDate?: Date;
  public paymentStatus!: 'completed' | 'pending' | 'failed' | 'overdue';
  public paymentMethod!: 'credit_card' | 'paypal' | 'bank_transfer';

  public readonly createdAt!: Date;
}

PaymentRecord.init(
  {
    paymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'payment_id',
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
    listingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'VendorListings',
        key: 'listing_id',
      },
      field: 'listing_id',
    },
    promotionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'Promotions',
        key: 'promotion_id',
      },
      field: 'promotion_id',
    },
    discountId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'Discounts',
        key: 'discount_id',
      },
      field: 'discount_id',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      field: 'due_date',
    },
    paymentStatus: {
      type: DataTypes.ENUM('completed', 'pending', 'failed', 'overdue'),
      allowNull: false,
      field: 'payment_status',
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'),
      allowNull: false,
      field: 'payment_method',
    },
  },
  {
    tableName: 'PaymentRecords',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
