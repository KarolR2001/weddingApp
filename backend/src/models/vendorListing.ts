import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Vendor } from './vendor';
import { ServiceCategory } from './serviceCategory';

export interface VendorListingAttributes {
  listingId: number;
  vendorId: number;
  categoryId: number;
  title: string;
  shortDescription?: string;
  longDescription?: string;
  priceMin?: number;
  priceMax?: number;
  rangeInKm?: number;
  offersNationwideService?: boolean;
  contactPhone?: string;
  email?: string; 
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  pinterestUrl?: string;
  city: string;
  isSuspended: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VendorListingCreationAttributes extends Optional<VendorListingAttributes, 'listingId' | 'createdAt' | 'updatedAt'> {}

export class VendorListing extends Model<VendorListingAttributes, VendorListingCreationAttributes> implements VendorListingAttributes {
  public listingId!: number;
  public vendorId!: number;
  public categoryId!: number;
  public title!: string;
  public shortDescription?: string;
  public longDescription?: string;
  public priceMin?: number;
  public priceMax?: number;
  public rangeInKm?: number;
  public offersNationwideService?: boolean;
  public contactPhone?: string;
  public email?: string; // Dodane pole email
  public websiteUrl?: string;
  public facebookUrl?: string;
  public instagramUrl?: string;
  public youtubeUrl?: string;
  public tiktokUrl?: string;
  public spotifyUrl?: string;
  public soundcloudUrl?: string;
  public pinterestUrl?: string;
  public city!: string;
  public isSuspended!: boolean;
public category?: ServiceCategory;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VendorListing.init(
  {
    listingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'listing_id',
    },
    vendorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'vendor_id',
      },
      field: 'vendor_id',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ServiceCategories',
        key: 'category_id',
      },
      field: 'category_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      field: 'short_description',
    },
    longDescription: {
      type: DataTypes.TEXT,
      field: 'long_description',
    },
    priceMin: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'price_min',
    },
    priceMax: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'price_max',
    },
    rangeInKm: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      field: 'range_in_km',
    },
    offersNationwideService: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'offers_nationwide_service',
    },
    contactPhone: {
      type: DataTypes.STRING(50),
      field: 'contact_phone',
    },
    email: {
      type: DataTypes.STRING(255), 
      allowNull: true,
      field: 'email',
    },
    websiteUrl: {
      type: DataTypes.STRING(255),
      field: 'website_url',
    },
    facebookUrl: {
      type: DataTypes.STRING(255),
      field: 'facebook_url',
    },
    instagramUrl: {
      type: DataTypes.STRING(255),
      field: 'instagram_url',
    },
    youtubeUrl: {
      type: DataTypes.STRING(255),
      field: 'youtube_url',
    },
    tiktokUrl: {
      type: DataTypes.STRING(255),
      field: 'tiktok_url',
    },
    spotifyUrl: {
      type: DataTypes.STRING(255),
      field: 'spotify_url',
    },
    soundcloudUrl: {
      type: DataTypes.STRING(255),
      field: 'soundcloud_url',
    },
    pinterestUrl: {
      type: DataTypes.STRING(255),
      field: 'pinterest_url',
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_suspended',
    },
  },
  {
    tableName: 'VendorListings',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
