import app from "./app";
import { sequelize } from "./config/database";
import dotenv from "dotenv";
dotenv.config(); //

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync(); // only in dev/test
    }
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
})();
