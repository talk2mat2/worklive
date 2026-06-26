import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface DiscountAttributes {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  image?: string | null;
  category?: string | null;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DiscountCreationAttributes
  extends Optional<DiscountAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Discount
  extends Model<DiscountAttributes, DiscountCreationAttributes>
  implements DiscountAttributes
{
  public id!: string;
  public vendorId!: string;
  public title!: string;
  public description!: string;
  public originalPrice!: number;
  public discountedPrice!: number;
  public discountPercent!: number;
  public image!: string | null;
  public category!: string | null;
  public expiresAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Discount.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discountPercent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT("medium"),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "discounts",
    timestamps: true,
  }
);
