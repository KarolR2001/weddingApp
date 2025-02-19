import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PromotionTypeAttributes {
  promotionTypeId: number;
  promotionName: string;
  description: string;
}

interface PromotionTypeCreationAttributes extends Optional<PromotionTypeAttributes, 'promotionTypeId'> {}

export class PromotionType extends Model<PromotionTypeAttributes, PromotionTypeCreationAttributes> implements PromotionTypeAttributes {
  public promotionTypeId!: number;
  public promotionName!: string;
  public description!: string;
}

PromotionType.init(
  {
    promotionTypeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'promotion_type_id',
    },
    promotionName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'promotion_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'PromotionTypes',
    sequelize,
    timestamps: false,
  }
);
