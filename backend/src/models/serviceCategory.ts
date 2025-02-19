import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ServiceCategoryAttributes {
  categoryId: number;
  categoryName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'categoryId' | 'createdAt' | 'updatedAt'> {}

export class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
  public categoryId!: number;
  public categoryName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ServiceCategory.init(
  {
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'category_id',
    },
    categoryName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'category_name',
    },
  },
  {
    tableName: 'ServiceCategories',
    sequelize,
    timestamps: false,
  }
);
