import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';
import { VendorListing } from './vendorListing';
import { Message } from './message';

export interface ConversationAttributes {
  conversationId: number;
  user1Id: number;
  user2Id: number;
  listingId?: number;
  isReadByUser1: boolean; // Czy użytkownik 1 przeczytał konwersację
  isReadByUser2: boolean; // Czy użytkownik 2 przeczytał konwersację
  createdAt?: Date;
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'conversationId' | 'createdAt' | 'isReadByUser1' | 'isReadByUser2'> {}

export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public conversationId!: number;
  public user1Id!: number;
  public user2Id!: number;
  public listingId?: number;
  public isReadByUser1!: boolean;
  public isReadByUser2!: boolean;

  public readonly createdAt!: Date;
  public messages?: Message[];

  // Relacje
  public static associate() {
    Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
    Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });
    Conversation.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });
    Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
  }
}

Conversation.init(
  {
    conversationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'conversation_id',
    },
    user1Id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user1_id',
    },
    user2Id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user2_id',
    },
    listingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Listings',
        key: 'id',
      },
      field: 'listing_id',
    },
    isReadByUser1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read_by_user1',
    },
    isReadByUser2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read_by_user2',
    },
  },
  {
    tableName: 'Conversations',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Conversation;
