import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface OfferAttributes {
  id: string;
  requestId: string;
  vendorId: string;
  amount: number;
  description: string;
  timeline: string;
  status: "pending" | "in_review" | "accepted" | "rejected" | "withdrawn" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

interface OfferCreationAttributes
  extends Optional<OfferAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Offer
  extends Model<OfferAttributes, OfferCreationAttributes>
  implements OfferAttributes
{
  public id!: string;
  public requestId!: string;
  public vendorId!: string;
  public amount!: number;
  public description!: string;
  public timeline!: string;
  public status!: "pending" | "in_review" | "accepted" | "rejected" | "withdrawn" | "completed";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Offer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timeline: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_review", "accepted", "rejected", "withdrawn", "completed"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "offers",
    timestamps: true,
  }
);
