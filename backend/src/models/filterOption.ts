import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { FilterCategory } from './filterCategory';

export interface FilterOptionAttributes {
  filterOptionId: number;
  filterCategoryId: number;
  optionName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FilterOptionCreationAttributes extends Optional<FilterOptionAttributes, 'filterOptionId' | 'createdAt' | 'updatedAt'> {}

export class FilterOption extends Model<FilterOptionAttributes, FilterOptionCreationAttributes> implements FilterOptionAttributes {
  public filterOptionId!: number;
  public filterCategoryId!: number;
  public optionName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FilterOption.init(
  {
    filterOptionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'filter_option_id',
    },
    filterCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'FilterCategories',
        key: 'filter_category_id',
      },
      field: 'filter_category_id',
    },
    optionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'option_name',
    },
  },
  {
    tableName: 'FilterOptions',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
