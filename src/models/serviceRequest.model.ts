import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ServiceRequestAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType: "fixed" | "range" | "negotiable";
  location: string;
  serviceType: "in-person" | "remote";
  userId: string;
  status: "active" | "expired" | "completed" | "cancelled";
  expiresAt: Date;
  images?: string; // JSON array of image URLs/base64
  offerCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceRequestCreationAttributes
  extends Optional<
    ServiceRequestAttributes,
    "id" | "budgetMin" | "budgetMax" | "images" | "offerCount" | "createdAt" | "updatedAt"
  > {}

export class ServiceRequest
  extends Model<ServiceRequestAttributes, ServiceRequestCreationAttributes>
  implements ServiceRequestAttributes
{
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public budgetMin?: number;
  public budgetMax?: number;
  public budgetType!: "fixed" | "range" | "negotiable";
  public location!: string;
  public serviceType!: "in-person" | "remote";
  public userId!: string;
  public status!: "active" | "expired" | "completed" | "cancelled";
  public expiresAt!: Date;
  public images?: string;
  public offerCount?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ServiceRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    budgetMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    budgetMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    budgetType: {
      type: DataTypes.ENUM("fixed", "range", "negotiable"),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.ENUM("in-person", "remote"),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "completed", "cancelled"),
      defaultValue: "active",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    images: {
      type: DataTypes.TEXT("long"), // LONGTEXT for base64 image arrays
      allowNull: true,
    },
    offerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "service_requests",
    timestamps: true,
  }
);
