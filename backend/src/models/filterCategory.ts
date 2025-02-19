import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ServiceCategory } from './serviceCategory';

export interface FilterCategoryAttributes {
  filterCategoryId: number;
  serviceCategoryId: number;
  filterName: string;
  displayType: 'checkbox' | 'dropdown' | 'slider'; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface FilterCategoryCreationAttributes extends Optional<FilterCategoryAttributes, 'filterCategoryId' | 'displayType' | 'createdAt' | 'updatedAt'> {}

export class FilterCategory extends Model<FilterCategoryAttributes, FilterCategoryCreationAttributes> implements FilterCategoryAttributes {
  public filterCategoryId!: number;
  public serviceCategoryId!: number;
  public filterName!: string;
  public displayType!: 'checkbox' | 'dropdown' | 'slider'; 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FilterCategory.init(
  {
    filterCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'filter_category_id',
    },
    serviceCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ServiceCategories',
        key: 'category_id',
      },
      field: 'service_category_id',
    },
    filterName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'filter_name',
    },
    displayType: {
      type: DataTypes.ENUM('checkbox', 'dropdown', 'slider'),
      allowNull: false,
      defaultValue: 'checkbox',
      field: 'display_type',
    },
  },
  {
    tableName: 'FilterCategories',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
