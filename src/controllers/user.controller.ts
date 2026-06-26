import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, UserAttributes } from "../models/user.model";
import { responseCodes } from "../utils/responseCodes";
import { genericResponse } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "emeka1234";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "emeka1234_refresh";

function validateEmail(email: string) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function safeUser(user: UserAttributes) {
  const { password, ...rest } = user as any;
  return rest;
}

function generateTokens(user: Omit<UserAttributes, "password">) {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
    name: user.name,
  };
  const token = jwt.sign({ user: payload }, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ user: payload }, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return { token, refreshToken };
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body as UserAttributes;
    const { email, password, type } = reqBody;

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Invalid email format"));
    }

    if (!password || !email || !reqBody.name) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Name, email and password are required"));
    }

    if (type === "vendor" && !reqBody.businessName) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Business name is required for vendors"));
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json(
          genericResponse(
            null,
            responseCodes["401"],
            `A user with email ${email} is already registered`
          )
        );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      ...reqBody,
      password: hashedPassword,
      type: type || "user",
      subscriptionType: type === "vendor" ? "free" : undefined,
    });

    const userJson = user.toJSON() as UserAttributes;
    const tokens = generateTokens(safeUser(userJson));

    return res.status(200).json(
      genericResponse(
        { user: safeUser(userJson), ...tokens },
        responseCodes["200"],
        "Account created successfully"
      )
    );
  } catch (err) {
    return res.status(500).json(genericResponse(null, responseCodes["500"], "Failed to create user"));
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(genericResponse(null, responseCodes["400"], "Email and password are required"));
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (!existing) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    const match = await bcrypt.compare(password, existing.password);
    if (!match) {
      return res
        .status(401)
        .json(genericResponse(null, responseCodes["401"], "Invalid credentials"));
    }

    const userJson = existing.toJSON() as UserAttributes;
    const safe = safeUser(userJson);
    const tokens = generateTokens(safe);

    return res.json(
      genericResponse(
        { user: safe, ...tokens },
        responseCodes["200"],
        "Login successful"
      )
    );
  } catch (err) {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Login failed"));
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json(genericResponse(null, responseCodes["400"], "Refresh token is required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { user: any };
    const user = await User.findByPk(decoded.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    const userJson = user.toJSON() as UserAttributes;
    const { token: accessToken, refreshToken: newRefresh } = generateTokens(safeUser(userJson));

    return res.json(
      genericResponse({ accessToken, refreshToken: newRefresh }, responseCodes["200"], "Token refreshed")
    );
  } catch {
    return res
      .status(401)
      .json(genericResponse(null, responseCodes["401"], "Invalid or expired refresh token"));
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.findAll({ attributes: { exclude: ["password"] } });
  return res.json(genericResponse(users, responseCodes["200"], "Users retrieved successfully"));
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    return res.json(genericResponse(user, responseCodes["200"], "User retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve user"));
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    return res.json(genericResponse(user, responseCodes["200"], "Profile retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve profile"));
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    // Disallow changing email/password/type via this endpoint
    const { password, email, type, id, ...updates } = req.body;

    // Vendor-only: track businessName changes
    if (user.type === "vendor" && updates.businessName && updates.businessName !== user.businessName) {
      updates.lastBusinessNameChange = new Date();
    }

    await user.update(updates);
    const userJson = user.toJSON() as UserAttributes;

    return res.json(
      genericResponse(safeUser(userJson), responseCodes["200"], "Profile updated successfully")
    );
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update profile"));
  }
};

export const migrateToVendor = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    if (user.type === "vendor") {
      return res.status(400).json(genericResponse(null, responseCodes["400"], "Already a vendor"));
    }

    const { businessName, category, cacRegNo } = req.body;
    if (!businessName) {
      return res.status(400).json(genericResponse(null, responseCodes["400"], "Business name is required"));
    }

    await user.update({
      type: "vendor",
      businessName,
      category: category || "",
      cacRegNo: cacRegNo || null,
      subscriptionType: "free",
      isVerified: false,
    });

    const userJson = user.toJSON() as UserAttributes;
    return res.json(genericResponse(safeUser(userJson), responseCodes["200"], "Migrated to vendor successfully"));
  } catch {
    return res.status(500).json(genericResponse(null, responseCodes["500"], "Migration failed"));
  }
};

export const faceVerify = async (req: AuthRequest, res: Response) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Image data is required"));
    }

    if (!imageData.startsWith("data:image/")) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Invalid image format"));
    }

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    await user.update({ faceCaptureVerified: true, faceCaptureImage: imageData });
    const userJson = user.toJSON() as UserAttributes;

    return res.json(
      genericResponse(safeUser(userJson), responseCodes["200"], "Face verification successful")
    );
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Face verification failed"));
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Current and new passwords are required"));
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "New password must be at least 6 characters"));
    }

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json(genericResponse(null, responseCodes["401"], "Current password is incorrect"));
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await user.update({ password: hashed });

    return res.json(genericResponse(null, responseCodes["200"], "Password changed successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to change password"));
  }
};
