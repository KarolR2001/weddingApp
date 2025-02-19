import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { VendorListing } from './vendorListing';
import { User } from './user';

export interface ReviewAttributes {
  reviewId: number;
  listingId: number;
  userId: number;
  ratingQuality: number;
  ratingCommunication: number;
  ratingCreativity: number;
  ratingServiceAgreement: number;
  ratingAesthetics: number;
  reviewText?: string;
  weddingDate?: Date;
  location?: string;
  reviewerName?: string;
  reviewerPhone?: string;
  createdAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'reviewId' | 'createdAt'> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public reviewId!: number;
  public listingId!: number;
  public userId!: number;
  public ratingQuality!: number;
  public ratingCommunication!: number;
  public ratingCreativity!: number;
  public ratingServiceAgreement!: number;
  public ratingAesthetics!: number;
  public reviewText?: string;
  public weddingDate?: Date;
  public location?: string;
  public reviewerName?: string;
  public reviewerPhone?: string;


  public readonly createdAt!: Date;
}

Review.init(
  {
    reviewId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'review_id',
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
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id',
    },
    ratingQuality: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'rating_quality',
      validate: {
        min: 1,
        max: 5,
      },
    },
    ratingCommunication: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'rating_communication',
      validate: {
        min: 1,
        max: 5,
      },
    },
    ratingCreativity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'rating_creativity',
      validate: {
        min: 1,
        max: 5,
      },
    },
    ratingServiceAgreement: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'rating_service_agreement',
      validate: {
        min: 1,
        max: 5,
      },
    },
    ratingAesthetics: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'rating_aesthetics',
      validate: {
        min: 1,
        max: 5,
      },
    },
    reviewText: {
      type: DataTypes.TEXT,
      field: 'review_text',
    },
    weddingDate: {
      type: DataTypes.DATEONLY,
      field: 'wedding_date',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'location', // Nowa kolumna dla miejscowości
    },
    reviewerName: {
      type: DataTypes.STRING(255),
      field: 'reviewer_name',
    },
    reviewerPhone: {
      type: DataTypes.STRING(50),
      field: 'reviewer_phone',
    },
  },
  {
    tableName: 'Reviews',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
