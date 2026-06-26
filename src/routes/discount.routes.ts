import { Router } from "express";
import { getDiscounts, createDiscount, deleteDiscount } from "../controllers/discount.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getDiscounts);
router.post("/", authenticate, createDiscount);
router.delete("/:id", authenticate, deleteDiscount);

export default router;
