import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';
import { FilterOption } from './filterOption';

export interface ListingFilterAttributes {
  listingFilterId: number;
  listingId: number;
  filterOptionId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ListingFilterCreationAttributes extends Optional<ListingFilterAttributes, 'listingFilterId' | 'createdAt' | 'updatedAt'> {}

export class ListingFilter extends Model<ListingFilterAttributes, ListingFilterCreationAttributes> implements ListingFilterAttributes {
  public listingFilterId!: number;
  public listingId!: number;
  public filterOptionId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ListingFilter.init(
  {
    listingFilterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'listing_filter_id',
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
    filterOptionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'FilterOptions',
        key: 'filter_option_id',
      },
      field: 'filter_option_id',
    },
  },
  {
    tableName: 'ListingFilters',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
