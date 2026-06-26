import { Router } from "express";
import {
  createUser,
  getUsers,
  loginUser,
  refreshToken,
  getUserById,
  getMe,
  updateMe,
  changePassword,
  faceVerify,
  migrateToVendor,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);

router.get("/", getUsers);
router.get("/me", authenticate, getMe);
router.get("/:userId", getUserById);

router.put("/me", authenticate, updateMe);
router.put("/me/password", authenticate, changePassword);
router.put("/me/face-verify", authenticate, faceVerify);
router.put("/me/migrate", authenticate, migrateToVendor);

export default router;
