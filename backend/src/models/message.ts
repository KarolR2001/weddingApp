import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Conversation } from './conversation';
import { User } from './user';

export interface MessageAttributes {
  messageId: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  messageContent: string;
  createdAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'messageId' | 'createdAt'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public messageId!: number;
  public conversationId!: number;
  public senderId!: number;
  public receiverId!: number;
  public messageContent!: string;

  public readonly createdAt!: Date;
}

Message.init(
  {
    messageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'message_id',
    },
    conversationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Conversations',
        key: 'conversation_id',
      },
      field: 'conversation_id',
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'sender_id',
    },
    receiverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'receiver_id',
    },
    messageContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message_content',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW, // Automatyczne ustawianie wartości
    },
  },
  {
    tableName: 'Messages',
    sequelize,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
