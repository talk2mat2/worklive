import { Router } from "express";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offer.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getOffers);
router.post("/", authenticate, createOffer);
router.put("/:offerId", authenticate, updateOffer);
router.delete("/:offerId", authenticate, deleteOffer);

export default router;
