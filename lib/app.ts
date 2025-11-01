import { configDotenv } from "dotenv";
import express, { Application } from "express";
import cors from "cors";

configDotenv({ path: ".env.local" });

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_, res) => {
  res.send("Chat app server is running 🚀🚀");
});

app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;