import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { logger } from "./utils/logger";
import { genericResponse } from "./utils";
import { responseCodes } from "./utils/responseCodes";

import userRoutes from "./routes/user.routes";
import requestRoutes from "./routes/request.routes";
import offerRoutes from "./routes/offer.routes";
import conversationRoutes from "./routes/conversation.routes";
import notificationRoutes from "./routes/notification.routes";
import reviewRoutes from "./routes/review.routes";
import reportRoutes from "./routes/report.routes";
import discountRoutes from "./routes/discount.routes";

import { setupRequestAssociations } from "./controllers/request.controller";
import { setupOfferAssociations } from "./controllers/offer.controller";
import { setupConversationAssociations } from "./controllers/conversation.controller";
import { setupReviewAssociations } from "./controllers/review.controller";
import { setupDiscountAssociations } from "./controllers/discount.controller";

dotenv.config();

// Initialize Sequelize associations
setupRequestAssociations();
setupOfferAssociations();
setupConversationAssociations();
setupReviewAssociations();
setupDiscountAssociations();

const app = express();

// HTTP request logging — stream morgan output through winston
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.http(msg.trimEnd()) },
  })
);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Auth routes
app.use("/api/v1/users", userRoutes);
app.use("/api/Authentication/refresh-token", (req, res) => {
  req.url = "/refresh-token";
  const { refreshToken } = require("./controllers/user.controller");
  return refreshToken(req, res);
});

// Resource routes
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/offers", offerRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/discounts", discountRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json(genericResponse(null, responseCodes["404"], "Route not found"));
});

// Global error handler — catches any unhandled errors thrown in routes
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json(genericResponse(null, responseCodes["500"], "Internal server error"));
});

export default app;
