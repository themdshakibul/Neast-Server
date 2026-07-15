const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be set");
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",").map(s => s.trim());

const app = express();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set");
    return;
  }
  await mongoose.connect(MONGODB_URI);
}

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    price: { type: Number, required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number, default: 0 },
    userId: { type: String, required: true, default: "demo-user-123" },
    status: { type: String, default: "pending", enum: ["pending", "approved"] },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/items", async (_req, res) => {
  try {
    await connectDB();
    const items = await Item.find({ status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: String(err) });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    await connectDB();
    const item = await Item.findById(req.params.id);
    if (!item) { res.status(404).json({ message: "Item not found" }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item", error: String(err) });
  }
});

app.post("/api/items", authenticate, async (req, res) => {
  try {
    await connectDB();
    const { title, shortDescription, fullDescription, price, date, category, imageUrl } = req.body;
    const item = new Item({ title, shortDescription, fullDescription, price, date, category, imageUrl, userId: req.userId, status: "pending" });
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating item", error: String(err) });
  }
});

app.put("/api/items/:id", authenticate, async (req, res) => {
  try {
    await connectDB();
    const item = await Item.findById(req.params.id);
    if (!item) { res.status(404).json({ message: "Item not found" }); return; }
    if (item.userId !== req.userId) { res.status(403).json({ message: "Not authorized" }); return; }
    const { title, shortDescription, fullDescription, price, date, category, imageUrl } = req.body;
    const updated = await Item.findByIdAndUpdate(req.params.id, { title, shortDescription, fullDescription, price, date, category, imageUrl }, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: String(err) });
  }
});

app.delete("/api/items/:id", authenticate, async (req, res) => {
  try {
    await connectDB();
    const item = await Item.findById(req.params.id);
    if (!item) { res.status(404).json({ message: "Item not found" }); return; }
    if (item.userId !== req.userId) { res.status(403).json({ message: "Not authorized" }); return; }
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: String(err) });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) { res.status(400).json({ message: "Email already in use" }); return; }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: String(err) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) { res.status(400).json({ message: "Invalid email or password" }); return; }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { res.status(400).json({ message: "Invalid email or password" }); return; }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: String(err) });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.userId).select("-password");
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: String(err) });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

module.exports = async function handler(req, res) {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  return app(req, res);
};
