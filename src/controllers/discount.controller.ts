import { Request, Response } from "express";
import { Op } from "sequelize";
import { Discount } from "../models/discount.model";
import { User } from "../models/user.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDiscounts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.query as Record<string, string>;

    const where: any = {
      expiresAt: { [Op.gt]: new Date() },
    };
    if (vendorId) where.vendorId = vendorId;

    const discounts = await Discount.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "vendor",
          attributes: ["id", "name", "profilePicture", "businessName"],
        },
      ],
    });

    return res.json(genericResponse(discounts, responseCodes["200"], "Discounts retrieved successfully"));
  } catch (err) {
    console.error("getDiscounts error:", err);
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve discounts"));
  }
};

export const createDiscount = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.type !== "vendor") {
      return res
        .status(403)
        .json(genericResponse(null, responseCodes["401"], "Only vendors can post discounts"));
    }

    const { title, description, originalPrice, discountedPrice, image, category, duration } = req.body;

    if (!title || !description || !originalPrice || !discountedPrice) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "title, description, originalPrice and discountedPrice are required"));
    }

    const orig = parseFloat(originalPrice);
    const disc = parseFloat(discountedPrice);

    if (disc >= orig) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Discounted price must be less than original price"));
    }

    const discountPercent = Math.round(((orig - disc) / orig) * 100);
    const days = parseInt(duration) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const discount = await Discount.create({
      vendorId: req.user!.id,
      title,
      description,
      originalPrice: orig,
      discountedPrice: disc,
      discountPercent,
      image: image || null,
      category: category || null,
      expiresAt,
    });

    // Reload with vendor association
    const full = await Discount.findByPk(discount.id, {
      include: [{ model: User, as: "vendor", attributes: ["id", "name", "profilePicture", "businessName"] }],
    });

    return res.json(genericResponse(full, responseCodes["200"], "Discount posted successfully"));
  } catch (err) {
    console.error("createDiscount error:", err);
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to create discount"));
  }
};

export const deleteDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findOne({ where: { id, vendorId: req.user!.id } });

    if (!discount) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Discount not found or not yours"));
    }

    await discount.destroy();
    return res.json(genericResponse(null, responseCodes["200"], "Discount deleted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to delete discount"));
  }
};

export const setupDiscountAssociations = () => {
  Discount.belongsTo(User, { foreignKey: "vendorId", as: "vendor" });
};
