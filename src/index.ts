import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import itemsRouter from "./routes/items";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/items", itemsRouter);
app.use("/api/auth", authRouter);

let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

// Local dev: listen directly
if (process.env.VERCEL !== "1") {
  ensureDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export { ensureDB };
export default app;
