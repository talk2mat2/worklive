import { Router } from "express";
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} from "../controllers/request.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getRequests);
router.get("/:requestId", getRequestById);

router.post("/", authenticate, createRequest);
router.put("/:requestId", authenticate, updateRequest);
router.delete("/:requestId", authenticate, deleteRequest);

export default router;
