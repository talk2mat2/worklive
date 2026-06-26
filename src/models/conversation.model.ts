import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ConversationAttributes {
  id: string;
  requestId?: string;
  offerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, "id" | "requestId" | "offerId" | "createdAt" | "updatedAt"> {}

export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public requestId?: string;
  public offerId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    offerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "conversations",
    timestamps: true,
  }
);

// Junction table: which users are in which conversations
export interface ConversationParticipantAttributes {
  id?: number;
  conversationId: string;
  userId: string;
  unreadCount: number;
}

interface ConversationParticipantCreationAttributes
  extends Optional<ConversationParticipantAttributes, "id" | "unreadCount"> {}

export class ConversationParticipant
  extends Model<ConversationParticipantAttributes, ConversationParticipantCreationAttributes>
  implements ConversationParticipantAttributes
{
  public id?: number;
  public conversationId!: string;
  public userId!: string;
  public unreadCount!: number;
}

ConversationParticipant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "conversation_participants",
    timestamps: false,
  }
);
