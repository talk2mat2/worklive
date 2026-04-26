import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, UserAttributes } from "../models/user.model";
import { responseCodes } from "../utils/responseCodes";
import { genericResponse } from "../utils";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";


function validateEmail(email: string) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

async function verifyPassword(Password: string, hashedPassword: string) {
  const match = await bcrypt.compare(Password, hashedPassword);

  if (match) {
    return true;
  } else {
    return false;
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body as UserAttributes;
    const Password = reqBody.password;
    const Email = reqBody.email;

    if (!validateEmail(Email)) {
      return res
        .status(404)
        .json(
          genericResponse(null, responseCodes["404"], "Invalid email format"),
        );
    }

    if (!Password || !Email) {
      return res
        .status(404)
        .json(
          genericResponse(
            null,
            responseCodes["404"],
            "All fields are required",
          ),
        );
    }

    const existingUser = await User.findOne({
      where: { email: Email },
    });
    if (existingUser) {
      return res
        .status(401)
        .json(
          genericResponse(
            null,
            responseCodes["401"],
            `A user with email ${Email} is already registered, try to login`,
          ),
        );
    }

    const Passwordhash = bcrypt.hashSync(Password, 10);
    //first level referrer
    //authenticate user here Login
    const user = await User.create({
      ...req.body,
      password: Passwordhash,
      id: uuidv4(),
    });
    res
      .status(200)
      .json(
        genericResponse(
          user,
          responseCodes["200"],
          "User created successfully",
        ),
      );
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  res.json(
    genericResponse(
      users,
      responseCodes["200"],
      "Users retrieved successfully",
    ),
  );
};

export const loginUser = async (req: Request, res: Response) => {
  const reqBody = req.body as UserAttributes;
  const Password = reqBody.password;
  const Email = reqBody.email;
  if (!Password || !Email) {
    return res
      .status(400)
      .send(
        genericResponse(
          null,
          responseCodes["400"],
          "Email and password are required",
        ),
      );
  }
  try {
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }
    const match = await verifyPassword(Password, existingUser.password);
    if (!match) {
      return res
        .status(401)
        .json(
          genericResponse(null, responseCodes["401"], "Invalid credentials"),
        );
    }
    const user = existingUser.toJSON() as UserAttributes;
    type SafeUser = Omit<UserAttributes, "password">;

    const { password, ...userWithoutPassword } = user;

    const data = {
      user: userWithoutPassword,
      token: jwt.sign({ user: userWithoutPassword }, "emeka1234", {
        expiresIn: "17520hr",
      }),
    };
    res.json(genericResponse(data, responseCodes["200"], "Login successful"));
  } catch (err) {
    res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Login Failed" + err));
  }
};
