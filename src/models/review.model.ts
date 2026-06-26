import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ReviewAttributes {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  type: "user_to_vendor" | "vendor_to_user";
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes
  extends Optional<ReviewAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: string;
  public reviewerId!: string;
  public revieweeId!: string;
  public rating!: number;
  public comment!: string;
  public type!: "user_to_vendor" | "vendor_to_user";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    revieweeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("user_to_vendor", "vendor_to_user"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: true,
  }
);
