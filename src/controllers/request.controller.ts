import { Response } from "express";
import { Op } from "sequelize";
import { logger } from "../utils/logger";
import { ServiceRequest } from "../models/serviceRequest.model";
import { User } from "../models/user.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { category, serviceType, search, userId, status } = req.query as Record<string, string>;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else {
      // Public listing: only active non-expired requests
      where.status = status || "active";
      where.expiresAt = { [Op.gt]: new Date() };
    }

    if (category) where.category = category;
    if (serviceType) where.serviceType = serviceType;

    if (search) {
      where[Op.or as any] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    const requests = await ServiceRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    const parsed = requests.map((r) => {
      const json = r.toJSON() as any;
      json.images = json.images ? JSON.parse(json.images) : [];
      json.budget = {
        min: json.budgetMin,
        max: json.budgetMax,
        type: json.budgetType,
      };
      return json;
    });

    return res.json(genericResponse(parsed, responseCodes["200"], "Requests retrieved successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve requests"));
  }
};

export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (!request) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Request not found"));
    }

    const json = request.toJSON() as any;
    json.images = json.images ? JSON.parse(json.images) : [];
    json.budget = { min: json.budgetMin, max: json.budgetMax, type: json.budgetType };

    return res.json(genericResponse(json, responseCodes["200"], "Request retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve request"));
  }
};

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, budget, location, serviceType, biddingDuration, images } =
      req.body;

    if (!title || !description || !category || !location || !serviceType) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Missing required fields"));
    }

    const durationHours = parseInt(biddingDuration) || 24;
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const request = await ServiceRequest.create({
      title,
      description,
      category,
      budgetMin: budget?.min,
      budgetMax: budget?.max,
      budgetType: budget?.type || "negotiable",
      location,
      serviceType,
      userId: req.user!.id,
      status: "active",
      expiresAt,
      images: images ? JSON.stringify(images) : undefined,
    });

    const json = request.toJSON() as any;
    json.images = json.images ? JSON.parse(json.images) : [];
    json.budget = { min: json.budgetMin, max: json.budgetMax, type: json.budgetType };

    return res
      .status(201)
      .json(genericResponse(json, responseCodes["200"], "Request created successfully"));
  } catch (err) {
    logger.error("createRequest failed", { error: (err as Error).message });
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to create request"));
  }
};

export const updateRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findByPk(requestId);

    if (!request) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Request not found"));
    }

    if (request.userId !== req.user!.id) {
      return res
        .status(403)
        .json(genericResponse(null, 403, "You can only edit your own requests"));
    }

    const { title, description, category, budget, location, serviceType, images } = req.body;

    await request.update({
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(location && { location }),
      ...(serviceType && { serviceType }),
      ...(budget?.min !== undefined && { budgetMin: budget.min }),
      ...(budget?.max !== undefined && { budgetMax: budget.max }),
      ...(budget?.type && { budgetType: budget.type }),
      ...(images !== undefined && { images: JSON.stringify(images) }),
    });

    const json = request.toJSON() as any;
    json.images = json.images ? JSON.parse(json.images) : [];
    json.budget = { min: json.budgetMin, max: json.budgetMax, type: json.budgetType };

    return res.json(genericResponse(json, responseCodes["200"], "Request updated successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update request"));
  }
};

export const deleteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findByPk(requestId);

    if (!request) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Request not found"));
    }

    if (request.userId !== req.user!.id) {
      return res
        .status(403)
        .json(genericResponse(null, 403, "You can only delete your own requests"));
    }

    await request.destroy();
    return res.json(genericResponse(null, responseCodes["200"], "Request deleted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to delete request"));
  }
};

// Setup associations (call once during model initialization)
export const setupRequestAssociations = () => {
  ServiceRequest.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(ServiceRequest, { foreignKey: "userId", as: "requests" });
};
