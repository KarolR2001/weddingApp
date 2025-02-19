import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Couple } from './couple';

export interface GuestGroupAttributes {
  groupId: number;
  coupleId: number;
  groupName: string;
  createdAt?: Date;
}

interface GuestGroupCreationAttributes extends Optional<GuestGroupAttributes, 'groupId' | 'createdAt'> {}

export class GuestGroup extends Model<GuestGroupAttributes, GuestGroupCreationAttributes> implements GuestGroupAttributes {
  public groupId!: number;
  public coupleId!: number;
  public groupName!: string;

  public readonly createdAt!: Date;
}

GuestGroup.init(
  {
    groupId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'group_id',
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
    groupName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'group_name',
    },
  },
  {
    tableName: 'GuestGroups',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
