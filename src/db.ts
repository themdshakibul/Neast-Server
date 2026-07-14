import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scic3";

export async function connectDB(): Promise<void> {
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
