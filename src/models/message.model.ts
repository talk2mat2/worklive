import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string; // JSON array
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes
  extends Optional<MessageAttributes, "id" | "attachments" | "isRead" | "createdAt" | "updatedAt"> {}

export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: string;
  public conversationId!: string;
  public senderId!: string;
  public content!: string;
  public attachments?: string;
  public isRead!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.TEXT, // stored as JSON string
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "messages",
    timestamps: true,
  }
);
