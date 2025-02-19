import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';
import { VendorListing } from './vendorListing';

export interface FavoriteAttributes {
  favoriteId: number;
  userId: number;
  listingId: number;
  createdAt?: Date;
}

interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'favoriteId' | 'createdAt'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public favoriteId!: number;
  public userId!: number;
  public listingId!: number;

  public readonly createdAt!: Date;
}

Favorite.init(
  {
    favoriteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'favorite_id',
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
      allowNull: false,
      references: {
        model: 'VendorListings',
        key: 'listing_id',
      },
      field: 'listing_id',
    },
  },
  {
    tableName: 'Favorites',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
