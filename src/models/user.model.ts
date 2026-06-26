import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  houseNumber?: string;
  street?: string;
  state?: string;
  address?: string;
  showFullAddress?: boolean;
  type: "user" | "vendor";
  profilePicture?: string | null;
  faceCaptureVerified?: boolean;
  faceCaptureImage?: string | null;
  isActive?: boolean;
  // Vendor-specific
  businessName?: string;
  category?: string;
  description?: string;
  cacRegNo?: string;
  isVerified?: boolean;
  subscriptionType?: "free" | "basic" | "premium";
  subscriptionExpiresAt?: Date | null;
  socialTiktok?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
  socialWebsite?: string;
  lastBusinessNameChange?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "profilePicture"
    | "isActive"
    | "createdAt"
    | "updatedAt"
    | "type"
    | "faceCaptureVerified"
    | "faceCaptureImage"
    | "showFullAddress"
    | "isVerified"
    | "subscriptionType"
    | "subscriptionExpiresAt"
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public phoneNumber?: string;
  public houseNumber?: string;
  public street?: string;
  public state?: string;
  public address?: string;
  public showFullAddress?: boolean;
  public type!: "user" | "vendor";
  public profilePicture!: string | null;
  public faceCaptureVerified?: boolean;
  public faceCaptureImage?: string | null;
  public isActive!: boolean;
  public businessName?: string;
  public category?: string;
  public description?: string;
  public cacRegNo?: string;
  public isVerified?: boolean;
  public subscriptionType?: "free" | "basic" | "premium";
  public subscriptionExpiresAt?: Date | null;
  public socialTiktok?: string;
  public socialInstagram?: string;
  public socialFacebook?: string;
  public socialLinkedin?: string;
  public socialWebsite?: string;
  public lastBusinessNameChange?: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    houseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    showFullAddress: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM("user", "vendor"),
      defaultValue: "user",
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    faceCaptureVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    faceCaptureImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cacRegNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscriptionType: {
      type: DataTypes.ENUM("free", "basic", "premium"),
      defaultValue: "free",
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    socialTiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialInstagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialFacebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastBusinessNameChange: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);
