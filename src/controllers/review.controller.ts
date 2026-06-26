import { Response } from "express";
import { Review } from "../models/review.model";
import { User } from "../models/user.model";
import { Notification } from "../models/notification.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { revieweeId, reviewerId } = req.query as Record<string, string>;

    if (!revieweeId && !reviewerId) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "revieweeId or reviewerId is required"));
    }

    const where: any = {};
    if (revieweeId) where.revieweeId = revieweeId;
    if (reviewerId) where.reviewerId = reviewerId;

    const reviews = await Review.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    return res.json(genericResponse(reviews, responseCodes["200"], "Reviews retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve reviews"));
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { revieweeId, rating, comment, type } = req.body;
    const reviewerId = req.user!.id;

    if (!revieweeId || !rating || !comment || !type) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Missing required fields"));
    }

    if (reviewerId === revieweeId) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "You cannot review yourself"));
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Rating must be between 1 and 5"));
    }

    const existing = await Review.findOne({ where: { reviewerId, revieweeId } });
    if (existing) {
      return res
        .status(409)
        .json(genericResponse(null, responseCodes["401"], "You have already reviewed this user"));
    }

    const review = await Review.create({ reviewerId, revieweeId, rating, comment, type });

    // Notify the reviewee
    await Notification.create({
      userId: revieweeId,
      type: "review",
      title: "New review received",
      content: `${req.user!.name} left you a ${rating}-star review`,
      data: JSON.stringify({ reviewId: review.id }),
    });

    return res
      .status(201)
      .json(genericResponse(review, responseCodes["200"], "Review submitted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to submit review"));
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findOne({
      where: { id: reviewId, reviewerId: req.user!.id },
    });

    if (!review) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Review not found or not yours"));
    }

    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Rating must be between 1 and 5"));
    }

    await review.update({
      ...(rating && { rating }),
      ...(comment && { comment }),
    });

    return res.json(genericResponse(review, responseCodes["200"], "Review updated successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update review"));
  }
};

export const setupReviewAssociations = () => {
  Review.belongsTo(User, { foreignKey: "reviewerId", as: "reviewer" });
  Review.belongsTo(User, { foreignKey: "revieweeId", as: "reviewee" });
};
