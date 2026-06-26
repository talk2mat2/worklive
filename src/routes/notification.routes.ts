import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getNotifications);
router.put("/read-all", authenticate, markAllNotificationsRead);
router.put("/:notificationId/read", authenticate, markNotificationRead);
router.delete("/:notificationId", authenticate, deleteNotification);

export default router;
