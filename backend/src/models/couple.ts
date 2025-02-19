import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

export interface CoupleAttributes {
  coupleId: number;
  weddingDate?: Date;
  partner1Name: string;
  partner2Name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CoupleCreationAttributes extends Optional<CoupleAttributes, 'coupleId' | 'partner2Name' | 'createdAt' | 'updatedAt'> {}

export class Couple extends Model<CoupleAttributes, CoupleCreationAttributes> implements CoupleAttributes {
  public coupleId!: number;
  public weddingDate!: Date;
  public partner1Name!: string;
  public partner2Name?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Couple.init(
  {
    coupleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'couple_id',
    },
    weddingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'wedding_date',
    },
    partner1Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'partner1_name',
    },
    partner2Name: {
      type: DataTypes.STRING(255),
      field: 'partner2_name',
    },
  },
  {
    tableName: 'Couples',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
