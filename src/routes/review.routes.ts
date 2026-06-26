import { Router } from "express";
import { getReviews, createReview, updateReview } from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getReviews);
router.post("/", authenticate, createReview);
router.put("/:reviewId", authenticate, updateReview);

export default router;
