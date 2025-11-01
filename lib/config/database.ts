import { configDotenv } from "dotenv";
import { Sequelize } from "sequelize";

configDotenv({ path: ".env.local" });

const sequelize = new Sequelize(process.env.DB as string, {
  dialect: "postgres",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};