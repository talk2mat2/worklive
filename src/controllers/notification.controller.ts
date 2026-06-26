import { Response } from "express";
import { Notification } from "../models/notification.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user!.id },
      order: [["createdAt", "DESC"]],
    });

    const parsed = notifications.map((n) => {
      const json = n.toJSON() as any;
      json.data = json.data ? JSON.parse(json.data) : null;
      return json;
    });

    return res.json(genericResponse(parsed, responseCodes["200"], "Notifications retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve notifications"));
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user!.id },
    });

    if (!notification) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Notification not found"));
    }

    await notification.update({ isRead: true });
    return res.json(genericResponse(null, responseCodes["200"], "Notification marked as read"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update notification"));
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user!.id, isRead: false } }
    );
    return res.json(genericResponse(null, responseCodes["200"], "All notifications marked as read"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to update notifications"));
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user!.id },
    });

    if (!notification) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "Notification not found"));
    }

    await notification.destroy();
    return res.json(genericResponse(null, responseCodes["200"], "Notification deleted"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to delete notification"));
  }
};
