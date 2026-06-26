import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ReportAttributes {
  id: string;
  reporterId: string;
  reportedId: string;
  reportedType: "user" | "request" | "offer";
  reason: string;
  details: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportCreationAttributes
  extends Optional<ReportAttributes, "id" | "status" | "createdAt" | "updatedAt"> {}

export class Report
  extends Model<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  public id!: string;
  public reporterId!: string;
  public reportedId!: string;
  public reportedType!: "user" | "request" | "offer";
  public reason!: string;
  public details!: string;
  public status!: "pending" | "resolved" | "dismissed";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reportedId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reportedType: {
      type: DataTypes.ENUM("user", "request", "offer"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved", "dismissed"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "reports",
    timestamps: true,
  }
);
