import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';

export interface MediaAttributes {
  mediaId: number;
  listingId: number;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  createdAt?: Date;
}

interface MediaCreationAttributes extends Optional<MediaAttributes, 'mediaId' | 'createdAt'> {}

export class Media extends Model<MediaAttributes, MediaCreationAttributes> implements MediaAttributes {
  public mediaId!: number;
  public listingId!: number;
  public mediaType!: 'image' | 'video';
  public mediaUrl!: string;

  public readonly createdAt!: Date;
}

Media.init(
  {
    mediaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'media_id',
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
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
      field: 'media_type',
    },
    mediaUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'media_url',
    },
  },
  {
    tableName: 'Media',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
