import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Optional: for TypeScript (so not all fields are required when creating)
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  houseNumber?: string;
  state?: string;
  password: string;
  profilePicture?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "profilePicture" | "isActive" | "createdAt" | "updatedAt"
> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phoneNumber?: string;
  public address?: string;
  public houseNumber?: string;
  public state?: string;
  public profilePicture!: string | null;
  public isActive!: boolean;

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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    houseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true, // adds createdAt & updatedAt automatically
  },
);
