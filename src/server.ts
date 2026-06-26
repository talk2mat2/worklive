import app from "./app";
import { sequelize } from "./config/database";
import { logger } from "./utils/logger";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
  } catch (err) {
    logger.error("Unable to connect to database", { error: err });
    process.exit(1);
  }
})();
