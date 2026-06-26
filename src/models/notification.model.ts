import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type NotificationType =
  | "offer"
  | "message"
  | "request_expired"
  | "subscription"
  | "system"
  | "offer_accepted"
  | "offer_rejected"
  | "review";

export interface NotificationAttributes {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  data?: string; // JSON string
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "id" | "isRead" | "data" | "createdAt" | "updatedAt"> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public userId!: string;
  public type!: NotificationType;
  public title!: string;
  public content!: string;
  public isRead!: boolean;
  public data?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "offer",
        "message",
        "request_expired",
        "subscription",
        "system",
        "offer_accepted",
        "offer_rejected",
        "review"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    data: {
      type: DataTypes.TEXT, // stored as JSON string
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
  }
);
