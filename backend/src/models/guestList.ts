import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Couple } from './couple';
import { GuestGroup } from './guestGroup';

export interface GuestListAttributes {
  guestId: number;
  coupleId: number;
  guestName: string;
  guestStatus: 'invited' | 'confirmed' | 'declined';
  groupId?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GuestListCreationAttributes extends Optional<GuestListAttributes, 'guestId' | 'groupId' | 'notes' | 'createdAt' | 'updatedAt'> {}

export class GuestList extends Model<GuestListAttributes, GuestListCreationAttributes> implements GuestListAttributes {
  public guestId!: number;
  public coupleId!: number;
  public guestName!: string;
  public guestStatus!: 'invited' | 'confirmed' | 'declined';
  public groupId?: number;
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GuestList.init(
  {
    guestId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'guest_id',
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
    guestName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'guest_name',
    },
    guestStatus: {
      type: DataTypes.ENUM('invited', 'confirmed', 'declined'),
      allowNull: false,
      field: 'guest_status',
    },
    groupId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'GuestGroups',
        key: 'group_id',
      },
      field: 'group_id',
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'GuestList',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
