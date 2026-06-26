import { Response } from "express";
import { Op } from "sequelize";
import { Conversation, ConversationParticipant } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";
import { Notification } from "../models/notification.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all conversation IDs the user participates in
    const participations = await ConversationParticipant.findAll({
      where: { userId },
    });
    const conversationIds = participations.map((p) => p.conversationId);

    if (!conversationIds.length) {
      return res.json(genericResponse([], responseCodes["200"], "Conversations retrieved"));
    }

    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: conversationIds } },
      order: [["updatedAt", "DESC"]],
    });

    // Enrich each conversation with participants and last message
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const json = conv.toJSON() as any;

        const parts = await ConversationParticipant.findAll({
          where: { conversationId: conv.id },
        });
        const participantUsers = await User.findAll({
          where: { id: { [Op.in]: parts.map((p) => p.userId) } },
          attributes: { exclude: ["password"] },
        });

        const myPart = parts.find((p) => p.userId === userId);
        json.unreadCount = myPart?.unreadCount || 0;
        json.participantIds = parts.map((p) => p.userId);
        json.participants = participantUsers;

        const lastMsg = await Message.findOne({
          where: { conversationId: conv.id },
          order: [["createdAt", "DESC"]],
        });
        json.lastMessage = lastMsg || null;

        return json;
      })
    );

    return res.json(genericResponse(enriched, responseCodes["200"], "Conversations retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve conversations"));
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { otherUserId, requestId, offerId } = req.body;

    if (!otherUserId) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "otherUserId is required"));
    }

    const otherUser = await User.findByPk(otherUserId, {
      attributes: { exclude: ["password"] },
    });
    if (!otherUser) {
      return res
        .status(404)
        .json(genericResponse(null, responseCodes["404"], "User not found"));
    }

    // Find existing conversation between these two users
    const myParts = await ConversationParticipant.findAll({ where: { userId } });
    const myConvIds = myParts.map((p) => p.conversationId);

    const otherParts = await ConversationParticipant.findAll({
      where: { userId: otherUserId, conversationId: { [Op.in]: myConvIds } },
    });

    let conversationId = otherParts[0]?.conversationId;

    if (!conversationId) {
      // Create new conversation
      const conv = await Conversation.create({
        requestId: requestId || undefined,
        offerId: offerId || undefined,
      });
      conversationId = conv.id;

      await ConversationParticipant.bulkCreate([
        { conversationId, userId, unreadCount: 0 },
        { conversationId, userId: otherUserId, unreadCount: 0 },
      ]);
    }

    const conversation = await Conversation.findByPk(conversationId);
    return res
      .status(201)
      .json(genericResponse(conversation, responseCodes["200"], "Conversation ready"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to get or create conversation"));
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    // Verify the user is a participant
    const participation = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });
    if (!participation) {
      return res
        .status(403)
        .json(genericResponse(null, 403, "You are not a participant in this conversation"));
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    return res.json(genericResponse(messages, responseCodes["200"], "Messages retrieved successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to retrieve messages"));
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;
    const { content, attachments } = req.body;

    if (!content) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Message content is required"));
    }

    const participation = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });
    if (!participation) {
      return res
        .status(403)
        .json(genericResponse(null, 403, "You are not a participant in this conversation"));
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content,
      attachments: attachments ? JSON.stringify(attachments) : undefined,
      isRead: false,
    });

    // Increment unread count for other participants
    await ConversationParticipant.increment("unreadCount", {
      where: { conversationId, userId: { [Op.ne]: userId } },
    });

    // Update conversation's updatedAt
    await Conversation.update({ updatedAt: new Date() } as any, { where: { id: conversationId } });

    // Notify other participants
    const otherParts = await ConversationParticipant.findAll({
      where: { conversationId, userId: { [Op.ne]: userId } },
    });
    await Promise.all(
      otherParts.map((p) =>
        Notification.create({
          userId: p.userId,
          type: "message",
          title: "New message",
          content: `${req.user!.name}: ${content.substring(0, 60)}${content.length > 60 ? "..." : ""}`,
          data: JSON.stringify({ conversationId, messageId: message.id }),
        })
      )
    );

    return res
      .status(201)
      .json(genericResponse(message, responseCodes["200"], "Message sent successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to send message"));
  }
};

export const markConversationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    await ConversationParticipant.update(
      { unreadCount: 0 },
      { where: { conversationId, userId } }
    );

    await Message.update(
      { isRead: true },
      { where: { conversationId, senderId: { [Op.ne]: userId }, isRead: false } }
    );

    return res.json(genericResponse(null, responseCodes["200"], "Conversation marked as read"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to mark conversation as read"));
  }
};

export const setupConversationAssociations = () => {
  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
};
