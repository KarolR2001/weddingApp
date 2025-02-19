import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Table } from './table';
import { GuestList } from './guestList';

export interface TableAssignmentAttributes {
  assignmentId: number;
  tableId: number;
  guestId: number;
  createdAt?: Date;
}

interface TableAssignmentCreationAttributes extends Optional<TableAssignmentAttributes, 'assignmentId' | 'createdAt'> {}

export class TableAssignment extends Model<TableAssignmentAttributes, TableAssignmentCreationAttributes> implements TableAssignmentAttributes {
  public assignmentId!: number;
  public tableId!: number;
  public guestId!: number;

  public readonly createdAt!: Date;
}

TableAssignment.init(
  {
    assignmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'assignment_id',
    },
    tableId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Tables',
        key: 'table_id',
      },
      field: 'table_id',
    },
    guestId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'GuestList',
        key: 'guest_id',
      },
      field: 'guest_id',
    },
  },
  {
    tableName: 'TableAssignments',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
