import { Response } from "express";
import { Op } from "sequelize";
import { Offer } from "../models/offer.model";
import { ServiceRequest } from "../models/serviceRequest.model";
import { User } from "../models/user.model";
import { Notification } from "../models/notification.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getOffers = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, vendorId, requestOwnerId } = req.query as Record<string, string>;

    const where: any = {};
    if (requestId) where.requestId = requestId;
    if (vendorId) where.vendorId = vendorId;

    // Get all offers received on requests owned by this user
    if (requestOwnerId) {
      const ownerRequests = await ServiceRequest.findAll({
        where: { userId: requestOwnerId },
        attributes: ["id"],
      });
      const requestIds = ownerRequests.map((r) => r.id);
      if (!requestIds.length) {
        return res.json(genericResponse([], responseCodes["200"], "No offers found"));
      }
      where.requestId = { [Op.in]: requestIds };
    }

    const offers = await Offer.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "vendor",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    return res.json(genericResponse(offers, responseCodes["200"], "Offers retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve offers"));
  }
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.type !== "vendor") {
      return res
        .status(403)
        .json(genericResponse(null, 403, "Only vendors can make offers"));
    }

    const { requestId, amount, description, timeline } = req.body;

    if (!requestId || !amount || !description || !timeline) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Missing required fields"));
    }

    const request = await ServiceRequest.findByPk(requestId);
    if (!request) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Request not found"));
    }

    if (request.status !== "active" || request.expiresAt < new Date()) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "This request is no longer accepting offers"));
    }

    // One offer per vendor per request
    const existing = await Offer.findOne({
      where: { requestId, vendorId: req.user!.id },
    });
    if (existing) {
      return res
        .status(409)
        .json(genericResponse(null, responseCodes["401"], "You have already made an offer on this request"));
    }

    const offer = await Offer.create({
      requestId,
      vendorId: req.user!.id,
      amount,
      description,
      timeline,
      status: "pending",
    });

    // Increment offer count on request
    await request.increment("offerCount");

    // Notify the request owner
    await Notification.create({
      userId: request.userId,
      type: "offer",
      title: "New offer received",
      content: `${req.user!.name} made an offer on your request "${request.title}"`,
      data: JSON.stringify({ offerId: offer.id, requestId }),
    });

    const offerJson = offer.toJSON();
    return res
      .status(201)
      .json(genericResponse(offerJson, responseCodes["200"], "Offer submitted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to create offer"));
  }
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { offerId } = req.params;
    const { status, amount, description, timeline } = req.body;
    const userId = req.user!.id;

    const offer = await Offer.findByPk(offerId);
    if (!offer) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Offer not found"));
    }

    const request = await ServiceRequest.findByPk(offer.requestId);

    // Vendor can withdraw their own offer
    if (status === "withdrawn") {
      if (offer.vendorId !== userId) {
        return res.status(403).json(genericResponse(null, 403, "You can only withdraw your own offers"));
      }
      await offer.update({ status: "withdrawn" });
      if (request) await request.decrement("offerCount");
      return res.json(genericResponse(offer, responseCodes["200"], "Offer withdrawn"));
    }

    // Request owner can accept or reject
    if (status === "accepted" || status === "rejected") {
      if (!request || request.userId !== userId) {
        return res
          .status(403)
          .json(genericResponse(null, 403, "Only the request owner can accept or reject offers"));
      }
      await offer.update({ status });

      // Notify the vendor
      await Notification.create({
        userId: offer.vendorId,
        type: status === "accepted" ? "offer_accepted" : "offer_rejected",
        title: status === "accepted" ? "Offer accepted!" : "Offer rejected",
        content:
          status === "accepted"
            ? `Your offer on "${request?.title}" was accepted`
            : `Your offer on "${request?.title}" was rejected`,
        data: JSON.stringify({ offerId: offer.id, requestId: offer.requestId }),
      });

      return res.json(genericResponse(offer, responseCodes["200"], `Offer ${status}`));
    }

    // Vendor can update their pending offer details
    if (offer.vendorId === userId && offer.status === "pending") {
      await offer.update({
        ...(amount && { amount }),
        ...(description && { description }),
        ...(timeline && { timeline }),
      });
      return res.json(genericResponse(offer, responseCodes["200"], "Offer updated"));
    }

    return res
      .status(400)
      .json(genericResponse(null, responseCodes["400"], "Invalid update operation"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update offer"));
  }
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Offer not found"));
    }

    if (offer.vendorId !== req.user!.id) {
      return res.status(403).json(genericResponse(null, 403, "You can only delete your own offers"));
    }

    const request = await ServiceRequest.findByPk(offer.requestId);
    await offer.destroy();
    if (request) await request.decrement("offerCount");

    return res.json(genericResponse(null, responseCodes["200"], "Offer deleted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to delete offer"));
  }
};

export const setupOfferAssociations = () => {
  Offer.belongsTo(User, { foreignKey: "vendorId", as: "vendor" });
  Offer.belongsTo(ServiceRequest, { foreignKey: "requestId", as: "request" });
};
