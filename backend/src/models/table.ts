import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Couple } from './couple';

export interface TableAttributes {
  tableId: number;
  coupleId: number;
  tableName: string;
  tableShape: 'round' | 'rectangular';
  maxGuests: number;
  createdAt?: Date;
}

interface TableCreationAttributes extends Optional<TableAttributes, 'tableId' | 'createdAt'> {}

export class Table extends Model<TableAttributes, TableCreationAttributes> implements TableAttributes {
  public tableId!: number;
  public coupleId!: number;
  public tableName!: string;
  public tableShape!: 'round' | 'rectangular';
  public maxGuests!: number;

  public readonly createdAt!: Date;
}

Table.init(
  {
    tableId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'table_id',
    },
    coupleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Couples',
        key: 'couple_id',
      },
      field: 'couple_id',
    },
    tableName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'table_name',
    },
    tableShape: {
      type: DataTypes.ENUM('round', 'rectangular'),
      allowNull: false,
      field: 'table_shape',
    },
    maxGuests: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'max_guests',
    },
  },
  {
    tableName: 'Tables',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
