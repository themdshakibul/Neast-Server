import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set. Run from backend/ so dotenv finds backend/.env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected:", MONGODB_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err);
  });
}
