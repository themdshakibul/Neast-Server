import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import itemsRouter from "./routes/items";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/items", itemsRouter);
app.use("/api/auth", authRouter);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
