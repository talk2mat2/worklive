import { Router } from "express";
import {
  getConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/conversation.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getConversations);
router.post("/", authenticate, getOrCreateConversation);
router.get("/:conversationId/messages", authenticate, getConversationMessages);
router.post("/:conversationId/messages", authenticate, sendMessage);
router.put("/:conversationId/read", authenticate, markConversationRead);

export default router;
